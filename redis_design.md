### Schema Redis (Key-Value Structure)
Vì Redis đóng vai trò cốt lõi trong việc xử lý tải và tranh chấp, cấu trúc Key được quy hoạch với namespace `unihub:` để tránh xung đột:

- **Bộ đệm Workshop:** 
  - `Key:` `unihub:workshop:active_list`
  - `Type:` String (JSON)
  - `Mục đích:` Cache danh sách workshop đang mở đăng ký. Đọc trực tiếp từ đây thay vì query PostgreSQL.

- **Quản lý giữ chỗ (Concurrency Control):**
  - `Key:` `unihub:workshop:{workshop_id}:available_seats`
  - `Type:` Integer
  - `Mục đích:` Bộ đếm số vé. Sử dụng lệnh `DECR` (giảm trừ nguyên tử) để giành vé. Nếu trả về >= 0 là thành công.

- **Chống trừ tiền 2 lần (Idempotency):**
  - `Key:` `unihub:idempotency:payment:{transaction_id}`
  - `Type:` String (value: `processing`, `success`, `failed`)
  - `Mục đích:` Kiểm tra trạng thái giao dịch. Có gán TTL (Time-To-Live) là 24h.

- **Kiểm soát tải (Rate Limiting):**
  - `Key:` `unihub:ratelimit:register:{student_id}` (hoặc `{ip}`)
  - `Type:` Integer
  - `Mục đích:` Lưu số lượng request đã gửi trong 1 khoảng thời gian (Sliding Window/Token Bucket) để chống spam.
