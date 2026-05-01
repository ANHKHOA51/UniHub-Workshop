# Đặc tả: Luồng đăng ký workshop có phí (từ khi bấm “Đăng ký” đến khi nhận mã QR)

## Mô tả:

Tính năng này xử lý tình huống sinh viên đăng ký workshop có thu phí. Luồng đăng ký này
tích hợp với MoMo sandbox để hỗ trợ thanh toán và áp dụng các cơ chế Circuit Breaker và
Idempotency key để bảo vệ hệ thống.

## Luồng chính:

- Sinh viên chọn đăng ký một workshop có tính phí. Phía web client sẽ tạo chuỗi UUID
    và đính kèm chuỗi này trong http header của request gửi về phía server.
- Backend sẽ kiểm tra idempotency key của request. Nếu là request mới backend sẽ
    kiểm tra số chỗ còn lại của workshop. Nếu còn trống thì tăng số người tham gia lên 1
    và tạo dữ liệu trong bảng đăng ký, nếu hết chỗ trong lúc đăng ký thì trả về lỗi và
    client hiển thị thông báo hết chỗ.
- Backend kết nối với MoMo và nhận về url. Backend lưu idempotency key mới vào
    Redis và trả về url từ MoMo cho client.
- Client chuyển tới trang MoMo và thực hiện thanh toán.
- MoMo gửi thông tin về backend sau khi hoàn tất giao dịch.


- Backend kiểm tra và xác nhận giao dịch hoàn thành. Nếu thanh toán thành công, cập
    nhật lại thông tin đăng ký của sinh viên, đồng thời gửi thông báo qua app hoặc email.
    Mã QR sẽ được tạo và thêm vào thông tin đăng ký của sinh viên.
    Nếu thanh toán thất bại, huỷ thông tin đăng ký workshop và giảm số người tham gia
    workshop đi 1.

## Kịch bản lỗi:

- Các request gửi đi có idempotency key trùng nhau: Backend kiểm tra idempotency
    key đã tồn tại trong redis và trả về http status 409 (conflict). Client xử lý lỗi và hiển thị
    thông báo là đang thực hiện giao dịch.
- Mất kết nối với MoMo: Nếu thời gian chờ khi kết nối tới MoMo lâu hoặc gặp nhiều lỗi,
    circuit breaker chuyển qua trạng thái open, ngắt kết nối với MoMo và trả về lỗi cho
    phía client, đồng thời huỷ thông tin đăng ký workshop và giảm số người tham gia
    workshop đi 1.
- Thanh toán thành công với MoMo nhưng backend không nhận được phản hồi hoặc
    Sinh viên ngừng thực hiện thanh toán với MoMo giữa chừng: Sau khoảng thời gian
    chờ, hỏi lại MoMo bằng thông tin giao dịch. Nếu MoMo xác nhận giao dịch thất bại,
    hoàn tác lại quá trình đăng ký workshop.

## Ràng buộc:

- Mỗi sinh viên chỉ được đăng ký mỗi workshop 1 lần.
- Idempotency key hết hạn sau 5 phút khi đang xử lý và hết hạn sau 24 giờ sau khi
    thanh toán thành công.
- Timeout khi kết nối tới MoMo tối đa 3 giây.

## Tiêu chí chấp nhận:

- Sinh viên không bị trừ tiền 2 lần cho 1 lần đăng ký.
- Việc xem workshop và đăng ký workshop không tính phí vẫn được diễn ra khi cổng
    thanh toán gặp sự cố.
- Sinh viên nhận được thông báo đăng ký workshop thành công và mã QR xác nhận.
