# Hướng dẫn cài đặt và khởi chạy

## 1. Khởi động Cơ sở hạ tầng (Database) bằng Docker

Chạy lệnh sau ở thư mục `src`:
```bash
docker-compose up -d
```
Lệnh này sẽ khởi động 2 dịch vụ ngầm ở background:
- **PostgreSQL** (Port `5432`): Database SQL (Đã tự động nạp cấu trúc từ `database/init.sql`).
- **Redis** (Port `6379`): Database in-memory dùng cho Caching/Queue.

---

## 2. Khởi chạy các thành phần

### Chạy Backend (Server):
```bash
cd server
npm install
npm run dev
```

### Chạy các Worker xử lý ngầm (Email, AI, CSV):
Xử lý hàng đợi (Queue) cho Email, AI và CSV. Mở terminal mới:
```bash
cd server
npm run start-workers
```
- Theo dõi log: `npm run log-workers`
- Dừng các worker: `npm run stop-workers`


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

**Tắt database:**
```bash
docker-compose down
```

**Reset lại database:**
```bash
docker-compose down -v
```
