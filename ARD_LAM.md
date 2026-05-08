# Architecture Decision Record (ADR) - UniHub Workshop

Tài liệu này ghi lại các quyết định kiến trúc cốt lõi của hệ thống **UniHub Workshop**, giải thích lý do lựa chọn (Rationale) và các đánh đổi (Trade-offs) kỹ thuật tương ứng.

---

## 1. Cơ chế Xác thực: JWT (JSON Web Token)

- **Lựa chọn (Decision):** Sử dụng **JWT** thay vì Session-based Authentication cho toàn bộ hệ thống (Web & Mobile).
- **Tại sao (Rationale):**
    - **Khả năng mở rộng (Scalability):** Hệ thống dự kiến đón 12.000 sinh viên truy cập đồng thời. JWT cho phép API Server chạy ở chế độ *stateless*, giúp giảm tải tài nguyên RAM do không cần duy trì bộ nhớ phiên (session) trên server, từ đó tối ưu hóa khả năng xử lý của một instance duy nhất.
    - **Đa nền tảng (Cross-platform):** Phù hợp cho cả Web App (Admin/Sinh viên) và Mobile App (Nhân sự check-in) thông qua Header `Authorization: Bearer <token>`.
- **Đánh đổi (Trade-offs):**
    - **Hạn chế thu hồi:** Khó thu hồi token ngay lập tức nếu token chưa hết hạn. Giải pháp khắc phục: Sử dụng `refresh token` để quản lý phiên bản token và thiết lập thời gian hết hạn (TTL) ngắn cho Access Token.

---

## 2. Quản lý Tác vụ Nền: BullMQ (Redis-based)

- **Lựa chọn (Decision):** Sử dụng **BullMQ** thay vì Kafka hoặc RabbitMQ.
- **Tại sao (Rationale):**
    - **Tận dụng hạ tầng hiện có:** Hệ thống đã sử dụng Redis cho Rate Limiting và Idempotency, việc dùng BullMQ giúp giảm bớt độ phức tạp trong vận hành (không cần cài đặt cụ thể Kafka/Zookeeper).
    - **Tính năng mạnh mẽ:** Hỗ trợ sẵn cơ chế retry với **Exponential Backoff** (Lùi lại theo hàm mũ), phù hợp cho các tác vụ không ổn định như gửi Email hoặc gọi AI API.
    - **Hiệu năng:** Đủ đáp ứng lưu lượng xử lý 12.000 bản ghi CSV hoặc hàng ngàn yêu cầu AI tóm tắt mà vẫn đảm bảo độ trễ thấp.
- **Đánh đổi (Trade-offs):**
    - **Phụ thuộc bộ nhớ Redis:** Các job được lưu trong RAM. Nếu số lượng job quá lớn, Redis có thể bị tràn bộ nhớ.
    - **a:** So với Kafka, BullMQ khó mở rộng quy mô toàn cầu (Global Scale). Tuy nhiên, với mục tiêu phục vụ sinh viên trong trường, đây là một sự đánh đổi chấp nhận được để đổi lấy tốc độ phát triển.