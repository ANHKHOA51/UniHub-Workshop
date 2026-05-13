import knex from 'knex';
import 'dotenv/config';
import pg from 'pg';

// Bắt buộc pg driver parse các cột TIMESTAMP (không có múi giờ - OID 1114) như là giờ UTC
pg.types.setTypeParser(1114, (str) => new Date(str + 'Z'));

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    pool: {
        afterCreate: (conn, done) => {
            // Set session timezone về UTC để khi query luôn thống nhất 1 múi giờ
            conn.query('SET timezone="UTC";', (err) => {
                done(err, conn);
            });
        }
    }
});

export default db;