# Đặc tả: Phân quyền và Kiểm soát truy cập (RBAC)

## 1. Mô hình lựa chọn
Hệ thống sử dụng mô hình **Static RBAC (Role-Based Access Control tĩnh)** kết hợp với **JWT (JSON Web Token)**.

**Lý do lựa chọn:**
- Hệ thống có số lượng nhóm người dùng cố định (3 nhóm) với nghiệp vụ phân tách rõ ràng. Việc sử dụng RBAC tĩnh (lưu trực tiếp cột `role` trong bảng `Users`) giúp tối ưu cấu trúc cơ sở dữ liệu (không cần join bảng) và dễ triển khai.
- Phân quyền bằng JWT giúp hệ thống tuân thủ kiến trúc Stateless (không lưu trạng thái), hỗ trợ cực tốt cho khả năng chịu tải cao (Scale out).

---

## 2. Nhóm người dùng (Roles) & Quyền hạn (Permissions)

Dưới đây là ma trận phân quyền chi tiết cho 3 nhóm người dùng:

| Tên Role | Đối tượng | Quyền hạn (Permissions) |
| :--- | :--- | :--- |
| **`STUDENT`** | Sinh viên | - Xem danh sách và chi tiết các Workshop đang mở.<br>- Tạo mới lượt đăng ký và thanh toán.<br>- Xem lịch sử cá nhân và lấy Mã QR check-in. |
| **`ADMIN`** | Ban tổ chức | - Toàn quyền (CRUD) quản lý Workshop: Tạo, sửa, đổi phòng, hủy sự kiện, upload PDF cho AI tóm tắt.<br>- Xem danh sách toàn bộ sinh viên đăng ký của các Workshop.<br>- Xem bảng điều khiển (Dashboard) thống kê. |
| **`STAFF`** | Nhân sự Check-in | - Quét mã QR của Sinh viên để cập nhật trạng thái `checked_in_at`.<br>- Xem thông tin cơ bản của Workshop mình trực. |

---

## 3. Cơ chế kiểm tra quyền tại các điểm truy cập

Hệ thống tuân thủ nguyên tắc "Bảo vệ nhiều lớp" (Defense in Depth).

### 3.1. Tại Backend (API Endpoints) - Lớp bảo vệ lõi
Tất cả các API (ngoại trừ API lấy danh sách Workshop cho trang chủ) đều được bảo vệ nghiêm ngặt.
- **Cơ chế hoạt động:** 
  1. Khi người dùng đăng nhập thành công, nhận được JWT Token. Payload của token chứa `userId` và `role`.
  2. Khi gọi API (ví dụ: `POST /workshops`), **Auth Middleware** kiểm tra tính hợp lệ của token (chưa hết hạn, đúng chữ ký).
  3. Tiếp đó, **Role Guard** đọc `role` từ token và đối chiếu với mảng Role được cấu hình cho API đó.
  4. Nếu không khớp (VD: Student cố tình gọi API tạo Workshop), trả về lỗi `403 Forbidden`.
  5. Nếu token hết hạn, trả về `401 Unauthorized`.

### 3.2. Tại Web App (Trang Sinh viên & Trang Admin)
- **Bảo vệ Route (Route Guards):** 
  - Giao diện bóc tách JWT để biết Role.
  - Các đường dẫn nội bộ của Ban tổ chức (như `/admin/workshops`) được bọc bởi `PrivateRoute`.
  - Nếu user có role `STUDENT` cố tình gõ URL `/admin`, Frontend sẽ chuyển hướng (redirect) ngay lập tức về Trang chủ.
- **Ẩn/hiện UI (Conditional Rendering):** 
  - Giao diện tự động thích ứng dựa trên role. Ví dụ: Nút "Tạo Workshop mới" sẽ không xuất hiện trong mã HTML đối với Sinh viên.

### 3.3. Tại Mobile App (App Check-in dành cho Staff)
- **Phân luồng màn hình (Screen Flow):** 
  - Khi Staff mở app và đăng nhập thành công, ứng dụng đọc JWT và nhận diện role `STAFF`.
  - Thay vì hiển thị Dashboard hay Menu rườm rà, app điều hướng trực tiếp vào màn hình **Máy quét Camera QR (Scanner Screen)**. 
- **Chặn tính năng thừa:** Chặn Staff truy cập vào luồng đăng ký vé.
- **Xác thực Offline:** 
  - Khi có mạng, app lưu trữ Token một cách an toàn (Secure Storage). 
  - Trong trường hợp mất kết nối mạng ở khu vực cửa phòng, app vẫn đọc Token nội bộ này để xác nhận Staff đang trong phiên hợp lệ và cho phép lưu tạm các giao dịch quét QR (Offline Sync Queue).

---

## 4. Ràng buộc & Tiêu chí chấp nhận
- **Bảo mật:** JWT Token phải có thời hạn ngắn (ví dụ: 1 giờ) kết hợp với Refresh Token (lưu ở HTTP-only cookie hoặc Redis) để chống bị đánh cắp.
- **Mặc định đóng:** Role Guard phải được kích hoạt làm mặc định (Default Guard) trên toàn bộ hệ thống API nội bộ để tránh việc sơ suất quên gắn decorator bảo vệ khi code API mới.
- **Chấp nhận:** Sinh viên chỉ thao tác được dữ liệu của mình; Nhân sự chỉ quét được QR; Admin toàn quyền vận hành.
