import { Worker } from 'bullmq';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import { WorkshopModel } from '../models/workshop.model.js';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

export const aiSummaryWorker = new Worker('ai-summary', async (job) => {
    try {
        console.log(`[AI Worker] Processing job ${job.id} for workshop AI summary...`);

        const { workshopId, file } = job.data;

        if (!workshopId || !file) {
            throw new Error('Missing workshopId or file in job data');
        }

        let dataBuffer;
        if (file.buffer) {
            if (file.buffer.type === 'Buffer' && Array.isArray(file.buffer.data)) {
                dataBuffer = Buffer.from(file.buffer.data);
            } else {
                dataBuffer = Buffer.from(file.buffer);
            }
        } else if (file.path) {
            if (!fs.existsSync(file.path)) {
                throw new Error(`File not found at path: ${file.path}`);
            }
            dataBuffer = fs.readFileSync(file.path);
        } else {
            throw new Error('Invalid file data: no buffer or path provided');
        }

        console.log(`[AI Worker] Extracting text from PDF (${file.originalname || 'unknown'}) for workshop ${workshopId}...`);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        const text = pdfData.text;

        await parser.destroy();

        if (!text || text.trim().length === 0) {
            throw new Error('No text extracted from PDF or PDF is empty');
        }

        console.log(`[AI Worker] Calling OpenRouter to summarize text for workshop ${workshopId}...`);
        const summary = await callOpenRouter(text);

        if (!summary) {
            throw new Error('Failed to generate summary from AI');
        }

        console.log(`[AI Worker] Saving AI summary to database for workshop ${workshopId}...`);
        await WorkshopModel.update(workshopId, { summary: summary });

        console.log(`[AI Worker] Job ${job.id} completed successfully for workshop ${workshopId}`);

        return {
            success: true,
            workshopId,
            summaryLength: summary.length,
            processedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error(`[AI Worker] Error processing job ${job.id}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 2,
    settings: {
        lockDuration: 60000,
        lockRenewTime: 30000,
        maxStalledCount: 1
    }
});

async function callOpenRouter(text) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured in environment variables');
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-instruct:free",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an AI assistant for the UniHub Workshop platform. Your task is to summarize a workshop's introduction document into a concise and engaging version for display on the workshop detail page."
                    },
                    {
                        "role": "user",
                        "content": `Summarize the following workshop introduction text. Capture the key points and value for students while keeping it brief (under 200 words).\n\nIntroduction Text:\n${text}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = response.statusText;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
            }
            throw new Error(`OpenRouter API error (${response.status}): ${errorMessage}`);
        }

        const result = await response.json();
        return result.choices[0]?.message?.content;
    } catch (error) {
        console.error('[AI Worker] OpenRouter call failed:', error.message);
        throw error;
    }
}

aiSummaryWorker.on('completed', (job) => {
    console.log(`AI summary job ${job.id} finished`);
});

aiSummaryWorker.on('failed', (job, error) => {
    console.error(`AI summary job ${job.id} failed:`, error.message);
});

aiSummaryWorker.on('error', (error) => {
    console.error('AI summary worker encountered a system error:', error);
});

const handleShutdown = async () => {
    console.log('Stopping AI summary worker...');
    await aiSummaryWorker.close();
    process.exit(0);
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

export default aiSummaryWorker;
