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
            .whereIn('registrations.status', ['success', 'confirmed'])
            .select('workshops.*', 'registrations.status', 'registrations.qr_code')
            .select(db.raw('(SELECT COUNT(*)::integer FROM registrations WHERE workshop_id = workshops.id) as registered_count'))
            .groupBy('workshops.id', 'registrations.status', 'registrations.qr_code');
    },

    async findRegistrationsByWorkshopId(workshopId) {
        return db('registrations')
            .join('users', 'registrations.user_id', 'users.id')
            .where('registrations.workshop_id', workshopId)
            .select(
                'registrations.id',
                'registrations.user_id',
                'registrations.workshop_id',
                'users.name as student_name',
                'users.email as student_email',
                'registrations.status',
                'registrations.check_in',
                'registrations.created_at'
            )
            .orderBy('registrations.created_at', 'desc');
    }
};
