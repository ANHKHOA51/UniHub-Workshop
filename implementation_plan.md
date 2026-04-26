# Kế hoạch Triển khai Dự án UniHub Workshop

Mục tiêu của kế hoạch này là xây dựng hệ thống **UniHub Workshop** giúp số hóa quy trình đăng ký, quản lý và check-in sự kiện. Hệ thống cần giải quyết các bài toán kỹ thuật phức tạp như tải trọng đột biến (12.000 sinh viên/10 phút), tranh chấp chỗ ngồi, thanh toán không ổn định, check-in offline và tích hợp dữ liệu hệ thống cũ qua CSV.

## User Review Required

> [!IMPORTANT]
> **Đề xuất Technology Stack:** 
> - **Backend:** Node.js (NestJS hoặc Express) kết hợp TypeScript. Lý do: Xử lý I/O non-blocking tốt, phù hợp cho bài toán nhiều connection đồng thời.
> - **Database:** PostgreSQL (đảm bảo tính toàn vẹn dữ liệu cho giao dịch/chỗ ngồi) + Redis (dùng cho Caching, Rate Limiting, Idempotency, Job Queue).
> - **Frontend Web:** React hoặc Next.js.
> - **Mobile App:** React Native hoặc Flutter (hỗ trợ tốt cross-platform và lưu trữ offline).
> - **Message Queue/Background Jobs:** BullMQ (chạy trên Redis) cho tác vụ gửi email, xử lý PDF và import CSV.
> - **AI Integration:** Sử dụng **OpenRouter API** để gọi các model phục vụ việc tóm tắt PDF.
> - **Thanh toán:** Tích hợp môi trường **Sandbox của MoMo**.
> Vui lòng xác nhận xem stack này có phù hợp với định hướng của bạn không, hay bạn muốn dùng stack khác (VD: Java Spring Boot, Golang, v.v.).

## Open Questions

> [!WARNING]
> 1. **Thời gian (Deadline):** Bạn có mốc thời gian cụ thể nào cho việc hoàn thành phần Blueprint và phần Cài đặt code không?

## Proposed Changes

Kế hoạch được chia thành 5 giai đoạn chính tương ứng với yêu cầu của đề bài:

### Giai đoạn 1: Blueprint (Thiết kế hệ thống)
Tạo cấu trúc tài liệu `blueprint/` trong workspace `d:\Code\SD_Final` và hoàn thiện các bản thiết kế:
- **`proposal.md`**: Định nghĩa rõ ràng bối cảnh, mục tiêu và ràng buộc.
- **`design.md`**: 
  - Đề xuất kiến trúc hệ thống (System Architecture).
  - Vẽ **C4 Diagram** (Context và Container levels) bằng Mermaid.
  - Vẽ sơ đồ luồng tương tác (High-Level Architecture Diagram).
  - Thiết kế Schema cơ sở dữ liệu (ERD).
  - Đặc tả hệ thống RBAC (Sinh viên, Ban tổ chức, Nhân sự check-in).
  - Viết giải pháp cho các bài toán kỹ thuật: Rate Limiting (Token Bucket qua Redis), Circuit Breaker, và Idempotency.
- **`specs/`**: Viết kịch bản chi tiết cho luồng thanh toán, luồng check-in offline, và đồng bộ CSV.

### Giai đoạn 2: Cài đặt Backend
Xây dựng API Server với các thành phần:
- **Authentication & RBAC:** Phân quyền và cấp phát JWT token.
- **Workshop Management:** Các API CRUD cho admin.
- **Registration Engine:** 
  - Triển khai **Rate Limiting** (giới hạn request).
  - Xử lý **Tranh chấp chỗ ngồi** (Dùng Row-level locking trong PostgreSQL `SELECT ... FOR UPDATE` kết hợp Redis caching).
  - Xử lý thanh toán với **Idempotency Key** và **Circuit Breaker**.
- **Background Workers:**
  - Worker xử lý file CSV sinh viên ban đêm.
  - Worker bóc tách PDF, gọi AI API và lưu tóm tắt.
  - Worker gửi thông báo (Email).

### Giai đoạn 3: Cài đặt Frontend (Web App)
- **Giao diện Sinh viên:** Landing page xem danh sách workshop, biểu đồ chỗ ngồi realtime, luồng đăng ký, thanh toán, hiển thị QR code cá nhân.
- **Giao diện Admin:** Dashboard thống kê đăng ký, chức năng quản lý workshop (tạo, sửa, hủy, upload PDF).
- Áp dụng UI/UX hiện đại, có tính thẩm mỹ cao và responsive.

### Giai đoạn 4: Cài đặt Mobile App (Check-in)
- Xây dựng ứng dụng di động cho Nhân sự.
- Màn hình quét QR Code.
- **Cơ chế Offline:** 
  - Tải trước danh sách đăng ký về máy (Local Storage / SQLite).
  - Quét và ghi nhận trạng thái check-in lưu tạm ở máy.
  - Tự động đồng bộ lên server khi có kết nối Internet (Backgound Sync).

### Giai đoạn 5: Tích hợp, Dữ liệu Mẫu & Đóng gói
- Viết script tạo dữ liệu mẫu (Seed Data) cho Sinh viên, Workshop.
- Cấu hình **Docker Compose** để khởi chạy dễ dàng toàn bộ stack (PostgreSQL, Redis, Backend, Web Frontend) chỉ bằng 1 lệnh.
- Cập nhật `README.md` với hướng dẫn cài đặt chi tiết.

---

## Verification Plan

### Automated & Load Tests
- **Tải trọng đột biến:** Sử dụng công cụ (như `k6` hoặc `JMeter`) tạo kịch bản 12.000 requests đăng ký liên tục để xác minh Rate Limiter hoạt động và Backend không bị crash.
- **Tranh chấp dữ liệu:** Viết bài test giả lập nhiều requests cùng mua vé cuối cùng để đảm bảo vé không bị cấp phát lặp.
- **Idempotency:** Gửi cùng một payload kèm 1 `Idempotency-Key` nhiều lần để đảm bảo tiền chỉ trừ 1 lần.

### Manual Verification
- **Check-in Offline:** Đăng nhập app mobile -> Tắt wifi/4G điện thoại -> Quét QR check-in -> Bật lại mạng -> Kiểm tra dữ liệu trên server admin xem đã được cập nhật chưa.
- **Thanh toán lỗi:** Cố tình tắt hoặc làm chậm cổng thanh toán mock, kiểm tra xem Circuit Breaker có mở và hệ thống xem workshop có bị ảnh hưởng không.
- **CSV Import:** Thả một file CSV chứa dữ liệu lỗi và dữ liệu chuẩn vào thư mục import, chạy worker và kiểm tra log.
