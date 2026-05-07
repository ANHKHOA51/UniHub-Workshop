-- Xóa dữ liệu cũ và reset các chuỗi ID (Sequence)
TRUNCATE TABLE payments, registrations, workshops, users RESTART IDENTITY CASCADE;

-- ============================================================
-- 1. THÊM DỮ LIỆU BẢNG USERS
-- Mật khẩu chung cho tất cả (Staff hash): $2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle
-- ============================================================
INSERT INTO users (mssv, name, email, password, role) VALUES 
('AD001', 'Admin Hệ Thống', 'admin@unihub.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'ADMIN'),
('ST001', 'Nguyễn Nhân Sự 1', 'staff1@unihub.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STAFF'),
('ST002', 'Lê Nhân Sự 2', 'staff2@unihub.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STAFF'),
('21127001', 'Trần Văn An', 'an.tv@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127002', 'Lê Thị Bình', 'binh.lt@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127003', 'Phạm Công Danh', 'danh.pc@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127004', 'Hoàng Diệu', 'dieu.h@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127005', 'Võ Văn Kiệt', 'kiet.vv@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127006', 'Đặng Thành Long', 'long.dt@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127007', 'Nguyễn Mai Phương', 'phuong.nm@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127008', 'Bùi Xuân Huấn', 'huan.bx@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127009', 'Lê Tùng Vân', 'van.lt@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT'),
('21127010', 'Trương Mỹ Lan', 'lan.tm@student.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STUDENT');

-- ============================================================
-- 2. THÊM DỮ LIỆU BẢNG WORKSHOPS
-- ============================================================
INSERT INTO workshops (title, description, time, speaker, location, price, capacity) VALUES 
('Lập trình Node.js thực chiến', 'Xây dựng REST API hiệu năng cao với Express và PostgreSQL.', '2026-06-10 08:30:00', 'Sơn Tùng M-TP', 'Phòng 201', 0, 60),
('Kỹ năng UI/UX cho Dev', 'Cách thiết kế giao diện khiến người dùng yêu ngay từ cái nhìn đầu tiên.', '2026-06-10 13:30:00', 'Hà Anh Tuấn', 'Phòng 202', 20000, 40),
('Hệ thống Phân tán với Kafka', 'Kiến trúc Event-driven và cách xử lý hàng tỷ message mỗi ngày.', '2026-06-11 08:30:00', 'Đen Vâu', 'Hội trường B', 50000, 150),
('React Native cho Mobile App', 'Viết code một lần, chạy cả iOS và Android.', '2026-06-11 14:00:00', 'Suboi', 'Phòng Lab 1', 0, 30),
('An toàn thông tin trong Web', 'Các kỹ thuật tấn công và phòng chống SQL Injection, XSS.', '2026-06-12 09:00:00', 'Karik', 'Phòng 301', 100000, 50),
('Workshop AI & ChatGPT', 'Ứng dụng AI vào quy trình phát triển phần mềm chuyên nghiệp.', '2026-06-12 14:00:00', 'Binz', 'Hội trường A', 0, 200),
('Kỹ năng thuyết trình lôi cuốn', 'Bí quyết làm chủ sân khấu và thuyết phục người nghe.', '2026-06-13 08:00:00', 'Trấn Thành', 'Phòng 401', 0, 80),
('Docker & Kubernetes căn bản', 'Container hóa ứng dụng và quản lý cluster.', '2026-06-13 13:30:00', 'Hieuthuhai', 'Phòng Lab 2', 75000, 40),
('Phát triển Game với Unity', 'Xây dựng game 2D đầu tay trong 3 giờ.', '2026-06-14 09:00:00', 'Pháo', 'Phòng 502', 0, 60),
('Data Science với Python', 'Phân tích dữ liệu và dự báo xu hướng thị trường.', '2026-06-14 14:00:00', 'Tóc Tiên', 'Phòng 201', 120000, 100),
('Blockchain & Web3', 'Tương lai của internet phi tập trung và Smart Contract.', '2026-06-15 08:30:00', 'JustaTee', 'Hội trường B', 0, 120),
('Quản trị dự án Agile/Scrum', 'Quy trình phát triển phần mềm linh hoạt cho startup.', '2026-06-15 13:30:00', 'Soobin Hoàng Sơn', 'Phòng 101', 45000, 50),
('Digital Marketing 2026', 'Xu hướng marketing trong kỷ nguyên số.', '2026-06-16 09:00:00', 'Chi Pu', 'Phòng 303', 0, 90),
('Nghệ thuật đàm phán', 'Làm thế nào để đạt được thỏa thuận tốt nhất.', '2026-06-16 14:00:00', 'MC Đại Nghĩa', 'Phòng 402', 30000, 70),
('Khởi nghiệp đổi mới sáng tạo', 'Từ ý tưởng đến mô hình kinh doanh triệu đô.', '2026-06-17 08:30:00', 'Shark Hưng', 'Hội trường A', 0, 300);
