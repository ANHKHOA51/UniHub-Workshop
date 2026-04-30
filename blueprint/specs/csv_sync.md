# Đặc tả: Luồng đồng bộ dữ liệu sinh viên từ CSV

## Mô tả:

Hệ thống UniHub Workshop cần xác thực thông tin sinh viên khi đăng ký, tuy nhiên hệ thống quản lý sinh viên cũ của trường không cung cấp API trực tiếp. Do đó, hệ thống thực hiện đồng bộ dữ liệu thông qua file CSV được xuất định kỳ hàng đêm từ hệ thống cũ. Luồng này đảm bảo dữ liệu sinh viên luôn được cập nhật mới nhất để phục vụ việc xác thực mà không làm gián đoạn các dịch vụ đang chạy.

## Luồng chính:

- Hệ thống cũ tự động xuất file danh sách sinh viên định kỳ (ví dụ: 2:00 sáng) vào thư mục lưu trữ được cấu hình trước.
- **CSV Import Worker** (một tiến trình riêng biệt) được kích hoạt theo lịch trình (Cron Job) thông qua BullMQ.
- Worker kiểm tra sự tồn tại của file mới. Nếu có, tiến trình bắt đầu đọc file bằng cơ chế **Streaming** (đọc theo luồng) để tối ưu hóa bộ nhớ, tránh nạp toàn bộ file lớn vào RAM.
- Dữ liệu được xử lý theo từng **Batch** (ví dụ: mỗi lô 1.000 bản ghi) để giảm số lượng transaction và tránh khóa bảng database quá lâu.
- Với mỗi lô dữ liệu, Worker thực hiện:
    - Kiểm tra tính hợp lệ sơ bộ của từng dòng (đúng định dạng Email, MSSV, Họ tên).
    - Sử dụng lệnh **UPSERT** (Insert on Conflict Update) vào PostgreSQL để đảm bảo nếu sinh viên đã tồn tại thì cập nhật thông tin mới, nếu chưa có thì thêm mới.
- Sau khi hoàn tất xử lý file, Worker thực hiện:
    - Ghi nhận kết quả vào bảng `SyncLogs` (bao gồm: thời gian bắt đầu/kết thúc, tổng số dòng, số dòng thành công, số dòng lỗi, đường dẫn file nguồn).
    - Phát Event `CSV_SYNC_COMPLETED` vào Event Broker.
- Một Worker khác lắng nghe sự kiện này và gửi thông báo kết quả (Email hoặc Telegram) cho Ban tổ chức để theo dõi tình trạng dữ liệu.

## Kịch bản lỗi:

- **File CSV sai định dạng hoặc trống:** Worker ghi nhận lỗi vào log hệ thống, phát cảnh báo khẩn cấp cho Admin và dừng tiến trình (fail-fast) để tránh làm hỏng dữ liệu hiện có.
- **Dữ liệu trong dòng bị lỗi (Ví dụ: Email sai format):** Worker bỏ qua dòng lỗi đó, tăng biến đếm lỗi và tiếp tục xử lý các dòng tiếp theo trong Batch. Thông tin về dòng lỗi sẽ được lưu lại trong chi tiết của `SyncLogs`.
- **Worker bị crash hoặc mất kết nối Database giữa chừng:** Nhờ cơ chế của BullMQ, job sẽ được retry sau một khoảng thời gian. Do sử dụng lệnh UPSERT (Idempotent), việc chạy lại job sẽ không gây ra dữ liệu trùng lặp hoặc rác trong hệ thống.
- **Dung lượng file quá lớn:** Nếu file vượt quá ngưỡng an toàn, hệ thống sẽ thực hiện chia nhỏ file hoặc tăng giới hạn tài nguyên cho Worker để xử lý ổn định.

## Ràng buộc:

- Quá trình đồng bộ chỉ diễn ra một chiều từ hệ thống cũ sang UniHub Workshop.
- **Idempotency:** Việc import cùng một file nhiều lần phải cho ra kết quả dữ liệu cuối cùng giống hệt nhau.
- **Hiệu suất:** Không được làm tăng độ trễ (latency) của các API nghiệp vụ chính (Đăng ký, Xem Workshop) trong khi đang đồng bộ.
- Thời gian lưu trữ `SyncLogs` chi tiết tối thiểu là 30 ngày để đối soát.

## Tiêu chí chấp nhận:

- Hệ thống xử lý được file dữ liệu lên tới hàng chục nghìn sinh viên mà không gây ra lỗi Out of Memory (RAM sử dụng ổn định dưới mức ngưỡng cấu hình).
- Toàn bộ sinh viên hợp lệ trong file CSV phải được tìm thấy trong hệ thống UniHub Workshop sau khi đồng bộ thành công.
- Ban tổ chức nhận được thông báo tổng kết sau mỗi lần đồng bộ (thành công/thất bại).
- Không có dữ liệu trùng lặp được tạo ra ngay cả khi tiến trình bị gián đoạn và chạy lại.
