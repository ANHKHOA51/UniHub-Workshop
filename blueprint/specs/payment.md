# Đặc tả: Luồng thanh toán đăng ký Workshop

## Mô tả
Xử lý giao dịch thanh toán khi Sinh viên đăng ký một workshop có thu phí. Luồng này tích hợp với cổng thanh toán MoMo Sandbox và áp dụng cơ chế Circuit Breaker, Idempotency để chống lỗi.

## Luồng chính
1. Sinh viên bấm "Đăng ký" tại Frontend.
2. Frontend tạo một chuỗi UUID ngẫu nhiên làm `Idempotency-Key` và gửi request đăng ký lên Backend.
3. Backend kiểm tra chỗ ngồi (Row-level lock). Nếu còn chỗ, tạo `Registration` với trạng thái `pending_payment` và tạo record `Payment` tương ứng.
4. Backend gọi API tạo giao dịch của MoMo Sandbox.
5. MoMo trả về Payment URL. Backend lưu `Idempotency-Key` với trạng thái `processing` và trả URL về cho Frontend.
6. Frontend chuyển hướng người dùng sang trang của MoMo để thanh toán.
7. MoMo gửi IPN (Webhook) về Backend sau khi giao dịch thành công.
8. Backend nhận IPN, xác minh chữ ký, cập nhật `Payment` và `Registration` thành `paid`, và gửi Email thông báo.

## Kịch bản lỗi
- **Trùng lặp request (Client spam click):** Backend phát hiện `Idempotency-Key` đã tồn tại trong Redis -> Trả về `409 Conflict` (Giao dịch đang xử lý) hoặc trả thẳng kết quả nếu đã thành công.
- **MoMo API Timeout / Circuit Breaker Open:** Nếu MoMo phản hồi chậm hoặc lỗi liên tục, Circuit Breaker ngắt kết nối. API trả về lỗi `503 Service Unavailable` hoặc một thông báo "Cổng thanh toán bảo trì". Hủy thao tác giữ chỗ để người khác có thể mua vé.
- **Webhook bị thất lạc / Không nhận được IPN:** Sẽ có một Background Job định kỳ kiểm tra các `Payment` đang ở trạng thái `pending` quá 15 phút và chủ động gọi API `CheckTransactionStatus` của MoMo để đối soát.
- **Thanh toán thất bại trên MoMo:** Backend nhận IPN báo lỗi -> Cập nhật `Registration` thành `cancelled` và nhả lại chỗ (giảm `registered_count`).

## Ràng buộc
- Mã `Idempotency-Key` có hiệu lực tối thiểu 24 giờ.
- Dữ liệu `amount` và `transaction_id` phải khớp tuyệt đối giữa hệ thống và MoMo.
- Timeout khi gọi API MoMo tối đa là 5 giây.

## Tiêu chí chấp nhận
- Không có sinh viên nào bị trừ tiền 2 lần cho cùng 1 lượt đăng ký.
- Khi MoMo lỗi cục bộ, luồng đăng ký workshop miễn phí vẫn hoạt động bình thường.
- Có luồng đối soát tự động khi webhook bị rớt mạng.
