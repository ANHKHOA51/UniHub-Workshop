-- Thêm dữ liệu mẫu cho bảng users
INSERT INTO users (mssv, name, email, password, role) VALUES 
('SV001', 'Nguyễn Văn A', 'nva@student.edu.vn', 'hashed_password_1', 'student'),
('SV002', 'Trần Thị B', 'ttb@student.edu.vn', 'hashed_password_2', 'student'),
('AD001', 'Quản Trị Viên', 'admin@unihub.edu.vn', 'hashed_admin_pass', 'admin')
ON CONFLICT DO NOTHING;

-- Thêm dữ liệu mẫu cho bảng workshops
INSERT INTO workshops (title, description, time, speaker, location, price, capacity) VALUES 
('Workshop AI Basics', 'Giới thiệu cơ bản về AI', '2026-06-01 08:00:00', 'Tiến sĩ AI', 'Hội trường A', 0, 100),
('Kỹ năng mềm cho Sinh viên', 'Cách giao tiếp và quản lý thời gian', '2026-06-15 14:00:00', 'Chuyên gia Tâm lý', 'Phòng 302', 50000, 50)
ON CONFLICT DO NOTHING;

-- Thêm dữ liệu mẫu cho bảng registrations
INSERT INTO registrations (user_id, workshop_id, status, qr_code, check_in) VALUES 
(1, 1, 'confirmed', 'QR_CODE_SV001_WS1', false),
(2, 2, 'pending', 'QR_CODE_SV002_WS2', false)
ON CONFLICT DO NOTHING;

-- Thêm dữ liệu mẫu cho bảng payments
INSERT INTO payments (registration_id, provider, amount, status, transaction_id) VALUES 
(2, 'MoMo', 50000, 'pending', 'TXN_123456789')
ON CONFLICT DO NOTHING;
