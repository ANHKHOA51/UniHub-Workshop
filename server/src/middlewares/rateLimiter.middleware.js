import redisClient from '../utils/redis.client.js';

export const rateLimiter = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?.id || req.ip;
        const now = Math.floor(Date.now() / 1000);

        const userKey = `ratelimit:user:${userId}`;
        const userCapacity = 10;
        const userRefillRate = 1;
        const userRefillInterval = 1;

        const [userAllowed, userTokens] = await redisClient.tokenBucket(
            userKey,
            userCapacity.toString(),
            userRefillRate.toString(),
            userRefillInterval.toString(),
            now.toString()
        );

        if (userAllowed === 0) {
            return res.status(429).json({ message: 'Too many requests. Please try again later.' });
        }

        const globalKey = `ratelimit:global:registration`;
        const globalCapacity = 2400;
        const globalRefillRate = 20;
        const globalRefillInterval = 1;

        const [globalAllowed, globalTokens] = await redisClient.tokenBucket(
            globalKey,
            globalCapacity.toString(),
            globalRefillRate.toString(),
            globalRefillInterval.toString(),
            now.toString()
        );

        if (globalAllowed === 0) {
            return res.status(429).json({ message: 'Server is currently experiencing high load. Please try again.' });
        }

        next();
    } catch (error) {
        console.error('Rate Limiter Error:', error);
        next();
    }
};
