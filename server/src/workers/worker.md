# Worker Documentation

## Email Worker (`email.worker.js`)

The email worker processes queued email jobs using Nodemailer to send emails via SMTP.

### Features:
- **Concurrent Processing**: Processes up to 5 email jobs simultaneously
- **SMTP Integration**: Sends emails via configurable SMTP server
- **Error Handling**: Comprehensive error handling with logging
- **Graceful Shutdown**: Properly closes worker on SIGTERM/SIGINT signals
- **Job Locking**: Implements distributed locking to prevent duplicate processing

### Configuration:

Set these environment variables in your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@unihub.com

# Alternative (if not using SMTP_ prefix)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Concurrency Settings:
- **Concurrency**: 5 jobs processed in parallel
- **Lock Duration**: 30 seconds
- **Lock Renew Time**: 15 seconds
- **Max Stalled Count**: 2 attempts before marking as failed

### Email Job Response:

```javascript
{
    "success": true,
    "messageId": "nodemailer-message-id",
    "to": "recipient@example.com",
    "subject": "Email Subject",
    "sentAt": "2026-05-03T10:30:00.000Z"
}
```

### Running the Worker:

```bash
# The worker should be started as a separate process
node src/workers/email.worker.js

# Or with nodemon for development
nodemon src/workers/email.worker.js
```

### Event Listeners:

The worker emits events for monitoring:
- `completed`: Email job sent successfully
- `failed`: Email job failed after all retries
- `error`: Worker encountered an error

### Integration:

To use the email queue in your application:

```javascript
import { addEmailJob } from '../queues/email.queue.js';

// Send a registration confirmation email
await addEmailJob(
    user.email,
    'Registration Successful',
    `Welcome ${user.name}!`,
    `<h1>Welcome to UniHub</h1><p>Your registration is complete.</p>`
);
```
