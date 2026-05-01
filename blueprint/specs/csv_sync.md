# Đặc tả: Luồng đồng bộ dữ liệu sinh viên từ CSV

Hệ thống UniHub Workshop cần xác thực thông tin sinh viên khi đăng ký. Do hệ thống cũ không có API, UniHub sẽ thực hiện tích hợp một chiều (One-way Integration) thông qua file CSV được xuất định kỳ hàng đêm. Luồng này được thiết kế để xử lý lượng lớn dữ liệu mà không làm gián đoạn các dịch vụ đang chạy.

## Các thành phần tham gia:

- **Legacy System:** Hệ thống cũ của trường, thực hiện export file CSV.
- **CSV Import Worker:** Tiến trình chạy nền (Worker) xử lý việc đọc và lưu dữ liệu.
- **Primary Database (PostgreSQL):** Lưu trữ thông tin sinh viên sau khi đồng bộ.
- **Event Broker (Redis):** Quản lý hàng đợi tác vụ và phát các sự kiện sau khi hoàn tất.
- **Notification Service:** Thành phần gửi thông báo kết quả (Email, Telegram, v.v.).

## Luồng chính:

- Hệ thống cũ tự động xuất file danh sách sinh viên định kỳ (ví dụ: 2:00 sáng) vào thư mục lưu trữ được cấu hình trước.
- **CSV Import Worker** (một tiến trình riêng biệt) được kích hoạt theo lịch trình (Cron Job) thông qua BullMQ.
- Worker kiểm tra sự tồn tại của file mới. Nếu có, tiến trình bắt đầu đọc file bằng cơ chế **Streaming** (đọc theo luồng) để tối ưu hóa bộ nhớ, tránh nạp toàn bộ file lớn vào RAM.
- Dữ liệu được xử lý theo từng **Batch** (ví dụ: mỗi lô 1.000 bản ghi) để giảm số lượng transaction và tránh khóa bảng database quá lâu.
- Với mỗi lô dữ liệu, Worker thực hiện:
    - Kiểm tra tính hợp lệ sơ bộ của từng dòng (đúng định dạng Email, MSSV, Họ tên).
    - Sử dụng lệnh **UPSERT** (Insert on Conflict Update) vào PostgreSQL để đảm bảo tính nhất quán (Idempotency).
- **Hoàn tất và Thông báo:**
    - Sau khi xử lý xong, Worker phát sự kiện `CSV_SYNC_COMPLETED` vào Event Broker kèm theo thông tin tổng kết (tổng số dòng, thành công, lỗi).
    - Hệ thống thông báo (Notification Service) lắng nghe sự kiện để gửi báo cáo cho Ban tổ chức qua các kênh đã cấu hình (Email/Telegram), cho phép dễ dàng mở rộng thêm kênh mới sau này.

## Kịch bản lỗi:

- **File CSV sai định dạng hoặc trống:** Worker ghi nhận lỗi vào log hệ thống, phát cảnh báo khẩn cấp cho Admin và dừng tiến trình (fail-fast) để tránh làm hỏng dữ liệu hiện có.
- **Dữ liệu trong dòng bị lỗi (Ví dụ: Email sai format):** Worker bỏ qua dòng lỗi đó, tăng biến đếm lỗi và tiếp tục xử lý các dòng tiếp theo trong Batch. Thông tin tổng hợp về số lượng lỗi sẽ được bao gồm trong thông báo cuối cùng.
- **Worker bị crash hoặc mất kết nối Database giữa chừng:** Nhờ cơ chế của BullMQ, job sẽ được retry sau một khoảng thời gian. Do sử dụng lệnh UPSERT (Idempotent), việc chạy lại job sẽ không gây ra dữ liệu trùng lặp hoặc rác trong hệ thống.
- **Dung lượng file quá lớn:** Nếu file vượt quá ngưỡng an toàn, hệ thống sẽ thực hiện chia nhỏ file hoặc tăng giới hạn tài nguyên cho Worker để xử lý ổn định.
## Ràng buộc:

- **Tích hợp một chiều:** Không thể gọi API ngược lại hệ thống cũ; chỉ đọc file theo lịch cố định.
- **Idempotency:** Việc xử lý cùng một file nhiều lần (hoặc retry khi lỗi) không gây ra dữ liệu trùng lặp hoặc sai lệch.
- **Isolation:** Tiến trình đồng bộ chạy trên Worker riêng biệt, không tiêu tốn tài nguyên của API Server phục vụ sinh viên.

## Tiêu chí chấp nhận:

- Hệ thống xử lý được file dữ liệu lên tới hàng chục nghìn sinh viên mà không gây ra lỗi Out of Memory (RAM sử dụng ổn định dưới mức ngưỡng cấu hình).
- Toàn bộ sinh viên hợp lệ trong file CSV phải được tìm thấy trong hệ thống UniHub Workshop sau khi đồng bộ thành công.
- Ban tổ chức nhận được thông báo tổng kết sau mỗi lần đồng bộ (thành công/thất bại).
- Không có dữ liệu trùng lặp được tạo ra ngay cả khi tiến trình bị gián đoạn và chạy lại.
