import db from './db.js';

export const WorkshopModel = {
    async findAll() {
        return db('workshops')
            .leftJoin('registrations', 'workshops.id', 'registrations.workshop_id')
            .select('workshops.*')
            .select(db.raw('COUNT(registrations.id)::integer as registered_count'))
            .select(db.raw('COUNT(CASE WHEN registrations.check_in IS NOT NULL THEN 1 END)::integer as checked_in_count'))
            .groupBy('workshops.id');
    },

    async findById(id) {
        return db('workshops')
            .leftJoin('registrations', 'workshops.id', 'registrations.workshop_id')
            .where('workshops.id', id)
            .groupBy('workshops.id')
            .select('workshops.*')
            .select(db.raw('COUNT(registrations.id)::integer as registered_count'))
            .select(db.raw('COUNT(CASE WHEN registrations.check_in IS NOT NULL THEN 1 END)::integer as checked_in_count'))
            .first();
    },

    async create(data) {
        const [workshop] = await db('workshops').insert(data).returning('*');
        return workshop;
    },

    async update(id, data) {
        const [workshop] = await db('workshops')
            .where({ id })
            .update(data)
            .returning('*');
        return workshop;
    },

    async delete(id) {
        return db('workshops').where({ id }).del();
    },

    async findByUserId(userId) {
        return db('workshops')
            .join('registrations', 'workshops.id', 'registrations.workshop_id')
            .where('registrations.user_id', userId)
            .select('workshops.*');
    }
};
