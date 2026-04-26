# Đặc tả: Luồng check-in offline tại sự kiện

## Mô tả
Quá trình check-in sinh viên bằng cách quét mã QR qua Mobile App. App được thiết kế Offline-first để đối phó với tình huống mạng không ổn định hoặc mất mạng hoàn toàn tại cửa phòng workshop.

## Luồng chính
1. Trạng thái kết nối (Online):
   - Khi có mạng, App gọi API tải danh sách `Registrations` của các workshop trong ngày về lưu ở bộ nhớ máy (Local Database - SQLite / AsyncStorage).
2. Khi nhân sự quét mã QR của sinh viên:
   - App đọc dữ liệu từ QR (thường chứa `registration_id`).
   - App kiểm tra trong Local Database:
     - Nếu không tìm thấy: Báo lỗi "Vé không tồn tại".
     - Nếu đã check-in: Báo lỗi "Vé đã được sử dụng".
     - Nếu vé hợp lệ: Cập nhật trạng thái thành `checked_in` và lưu timestamp hiện tại vào Local Database. Đánh dấu record này là `pending_sync`.
   - Màn hình báo thành công ngay lập tức (không chờ gọi API).
3. Luồng đồng bộ (Background Sync):
   - Một worker ngầm trên Mobile App kiểm tra liên tục trạng thái mạng.
   - Khi có mạng, Worker gộp tất cả các bản ghi có cờ `pending_sync` gửi lên Backend (bulk update).
   - Backend nhận dữ liệu, cập nhật Database và trả về danh sách đã sync thành công.
   - App xóa cờ `pending_sync` của các bản ghi tương ứng.

## Kịch bản lỗi
- **Quét QR giả mạo:** QR code của hệ thống phải được mã hóa hoặc kèm theo chữ ký HMAC để tránh sinh viên tự tạo mã giả.
- **Xóa App trước khi Sync:** Tránh xóa dữ liệu khi người dùng vô tình kill app. Dữ liệu phải được lưu cứng (persistent) vào SQLite/Local Storage.
- **Conflict khi Sync:** Nếu backend ghi nhận sinh viên này đã check-in từ thiết bị khác (trường hợp quét 2 cửa cùng lúc), backend trả về trạng thái conflict, App sẽ ưu tiên giữ nguyên thời gian check-in sớm nhất.

## Ràng buộc
- App phải có khả năng check-in trong vòng dưới 1 giây (đọc local DB).
- Dung lượng dữ liệu offline (chỉ lưu danh sách đăng ký trong 1-2 ngày) phải nhỏ gọn (vài chục ngàn dòng) để không gây nặng máy.

## Tiêu chí chấp nhận
- Tắt hoàn toàn WiFi/3G, quét QR hợp lệ và báo thành công.
- Bật lại WiFi, dữ liệu check-in trên hệ thống Admin tự động cập nhật sau tối đa 1 phút.
