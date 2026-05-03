import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer transporter verification failed:', error);
    } else {
        console.log('Nodemailer transporter verified successfully');
    }
});

// Create email worker
export const emailWorker = new Worker('email', async (job) => {
    try {
        console.log(`Processing email job ${job.id}...`);

        const { userId, message } = job.data || {};

        if (!userId) {
            throw new Error('Missing required email field: userId');
        }

        const to = "example email"; // TO-DO: Query the database to find user's email.
        const subject = 'Đăng ký workshop thành công';
        const text = message;
        const html = `<p>${message}</p>`;

        // Send email
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent successfully. MessageID: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
            to,
            subject,
            sentAt: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error processing email job ${job.id}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 5, // Number of jobs to process concurrently
    settings: {
        lockDuration: 30000, // 30 seconds
        lockRenewTime: 15000, // 15 seconds
        maxStalledCount: 2
    }
});

// Worker event listeners
emailWorker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, error) => {
    console.error(`Email job ${job.id} failed after ${job.attemptsMade} attempts:`, error.message);
});

emailWorker.on('error', (error) => {
    console.error('Email worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing email worker...');
    await emailWorker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing email worker...');
    await emailWorker.close();
    process.exit(0);
});

export default emailWorker;
