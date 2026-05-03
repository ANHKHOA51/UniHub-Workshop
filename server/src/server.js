import app from './app.js';
import 'dotenv/config.js';
import { connectRedis } from './utils/redis.client.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectRedis();
        console.log('Redis connected successfully.');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
    
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();