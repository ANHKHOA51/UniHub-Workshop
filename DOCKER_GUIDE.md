# 🚀 Kiến trúc Phát triển Local (Tối ưu nhất)

Chúc mừng, bạn đã cấu hình dự án về đúng chuẩn **Developer Experience (DX) lý tưởng nhất** dành cho lập trình viên! 

Hệ thống được chia làm 2 phần rạch ròi:
- **Docker:** Đóng vai trò là "Cơ sở hạ tầng" ẩn bên dưới (Chỉ chạy Database).
- **Windows:** Nơi bạn trực tiếp viết code và xem thay đổi ngay lập tức (Hot-reload).

---

## 1. Khởi động Cơ sở hạ tầng (Database) bằng Docker

Bạn chỉ cần chạy lệnh này 1 lần duy nhất mỗi ngày khi bắt đầu làm việc. Mở Terminal ở `d:\Code\SD_Final` và gõ:
```bash
docker-compose up -d
```
Lệnh này sẽ khởi động 2 dịch vụ ngầm ở background:
- **PostgreSQL** (Port `5432`): Database SQL (Đã tự động nạp cấu trúc từ `database/init.sql`).
- **Redis** (Port `6379`): Database in-memory dùng cho Caching/Queue.

---

## 2. Khởi chạy các dự án Code trên Windows

Mở các cửa sổ Terminal mới và chạy từng module độc lập. Tính năng Hot-reload (lưu là cập nhật) sẽ hoạt động 100%.

### Chạy Backend (Server):
*Lưu ý: Bạn cần tạo file `.env` bằng cách copy từ file `.env.example` và sửa thông số kết nối Database (nếu cần).*
```bash
cd server
copy .env.example .env  # (hoặc tự tạo file .env)
npm install
npm run dev
```

### Chạy Frontend Admin/Sinh viên (Web):
```bash
cd client\web
npm install
npm run dev
```

### Chạy App Mobile Nhân sự (Expo):
```bash
cd client\mobile
npm install
npm start
```

---

## 3. Quản lý hệ thống ngầm

**Tắt Database đi ngủ:**
```bash
docker-compose down
```

**Reset lại Database từ đầu (Xóa trắng mọi thứ):**
```bash
docker-compose down -v
```
*(Nếu bạn lỡ làm hỏng database, chạy lệnh trên rồi up lại, nó sẽ tự tạo bảng mới tinh).*

---

## 4. Chia sẻ dữ liệu Database (Export / Import)

Nếu bạn muốn tạo một bản sao lưu (Backup) hoặc gửi bộ dữ liệu trên máy bạn cho một thành viên khác trong Team, hãy dùng 2 lệnh sau:

### Lệnh Nén (Export dữ liệu từ Docker ra file `.sql`):
Mở Command Prompt ở thư mục gốc và chạy:
```bash
docker exec -t unihub_postgres pg_dump -U root -d unihub_workshop -c --inserts > backup.sql
```
*(File `backup.sql` sẽ xuất hiện trong thư mục dự án của bạn. Bạn có thể gửi file này cho Dev khác).*

### Lệnh Giải Nén (Import dữ liệu từ file `.sql` vào Docker):
Khi một Dev khác nhận được file `backup.sql`, để đưa dữ liệu đó vào máy của họ, hãy để file ở thư mục gốc và chạy lệnh sau:

**Nếu dùng Command Prompt (CMD):**
```cmd
type backup.sql | docker exec -i unihub_postgres psql -U root -d unihub_workshop
```

**Nếu dùng PowerShell:**
```powershell
Get-Content backup.sql | docker exec -i unihub_postgres psql -U root -d unihub_workshop
```
