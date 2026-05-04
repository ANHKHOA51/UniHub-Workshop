import db from './db.js';

export const UserModel = {
    async findById(id) {
        return db('users').where({ id }).first();
    },

    async findByEmail(email) {
        return db('users').where({ email }).first();
    },

    async create(data) {
        const [user] = await db('users').insert(data).returning('*');
        return user;
    },

    async update(id, data) {
        const [user] = await db('users')
            .where({ id })
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*');
        return user;
    }
};
