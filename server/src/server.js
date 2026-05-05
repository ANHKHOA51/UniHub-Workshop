import app from './app.js';
import 'dotenv/config.js';
import { connectRedis } from './utils/redis.client.js';
import db from './models/db.js';
import ngrok from '@ngrok/ngrok';

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectRedis();
        console.log('Redis connected successfully.');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }

    try {
        await db.raw('SELECT 1');
        console.log('PostgreSQL connected successfully via Knex.');
    } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error);
        process.exit(1);
    }

    app.listen(port, async () => {
        console.log(`Server is running on port ${port}`);

        // expose đúng port app
        const listener = await ngrok.connect({
            addr: port,
            authtoken_from_env: true
        });

        console.log(`Ngrok URL: ${listener.url()}`);
    });
};

startServer();