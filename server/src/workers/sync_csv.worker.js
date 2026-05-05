import { Worker } from 'bullmq';
import fs from 'fs';
import csv from 'csv-parser';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

export const syncCSVWorker = new Worker('sync-csv', async (job) => {
    console.log(`CSV Worker Processing job ${job.id}...`);
    const { filePath } = job.data || {};

    if (!filePath) {
        throw new Error('Missing filePath in job data');
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
    }

    try {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
            });
    } catch (error) {
        console.error(`CSV Worker Error processing job ${job.id}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 1, // Process one CSV file at a time per worker instance
    settings: {
        lockDuration: 60000,
        lockRenewTime: 30000,
        maxStalledCount: 1
    }
});

// Worker event listeners
syncCSVWorker.on('completed', (job) => {
    console.log(`CSV sync job ${job.id} finished successfully`);
});

syncCSVWorker.on('failed', (job, error) => {
    console.error(`CSV sync job ${job.id} failed after ${job.attemptsMade} attempts:`, error.message);
});

syncCSVWorker.on('error', (error) => {
    console.error('CSV sync worker encountered an error:', error);
});

// Graceful shutdown
const handleShutdown = async () => {
    console.log('Stopping CSV sync worker...');
    await syncCSVWorker.close();
    process.exit(0);
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

export default syncCSVWorker;
