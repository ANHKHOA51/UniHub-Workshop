import db from './db.js';

export const RefreshTokenModel = {
    async create(data) {
        const [refreshToken] = await db('refresh_tokens').insert(data).returning('*');
        return refreshToken;
    },

    async findByToken(token) {
        return db('refresh_tokens').where({ token }).first();
    },

    async deleteByToken(token) {
        return db('refresh_tokens').where({ token }).del();
    },

    async deleteByUserId(userId) {
        return db('refresh_tokens').where({ user_id: userId }).del();
    }
};
