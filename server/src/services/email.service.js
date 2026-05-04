import { addEmailJob } from '../queues/email.queue.js';
import { NotificationMethod } from './notification.service.js';

class EmailNotificationMethod extends NotificationMethod {
    async send(message) {
        try {
            const job = await addEmailJob(message.user.userId, message.content);

            console.log(`Email queued successfully. Job ID: ${job.id}`);
            return job;
        } catch (error) {
            console.error('Error sending email:', error.message);
            throw error;
        }
    }
}

export { EmailNotificationMethod };