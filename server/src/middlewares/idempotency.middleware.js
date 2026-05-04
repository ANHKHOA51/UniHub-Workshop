import redisClient from '../utils/redis.client.js';

export const idempotency = async (req, res, next) => {
    try {
        const idempotencyKey = req.headers['idempotency-key'];
        
        if (!idempotencyKey) {
            return res.status(400).json({ message: 'Idempotency-Key header is required.' });
        }

        const redisKey = `idempotency:${idempotencyKey}`;
        
        const existingData = await redisClient.get(redisKey);
        
        if (existingData) {
            const parsedData = JSON.parse(existingData);
            if (parsedData.status === 'processing') {
                return res.status(409).json({ message: 'Request is already being processed.' });
            } else if (parsedData.status === 'success') {
                return res.status(parsedData.statusCode || 200).json(parsedData.response);
            }
        }

        const isSet = await redisClient.set(redisKey, JSON.stringify({ status: 'processing' }), {
            NX: true,
            EX: 300
        });

        if (!isSet) {
            return res.status(409).json({ message: 'Request is already being processed.' });
        }

        const originalJson = res.json;
        res.json = function (body) {
            const statusCode = res.statusCode;
            
            if (statusCode >= 200 && statusCode < 300) {
                const successData = {
                    status: 'success',
                    statusCode: statusCode,
                    response: body
                };
                
                // Set to 5 minutes (300s) initially. Webhook will upgrade to 24h on final success.
                redisClient.set(redisKey, JSON.stringify(successData), {
                    EX: 300 
                }).catch(err => console.error('Redis Idempotency Set Error:', err));
            } else {
                redisClient.del(redisKey).catch(err => console.error('Redis Idempotency Del Error:', err));
            }

            return originalJson.call(this, body);
        };

        next();
    } catch (error) {
        console.error('Idempotency Error:', error);
        next();
    }
};
