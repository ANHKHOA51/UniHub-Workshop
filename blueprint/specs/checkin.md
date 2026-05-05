# Đặc tả: Luồng check-in offline tại sự kiện

## Mô tả
Quá trình check-in sinh viên bằng cách quét mã QR qua Mobile App. App được thiết kế Offline-first để đối phó với tình huống mạng không ổn định hoặc mất mạng hoàn toàn tại cửa phòng workshop.

---

## Cơ chế tạo và xác minh mã QR (Ed25519 Digital Signature)

### Tại sao cần chữ ký số?
Nếu mã QR chỉ chứa `registration_id` đơn thuần, bất kỳ ai cũng có thể tự tạo mã QR giả bằng cách bịa ra một chuỗi ID. Hệ thống sử dụng **chữ ký số bất đối xứng Ed25519** để đảm bảo chỉ có Backend mới tạo được mã QR hợp lệ.

### Nguyên lý hoạt động
Hệ thống sử dụng cặp khóa bất đối xứng:
- **Private Key:** Chỉ Backend server giữ. Dùng để **ký** (tạo chữ ký số cho mã QR).
- **Public Key:** Mobile App giữ. Dùng để **xác minh** chữ ký đó có đúng là do Private Key tạo ra hay không.

Điểm mấu chốt: Dù kẻ tấn công có lấy được Public Key từ App, họ cũng **không thể** tạo ra chữ ký hợp lệ vì không có Private Key. Public Key chỉ kiểm tra được, không ký được.

### Khởi tạo cặp khóa (chạy 1 lần khi deploy)
```
Backend sinh ra:
  - Private Key → Lưu trong biến môi trường (.env) của server. TUYỆT MẬT.
  - Public Key  → Nhúng vào source code của Mobile App, hoặc App tải về 
                   khi đăng nhập lần đầu rồi lưu vào Secure Storage.
```

### Luồng tạo mã QR (Backend — Khi sinh viên đăng ký thành công)
```
payload = registration_id (Ví dụ: "550e8400-e29b-41d4")

signature = Ed25519.sign(payload, PRIVATE_KEY)
          = "SIG_a1b2c3d4..."

Nội dung mã QR = "{payload}.{signature}"
Ví dụ: "550e8400-e29b-41d4.SIG_a1b2c3d4..."
```

### Luồng xác minh mã QR (Mobile App — Khi Staff quét QR)
```
Quét được chuỗi: "550e8400-e29b-41d4.SIG_a1b2c3d4..."

Tách ra:
  payload   = "550e8400-e29b-41d4"
  signature = "SIG_a1b2c3d4..."

isValid = Ed25519.verify(payload, signature, PUBLIC_KEY)

  → true  : QR do Backend tạo, hợp lệ → tiếp tục kiểm tra Local DB.
  → false : QR giả mạo → từ chối ngay lập tức, không cần tra DB.
```

### Tại sao kẻ giả mạo không thể qua mặt?
```
Sinh viên gian lận cố tạo QR giả:
  payload   = "id_bịa_đại"
  signature = "SIG_bịa..."        ← Không có Private Key nên không thể 
                                      tạo ra chữ ký đúng

  Ed25519.verify("id_bịa_đại", "SIG_bịa...", PUBLIC_KEY) → false ❌
  → Từ chối
```

---

## Luồng chính

### 1. Chuẩn bị dữ liệu Offline (Khi có mạng)
- Khi có mạng, App gọi API tải danh sách `Registrations` của các workshop trong ngày về lưu ở bộ nhớ máy (Local Database — SQLite).
- App cũng tải và lưu trữ **Public Key** vào Secure Storage (nếu chưa có) để dùng cho việc xác minh QR offline.

### 2. Khi nhân sự quét mã QR của sinh viên
Quy trình xác minh gồm **2 lớp kiểm tra**:

**Lớp 1 — Xác minh chữ ký (Chống giả mạo):**
- App tách chuỗi QR thành `payload` và `signature`.
- App dùng Public Key (đã lưu sẵn) để gọi `Ed25519.verify()`.
- Nếu `false` → Hiển thị ngay: **"Mã QR không hợp lệ"**. Dừng tại đây.

**Lớp 2 — Kiểm tra nghiệp vụ trong Local DB:**
- Nếu chữ ký hợp lệ, App dùng `registration_id` (payload) để tra cứu trong Local Database:
  - Không tìm thấy → Báo lỗi: **"Vé không tồn tại trong danh sách"**.
  - Đã check-in rồi (`checked_in` khác NULL) → Báo lỗi: **"Vé đã được sử dụng"**.
  - Vé hợp lệ → Cập nhật `checked_in = NOW()` và đánh dấu `pending_sync = true` trong Local DB.
- Màn hình báo **thành công** ngay lập tức (không chờ gọi API).

