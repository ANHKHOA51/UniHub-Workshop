import cron from 'node-cron';
import path from 'path';
import { syncCSVQueue } from "../queues/sync_csv.queue.js";

export async function initNightlySync() {
    const filePath = path.resolve('data/export.csv');

    // 02:00
    cron.schedule('0 2 * * *', async () => {
        await syncCSVQueue.add('sync-csv', {
            filePath,
            timestamp: Date.now()
        })
    })
}   