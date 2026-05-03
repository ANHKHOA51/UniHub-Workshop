# Queue Documentation

## Email Queue (`email.queue.js`)

The email queue handles async email delivery using BullMQ and Redis.

### Features:
- **Async Processing**: Email jobs are queued and processed asynchronously
- **Automatic Retries**: Failed jobs are retried up to 3 times with exponential backoff
- **Job Tracking**: Jobs are tracked with unique IDs and event listeners
- **Deduplication**: Completed jobs are automatically removed from the queue

### Usage:

```javascript
import { addEmailJob } from './email.queue.js';

// Add an email job to the queue
await addEmailJob(
    'user@example.com',
    'Welcome to UniHub',
    'Plain text message',
    '<h1>HTML content</h1>' // optional
);
```

### Configuration:

The queue connects to Redis using `REDIS_URL` environment variable (defaults to `redis://127.0.0.1:6379`).

### Job Structure:

```json
{
    "to": "recipient@example.com",
    "subject": "Email Subject",
    "text": "Plain text content",
    "html": "HTML content (optional)"
}
```

### Retry Strategy:

- **Max Attempts**: 3
- **Backoff Type**: Exponential
- **Initial Delay**: 2 seconds
- **Failed jobs** are retained for monitoring