### 3. Luồng đồng bộ (Background Sync — Chunked)
App luôn ghi vào Local DB trước (Offline-first). Dù đang có mạng, App cũng không gọi API trực tiếp lúc quét QR — giúp phản hồi tức thì (< 50ms) và Staff không bao giờ bị gián đoạn bởi trạng thái mạng.

Một Background Worker chạy ngầm, định kỳ mỗi **30 giây** kiểm tra:
- Có kết nối mạng không?
- Có bản ghi nào đang `pending_sync = true` không?

Nếu thỏa cả hai, Worker **chia các bản ghi thành từng lô nhỏ** (chunk) tối đa **50 dòng/lô** để tránh payload quá lớn hoặc mất toàn bộ dữ liệu nếu mất mạng giữa chừng.

**API Request (mỗi lô):**
```json
POST /api/checkins/sync
Body: {
  "records": [
    { "registration_id": "aaa", "checked_in": "2026-05-10T08:15:00" },
    { "registration_id": "bbb", "checked_in": "2026-05-10T08:15:05" }
  ]
}
```

**API Response (Backend xử lý từng dòng, trả kết quả riêng cho từng dòng):**
```json
{
  "results": [
    { "registration_id": "aaa", "status": "success" },
    { "registration_id": "bbb", "status": "conflict", "reason": "Đã check-in lúc 08:10 từ thiết bị khác" }
  ]
}
```

**Xử lý response trên App:**
- `success` → Xóa cờ `pending_sync` của dòng đó.
- `conflict` → Cũng xóa cờ `pending_sync` (server đã ghi nhận bản ghi sớm hơn, không cần gửi lại).
- Nếu **request bị lỗi mạng giữa chừng** → Dừng vòng lặp, giữ nguyên cờ `pending_sync`, Worker sẽ thử lại ở chu kỳ tiếp theo. Các lô đã gửi thành công trước đó **không bị ảnh hưởng**.

**Pseudocode cho Worker:**
```javascript
async function syncPendingCheckins() {
  const CHUNK_SIZE = 50;
  const pendingRecords = db.query("SELECT * FROM checkins WHERE pending_sync = true");

  for (let i = 0; i < pendingRecords.length; i += CHUNK_SIZE) {
    const chunk = pendingRecords.slice(i, i + CHUNK_SIZE);
    try {
      const response = await api.post("/checkins/sync", { records: chunk });
      for (const result of response.results) {
        if (result.status === "success" || result.status === "conflict") {
          db.update("UPDATE checkins SET pending_sync = false WHERE id = ?", result.registration_id);
        }
      }
    } catch (error) {
      break; // Mất mạng → dừng, chờ lần sync tiếp theo
    }
  }
}
```

---

## Kịch bản lỗi

| Kịch bản | Cách xử lý |
| :--- | :--- |
| **QR giả mạo** | Ed25519.verify() trả về `false` → Từ chối ngay, không tra DB. |
| **QR hợp lệ nhưng vé không có trong Local DB** | Có thể do App chưa đồng bộ dữ liệu mới nhất. Hiển thị: "Không tìm thấy vé. Vui lòng kết nối mạng để cập nhật danh sách." |
| **Quét trùng (Vé đã sử dụng)** | Kiểm tra `checked_in` trong Local DB. Nếu đã có giá trị → Báo: "Vé đã được sử dụng lúc HH:MM". |
| **Xóa App / Kill App trước khi Sync** | Dữ liệu được lưu cứng (persistent) vào SQLite. Mở lại App → dữ liệu `pending_sync` vẫn còn nguyên và sẽ tự đồng bộ khi có mạng. |
| **Conflict khi Sync (2 thiết bị quét cùng 1 vé)** | Backend giữ lại thời gian check-in sớm nhất (First-Write-Wins) và trả về trạng thái `conflict` cho thiết bị đến sau. |
| **Tích lũy quá nhiều bản ghi offline** | Worker chia thành các lô nhỏ (50 dòng/lô). Mất mạng giữa chừng chỉ mất 1 lô đang gửi, các lô trước đó đã sync an toàn. |

---

## Ràng buộc
- App phải có khả năng check-in trong vòng dưới 1 giây (xác minh chữ ký + đọc Local DB).
- Dung lượng dữ liệu offline (chỉ lưu danh sách đăng ký trong 1–2 ngày) phải nhỏ gọn để không gây nặng máy.
- Public Key phải được lưu trong Secure Storage, không lưu dạng plain text.

## Tiêu chí chấp nhận
- Quét mã QR giả mạo (tự bịa chuỗi) → App từ chối ngay lập tức.
- Tắt hoàn toàn WiFi/3G, quét QR hợp lệ → App báo thành công.
- Bật lại WiFi → Dữ liệu check-in trên hệ thống Admin tự động cập nhật sau tối đa 1 phút.
