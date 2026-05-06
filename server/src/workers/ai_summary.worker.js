import { Worker } from 'bullmq';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import { WorkshopModel } from '../models/workshop.model.js';

const redisConnection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

console.log('AI summary worker running...');

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

        console.log(`[AI Worker] Extracted text length: ${text?.length || 0}`);
        if (text) {
            console.log(`[AI Worker] First 200 chars of text: ${text.substring(0, 200)}`);
        }

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
    concurrency: 1,
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
                "model": "openrouter/auto",
                "max_tokens": 350,
                "temperature": 0.5,
                "messages": [
                    {
                        "role": "system",
                        "content": "Bạn là chuyên gia tóm tắt nội dung. Nhiệm vụ của bạn là tạo bản tóm tắt CỰC KỲ NGẮN GỌN (DƯỚI 100 TỪ) và CỤ THỂ. Tuyệt đối không chào hỏi. Tập trung vào giá trị cốt lõi. LUÔN LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT."
                    },
                    {
                        "role": "user",
                        "content": `YÊU CẦU BẮT BUỘC: Tóm tắt văn bản sau trong TỐI ĐA 100 TỪ (3-5 câu). Không chào hỏi, không dẫn dắt.

Yêu cầu nội dung:
1. Workshop này nói về cái gì?
2. Sinh viên sẽ học được gì hoặc nhận được giá trị gì cụ thể?

Văn bản giới thiệu:
${text}`
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
