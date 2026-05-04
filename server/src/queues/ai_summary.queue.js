import { Queue } from 'bullmq';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

export const aiSummaryQueue = new Queue('ai-summary', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

export const addAISummaryJob = async (workshopId, file) => {
    try {
        if (!workshopId) throw new Error('workshopId is required');
        if (!file) throw new Error('file object is required');

        const fileData = {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        };

        if (file.buffer) {
            fileData.buffer = file.buffer;
        }

        const job = await aiSummaryQueue.add('generate-summary', 
            { 
                workshopId, 
                file: fileData 
            }, 
            {
                jobId: `ai-summary-${workshopId}-${Date.now()}`
            }
        );

        console.log(`[AI Queue] Job ${job.id} enqueued for workshop ${workshopId}`);
        return job;
    } catch (error) {
        console.error('[AI Queue] Error adding job to queue:', error);
        throw error;
    }
};

aiSummaryQueue.on('error', (error) => {
    console.error('AI Summary Queue error:', error);
});

export default aiSummaryQueue;
