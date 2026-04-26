# Đặc tả: Phân quyền và Kiểm soát truy cập (RBAC)

## Mô tả
Quản lý quyền truy cập của 3 nhóm người dùng chính trong hệ thống UniHub Workshop: Sinh viên, Ban tổ chức (Admin), và Nhân sự check-in (Staff). Hệ thống sử dụng JWT (JSON Web Token) để xác thực và RBAC để phân quyền.

## Luồng chính
1. Người dùng đăng nhập thành công, nhận được JWT Token. Payload của token chứa `userId` và `role`.
2. Khi người dùng gọi một API (ví dụ: `POST /workshops`):
   - **Auth Middleware:** Kiểm tra tính hợp lệ của token (chưa hết hạn, đúng chữ ký).
   - **Role Guard:** Đọc `role` từ token và so sánh với danh sách các role được phép (được định nghĩa bằng decorator trên API).
3. Nếu role hợp lệ, request được chuyển tiếp đến Controller để xử lý.

## Kịch bản lỗi
- **Token hết hạn / Không hợp lệ:** Trả về lỗi `401 Unauthorized`. Client (Web/Mobile) tự động chuyển hướng về trang Đăng nhập.
- **Không đủ quyền hạn (Ví dụ: Student gọi API tạo Workshop):** Trả về lỗi `403 Forbidden`. Không cho phép thực hiện thao tác.

## Ràng buộc
- Token phải có thời hạn ngắn (ví dụ: 1 giờ) kết hợp với Refresh Token (lưu ở HTTP-only cookie hoặc Redis) để đảm bảo bảo mật.
- Role Guard phải được áp dụng mặc định trên toàn bộ API nội bộ, ngoại trừ các API public (ví dụ: danh sách workshop hiển thị trên Landing page).

## Tiêu chí chấp nhận
- Sinh viên chỉ có thể gọi API đăng ký và xem lịch cá nhân.
- Admin có thể thực hiện mọi thao tác trên `Workshops`.
- Nhân sự chỉ có thể gọi API update trạng thái check-in của `Registration` bằng cách truyền `qr_code`.
