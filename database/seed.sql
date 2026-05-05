-- Thêm dữ liệu mẫu cho bảng users
-- Chèn cố định ID để đảm bảo quan hệ bảng bên dưới chính xác
INSERT INTO users (id, mssv, name, email, password, role) VALUES 
(1, 'SV001', 'Nguyễn Văn A', 'nva@student.edu.vn', 'hashed_password_1', 'STUDENT'),
(2, 'SV002', 'Trần Thị B', 'ttb@student.edu.vn', 'hashed_password_2', 'STUDENT'),
(3, 'AD001', 'Quản Trị Viên', 'admin@unihub.edu.vn', 'hashed_admin_pass', 'ADMIN'),
(4, 'ST001', 'Nhân Viên Check-in', 'staff@unihub.edu.vn', '$2b$10$.YZ7vgawhA9srkVaNgcppOXdVZ6ak6i1ZZVvXIDPk/DyQEMNemEle', 'STAFF')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Reset sequence cho users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Thêm dữ liệu mẫu cho bảng workshops
INSERT INTO workshops (id, title, description, time, speaker, location, price, capacity) VALUES 
(1, 'Workshop AI Basics', 'Giới thiệu cơ bản về AI', '2026-06-01 08:00:00', 'Tiến sĩ AI', 'Hội trường A', 0, 100),
(2, 'Kỹ năng mềm cho Sinh viên', 'Cách giao tiếp và quản lý thời gian', '2026-06-15 14:00:00', 'Chuyên gia Tâm lý', 'Phòng 302', 50000, 50)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Reset sequence cho workshops
SELECT setval('workshops_id_seq', (SELECT MAX(id) FROM workshops));

-- Thêm dữ liệu mẫu cho bảng registrations
INSERT INTO registrations (id, user_id, workshop_id, status, qr_code, check_in) VALUES 
(1, 1, 1, 'confirmed', 'QR_CODE_SV001_WS1', NULL),
(2, 2, 2, 'pending', 'QR_CODE_SV002_WS2', NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- Reset sequence cho registrations
SELECT setval('registrations_id_seq', (SELECT MAX(id) FROM registrations));

-- Thêm dữ liệu mẫu cho bảng payments
INSERT INTO payments (registration_id, provider, amount, status, transaction_id) VALUES 
(2, 'MoMo', 50000, 'pending', 'TXN_123456789')
ON CONFLICT DO NOTHING;
