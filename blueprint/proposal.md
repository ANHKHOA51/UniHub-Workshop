# UniHub Workshop — Project Proposal

## Vấn đề
Hiện tại, Trường Đại học A đang tổ chức sự kiện "Tuần lễ kỹ năng và nghề nghiệp" bằng cách sử dụng Google Form để quản lý đăng ký và gửi thông báo qua email một cách thủ công. 
Với quy mô ngày càng mở rộng (kéo dài 5 ngày, mỗi ngày 8–12 workshop diễn ra song song), quy trình thủ công này bộc lộ những nhược điểm nghiêm trọng:
- Dễ sai sót, mất nhiều thời gian của Ban tổ chức.
- Không kiểm soát tốt được số lượng chỗ ngồi thực tế dẫn đến tình trạng quá tải phòng học.
- Trải nghiệm đăng ký của sinh viên kém do không có thông tin real-time về số lượng chỗ còn lại.
- Nhân sự check-in gặp khó khăn trong việc kiểm tra danh sách tại cửa lớp.

## Mục tiêu
Xây dựng một hệ thống phần mềm **UniHub Workshop** số hóa toàn bộ quy trình:
1. **Quản trị dễ dàng với kiểm soát truy cập chặt chẽ:** Cho phép Ban tổ chức tạo, quản lý và theo dõi thông tin workshop tập trung. Hệ thống phải kiểm soát quyền truy cập với ba nhóm người dùng khác nhau (Sinh viên, Ban tổ chức, Nhân sự check-in), mỗi nhóm có quyền hạn riêng biệt.
2. **Đăng ký công bằng, chịu tải cao:** Đáp ứng được lượng tải đột biến lên đến 12.000 sinh viên truy cập trong 10 phút đầu (đặc biệt 60% dồn vào 3 phút đầu) mà hệ thống không bị sập. Giải quyết được bài toán tranh chấp chỗ ngồi (cạnh tranh slot cuối cùng).
3. **Thanh toán ổn định:** Tích hợp thanh toán an toàn, không bị trừ tiền hai lần dù có retry từ client (sử dụng Idempotency Key). Hệ thống phải hoạt động tốt ngay cả khi cổng thanh toán (MoMo) gặp sự cố.
4. **Tiện lợi cho người tham gia:** Sinh viên nhận vé QR code tự động, xem lịch workshop rõ ràng (bao gồm diễn giả, phòng tổ chức, sơ đồ phòng, số chỗ còn lại theo thời gian thực), và đọc được tóm tắt nội dung workshop (được tạo tự động từ PDF bằng AI).
5. **Check-in thông minh:** Nhân sự có thể check-in bằng app mobile qua QR code, đặc biệt phải hoạt động trơn tru ngay cả ở các khu vực mất kết nối mạng.

## Người dùng và nhu cầu
- **Sinh viên:** 
  - Xem lịch workshop rõ ràng, bao gồm diễn giả, phòng tổ chức, sơ đồ phòng, số chỗ còn lại theo thời gian thực.
  - Đăng ký dễ dàng (có phí hoặc miễn phí), nhận xác nhận tức thì.
  - Nhận thông báo nhanh chóng qua app và email sau khi đăng ký thành công.
  - Check-in thuận tiện bằng mã QR tại cửa phòng.
- **Ban tổ chức:** 
  - Tạo workshop mới, cập nhật thông tin, đổi phòng, đổi giờ, hoặc hủy workshop.
  - Upload file PDF giới thiệu workshop, hệ thống tự động tách nội dung, làm sạch văn bản và tạo tóm tắt bằng AI.
  - Xem thống kê số lượng đăng ký chi tiết, theo dõi tình hình workshop.
  - Truy cập admin page chỉ dành cho nội bộ với quyền hạn tối đa.
- **Nhân sự check-in:** 
  - Dùng ứng dụng di động gọn nhẹ để quét mã QR sinh viên tại cửa phòng.
  - Ghi nhận check-in thành công, thậm chí khi không có kết nối mạng.
  - Dữ liệu check-in tự động đồng bộ lại khi kết nối được phục hồi.

## Phạm vi
- **Trong phạm vi:** 
  - Backend API quản lý toàn bộ nghiệp vụ, bao gồm cơ chế bảo vệ (Rate limiting, Circuit breaker) và Row-level locking để xử lý tranh chấp chỗ ngồi.
  - Web App cho Sinh viên (xem lịch, đăng ký, nhận thông báo) và Admin (quản lý workshop, upload PDF, xem thống kê).
  - Mobile App cho Nhân sự check-in (quét QR code, hỗ trợ hoạt động offline).
  - Tích hợp AI (OpenRouter) để tách nội dung PDF, làm sạch văn bản, và tạo tóm tắt tự động.
  - Tích hợp cổng thanh toán Sandbox (MoMo) với cơ chế Idempotency Key để chống trừ tiền hai lần.
  - Job đồng bộ dữ liệu sinh viên từ file CSV ban đêm (xử lý lỗi format, trùng lặp mà không gián đoạn API chính).
  - Hệ thống thông báo được thiết kế để dễ dàng mở rộng thêm kênh (ví dụ: Telegram) trong tương lai mà không cần thay đổi lớn.
- **Ngoài phạm vi:** 
  - Triển khai lên hệ thống Production hạ tầng thật (chỉ cung cấp Docker Compose chạy local).
  - Cổng thanh toán thực (dùng Sandbox cho testing).

## Rủi ro và ràng buộc
- **Tranh chấp chỗ ngồi:** Nhiều sinh viên cùng ấn đăng ký cho một slot cuối cùng — hệ thống phải đảm bảo không có hai sinh viên nào cùng nhận được chỗ cuối cùng.
- **Tải trọng đột biến:** Dự kiến 12.000 sinh viên truy cập trong 10 phút đầu mở đăng ký, trong đó 60% dồn vào 3 phút đầu tiên. Hệ thống cần cơ chế bảo vệ backend API từ bị quá tải, ngăn chặn các client gửi request liên tục và đảm bảo tính công bằng giữa các sinh viên.
- **Cổng thanh toán không ổn định:** Cổng thanh toán có thể bị timeout, lỗi kết nối kéo dài. Luồng đăng ký không có phí vẫn phải hoạt động bình thường, và luồng đăng ký có phí cần xử lý gracefully mà không gây ra trừ tiền hai lần dù client retry.
- **Chống trừ tiền hai lần:** Khi thanh toán timeout hoặc có lỗi mạng, client có thể retry — hệ thống phải đảm bảo giao dịch chỉ được thực hiện đúng một lần (sử dụng Idempotency Key).
- **Check-in offline:** Nhân sự ở khu vực mất mạng vẫn phải check-in được cho sinh viên. Dữ liệu check-in ghi nhận offline phải không bị mất khi kết nối được phục hồi.
- **Tích hợp một chiều CSV:** Không thể gọi API của hệ thống cũ — chỉ có thể đọc file CSV được export theo lịch cố định. Luồng nhập dữ liệu phải xử lý được file lỗi, dữ liệu trùng lặp và không làm gián đoạn hệ thống đang chạy.
