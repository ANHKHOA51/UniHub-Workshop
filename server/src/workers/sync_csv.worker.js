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
        return new Promise((resolve, reject) => {
            const results = [];
            const REQUIRED_HEADERS = ['mssv', 'email', 'name'];
            let headersValidated = false;

            const stream = fs.createReadStream(filePath)
                .pipe(csv({
                    mapHeaders: ({ header }) => header.toLowerCase().trim()
                }));

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            stream.on('headers', (headers) => {
                const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
                const missing = REQUIRED_HEADERS.filter(h => !normalizedHeaders.includes(h));

                if (missing.length > 0) {
                    const error = new Error(`Invalid CSV file structure. Missing columns: ${missing.join(', ')}`);
                    stream.destroy(error);
                    return;
                }
                headersValidated = true;
                console.log('CSV Headers validated successfully:', headers);
            });

            stream.on('data', (data) => {
                const { email } = data;
                if (!emailRegex.test(email)) {
                    console.warn(`[CSV Worker] Skipping row with invalid email: ${email}`);
                    return;
                }
                results.push(data);
            });

            stream.on('end', () => {
                if (!headersValidated && results.length === 0) {
                    return reject(new Error('The CSV file is empty or lacks a valid header.'));
                }
                console.log("Processed CSV data:", results);
                resolve(results);
            });

            stream.on('error', (error) => {
                console.error(`[CSV Worker] Stream error: ${error.message}`);
                reject(error);
            });
        })
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
