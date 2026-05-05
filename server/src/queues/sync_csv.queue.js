import { Queue } from 'bullmq';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

// Create sync-csv queue
export const syncCSVQueue = new Queue('sync-csv', {
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

// Handle queue events
syncCSVQueue.on('completed', (job) => {
    console.log(`[CSV Sync job] ${job.id} completed successfully`);
});

syncCSVQueue.on('failed', (job, error) => {
    console.error(`[CSV Sync job] ${job.id} failed:`, error.message);
});

syncCSVQueue.on('error', (error) => {
    console.error('CSV Sync queue error:', error);
});

export default syncCSVQueue;
