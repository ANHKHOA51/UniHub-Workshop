import { Queue } from 'bullmq';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

// Create email queue
export const emailQueue = new Queue('email', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

// Add email job to queue
export const addEmailJob = async (to, message) => {
    try {
        const job = await emailQueue.add('send-email', { to, message }, {
            jobId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

        console.log(`Email job added to queue with ID: ${job.id}`);
        return job;
    } catch (error) {
        console.error('Error adding email job to queue:', error);
        throw error;
    }
};

// Handle queue events
emailQueue.on('completed', (job) => {
    console.log(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, error) => {
    console.error(`Email job ${job.id} failed:`, error.message);
});

emailQueue.on('error', (error) => {
    console.error('Email queue error:', error);
});

export default emailQueue;
