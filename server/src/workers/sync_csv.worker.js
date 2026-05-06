import { Worker } from 'bullmq';
import fs from 'fs';
import csv from 'csv-parser';
import { UserModel } from '../models/user.model.js';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

const BATCH_SIZE = 1000;

console.log('CSV sync worker running...');

export const syncCSVWorker = new Worker('sync-csv', async (job) => {
    console.log(`Processing job ${job.id}...`);
    const { filePath } = job.data || {};

    if (!filePath) throw new Error("Missing filePath");
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const REQUIRED_HEADERS = ["mssv", "email", "name"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let batch = [];
    let headersValidated = false;
    let totalProcessed = 0;

    const stream = fs.createReadStream(filePath)
        .pipe(
            csv({
                mapHeaders: ({ header }) => header.toLowerCase().trim(),
            })
        );

    stream.on("headers", (headers) => {
        const normalized = headers.map((h) => h.toLowerCase().trim());
        const missing = REQUIRED_HEADERS.filter((h) => !normalized.includes(h));

        if (missing.length > 0) {
            throw new Error(`Missing columns: ${missing.join(", ")}`);
        }

        headersValidated = true;
        console.log("Headers OK:", headers);
    });

    for await (const row of stream) {
        if (!headersValidated) {
            throw new Error("Header not validated");
        }

        // validate email
        if (!emailRegex.test(row.email)) {
            console.warn(`Invalid email, skip: ${row.email}`);
            continue;
        }

        batch.push({
            mssv: row.mssv,
            email: row.email,
            name: row.name,
            password: generatePassword(row.name, row.mssv),
            role: 'STUDENT'
        });

        if (batch.length >= BATCH_SIZE) {
            await processBatch(batch);
            totalProcessed += batch.length;
            batch = [];
            console.log(`[BATCH] Processed ${batch.length} records`);
        }
    }

    if (batch.length > 0) {
        await processBatch(batch);
        totalProcessed += batch.length;
    }

    console.log(`Done job ${job.id}, total processed: ${totalProcessed}`);

    return { totalProcessed };
}, {
    connection: redisConnection,
    concurrency: 1
})

async function processBatch(batch) {
    UserModel.upsertMany(batch);
}


// "Nguyen Van A" - "21127402"
// "nguyenvana7402"
function generatePassword(name, mssv) {
    if (!name || !mssv) return null;

    const last4 = mssv.slice(-4);

    const normalizedName = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "");

    return normalizedName + last4;
}

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
