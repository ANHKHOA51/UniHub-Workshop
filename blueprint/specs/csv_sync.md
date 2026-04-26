# Đặc tả: Luồng đồng bộ dữ liệu sinh viên từ CSV

## Mô tả
Mỗi đêm, hệ thống cũ sẽ xuất danh sách sinh viên ra một file CSV. UniHub Workshop cần đọc file này và cập nhật vào Database để dùng làm dữ liệu xác thực cho quá trình đăng ký. Quá trình này phải thực hiện bất đồng bộ và không ảnh hưởng đến hiệu năng API chính.

## Luồng chính
1. Hệ thống cũ đẩy file CSV vào một thư mục được cấu hình hoặc S3 bucket.
2. Hệ thống lên lịch (Cron Job / BullMQ) chạy vào 2:00 sáng.
3. Worker tìm file CSV mới nhất và bắt đầu đọc theo cơ chế Streaming (không load toàn bộ file vào RAM).
4. Mỗi dòng (batch khoảng 500-1000 dòng):
   - Parse dữ liệu, kiểm tra tính hợp lệ của format (Email, MSSV).
   - Dùng lệnh `UPSERT` (VD: `INSERT ... ON CONFLICT (email) DO UPDATE`) vào PostgreSQL.
5. Sau khi quét xong file, worker ghi nhận kết quả (số lượng thành công, thất bại, dòng lỗi) vào bảng log `Sync_Logs`.
6. Gửi thông báo đến Admin (qua Telegram hoặc Email) về kết quả đồng bộ.

## Kịch bản lỗi
- **File bị lỗi định dạng / Thiếu cột quan trọng:** Worker sẽ dừng lập tức (fail-fast), ghi log lỗi nghiêm trọng và cảnh báo Admin. Không cập nhật dữ liệu dở dang.
- **Một vài dòng bị sai (VD: email rác):** Worker bỏ qua dòng đó, tăng biến đếm lỗi, lưu thông tin dòng bị lỗi và tiếp tục xử lý các dòng khác.
- **Worker bị crash giữa chừng:** Job Queue (BullMQ) có cơ chế retry. Cần thiết kế quá trình `UPSERT` là idempotent, chạy lại bao nhiêu lần kết quả cũng không thay đổi, không sinh dữ liệu rác.

## Ràng buộc
- Tối ưu bộ nhớ: Bắt buộc dùng ReadStream để parse CSV, không được nạp toàn bộ file vào RAM để tránh Out of Memory.
- Tốc độ xử lý: Cần giới hạn số connection/transaction đồng thời để không khóa Database quá lâu (Sử dụng batch processing).

## Tiêu chí chấp nhận
- Chạy thử file 100,000 dòng mất không quá 5 phút và sử dụng RAM dưới 200MB.
- Không phát sinh dữ liệu trùng lặp nếu import cùng 1 file 2 lần liên tiếp.
- Log chi tiết các dòng bị lỗi để Admin kiểm tra.
