### Rate limit

#### Lựa chọn gì

Chọn thuật toán Token Bucket cho rate limit.

#### Tại sao

Với tình huống tải đột biến trong thời gian ngắn của bài toán (12.000 request/10 phút, với 60% request trong 3 phút đầu), sử dụng Token Bucket là hợp lý bởi cơ chế cho phép burst ngắn của thuật toán này. Kết hợp với việc sử dụng 2 bucket cho hệ thống sẽ giúp đảm bảo tính công bằng (không có user nào chiếm toàn bộ bucket) và tránh quá tải (giới hạn tổng lượt request).

#### Đánh đổi gì

Token bucket phức tạp hơn các thuật toán như Fixed Window hoặc Sliding Window do cần phải tính toán cách refill bucket và xử lý sai số dấu phẩy động khi refill bucket.

### Lưu trữ idempotency key

#### Lựa chọn gì

Lưu trữ idempotency key trong Redis.

#### Tại sao

Giúp việc truy vấn và kiểm tra tính duy nhất của request nhanh chóng.

#### Đánh đổi gì

Idempotency key trong Redis có thể bị mất khi Redis gặp sự cố hoặc cần restart. Khi đó, nếu có request trùng lặp trong lúc Redis đang gặp sự cố, hệ thống sẽ không thể dùng Idempotency key để ngăn chặn.