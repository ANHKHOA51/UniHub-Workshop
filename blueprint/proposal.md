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
1. **Quản trị dễ dàng:** Cho phép Ban tổ chức tạo, quản lý và theo dõi thông tin workshop tập trung.
2. **Đăng ký công bằng, chịu tải cao:** Đáp ứng được lượng tải đột biến lên đến 12.000 sinh viên truy cập trong 10 phút đầu (đặc biệt 60% dồn vào 3 phút đầu) mà hệ thống không bị sập. Giải quyết được bài toán tranh chấp chỗ ngồi (cạnh tranh slot cuối cùng).
3. **Thanh toán ổn định:** Tích hợp thanh toán an toàn, không bị trừ tiền hai lần dù mạng lỗi, hệ thống phải hoạt động tốt ngay cả khi cổng thanh toán thứ 3 (MoMo) gặp sự cố.
4. **Tiện lợi cho người tham gia:** Nhận vé QR code tự động, nắm bắt lịch trình và đọc được tóm tắt nội dung workshop (được tạo tự động bởi AI).
5. **Check-in thông minh:** Nhân sự có thể check-in bằng app mobile qua QR code, đặc biệt phải hoạt động trơn tru ngay cả ở các khu vực mất kết nối mạng.

## Người dùng và nhu cầu
- **Sinh viên:** Cần xem lịch workshop rõ ràng, số chỗ còn lại theo thời gian thực. Đăng ký dễ dàng, nhận thông báo (email/app) nhanh chóng và check-in thuận tiện bằng mã QR.
- **Ban tổ chức:** Cần công cụ tạo và quản lý workshop (đổi phòng, giờ, hủy lịch), upload tài liệu PDF để AI tự động tóm tắt, xem thống kê số lượng đăng ký.
- **Nhân sự check-in:** Cần một ứng dụng di động gọn nhẹ để quét mã QR nhanh chóng tại cửa phòng, đảm bảo không bỏ sót ai dù mạng chập chờn.

## Phạm vi
- **Trong phạm vi:** 
  - Backend API quản lý nghiệp vụ, Rate limiting, Circuit breaker, Row-level locking.
  - Web App cho Sinh viên và Admin.
  - Mobile App quét QR code (có tính năng lưu trữ Offline).
  - Tích hợp AI (OpenRouter) tóm tắt file PDF.
  - Tích hợp cổng thanh toán Sandbox (MoMo).
  - Job đồng bộ dữ liệu sinh viên từ file CSV ban đêm.
- **Ngoài phạm vi:** 
  - Triển khai lên hệ thống Production hạ tầng thật (chỉ cung cấp Docker Compose chạy local).
  - Cổng thanh toán thật (dùng Sandbox).

## Rủi ro và ràng buộc
- **Tranh chấp chỗ ngồi:** Nhiều người cùng ấn đăng ký cho một slot cuối cùng.
- **Tải trọng đột biến:** 12.000 requests đăng ký và xem lịch cùng lúc.
- **Cổng thanh toán không ổn định:** Có thể bị timeout, lỗi kết nối.
- **Check-in offline:** Dữ liệu check-in có thể bị mất nếu app bị tắt đột ngột trước khi có mạng để đồng bộ.
- **Tích hợp một chiều CSV:** Dữ liệu có thể chứa lỗi format, trùng lặp cần được bóc tách và xử lý ngầm không ảnh hưởng tới API chính.
