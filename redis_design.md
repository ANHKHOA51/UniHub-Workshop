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
  - `Key:` `unihub:idempotency:payment:{idempotency_key}`
  - `Type:` String (value: `processing`, `success`, `failed`)
  - `Mục đích:` Kiểm tra trạng thái giao dịch thanh toán dựa trên UUID được client gửi kèm trong HTTP header.
  - **Cơ chế hoạt động:**
    - Client tạo UUID và gửi kèm trong HTTP header khi gửi request thanh toán.
    - Kiểm tra tính trùng lặp: Nếu key đã tồn tại:
      - Nếu giá trị là `processing`: Trả về HTTP 409 (Conflict) để client chờ.
      - Nếu giá trị là `success` hoặc `failed`: Trả về kết quả response body từ lần xử lý trước.
    - Nếu key chưa tồn tại: Tiếp tục xử lý request và lưu key với NX option (chỉ lưu nếu chưa tồn tại).
  - **TTL (Time-To-Live):**
    - `5 phút` cho key đang xử lý (status: `processing`).
    - `24 giờ` cho key thanh toán thành công (status: `success` hoặc `failed`).

- **Kiểm soát tải (Rate Limiting) - Token Bucket Algorithm:**
  - Sử dụng 2 buckets độc lập để kiểm soát tải:
    - **Global Bucket:** Giới hạn tổng lượng request tới API đăng ký Workshop.
      - `Key:` `unihub:ratelimit:global:register`
      - `Type:` Integer (token count)
      - `Cấu hình:` 2400 token, tốc độ nạp 20 token/giây.
    - **Per-User Bucket:** Giới hạn request của từng user để đảm bảo công bằng.
      - `Key:` `unihub:ratelimit:user:{student_id}`
      - `Type:` Integer (token count)
      - `Cấu hình:` 10 token, tốc độ nạp 1 token/giây.
  - **Cơ chế kiểm tra:**
    - Khi nhận request: Kiểm tra per-user bucket trước, nếu vẫn có token thì tiếp tục kiểm tra global bucket.
    - Nếu một trong hai bucket hết token: Trả về HTTP 429 (Too Many Requests).
    - Mỗi request hợp lệ sẽ tiêu 1 token từ cả hai bucket.
  - **Mục đích:** Chống spam và đảm bảo backend không bị quá tải khi có burst lớn đăng ký workshop.
