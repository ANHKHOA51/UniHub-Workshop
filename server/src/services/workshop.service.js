const MOCK_WORKSHOPS = [
    {
        id: 'ws_001',
        title: 'Introduction to AI and Machine Learning',
        description: 'Learn the basics of AI and ML in this comprehensive workshop.',
        speaker: 'Dr. John Doe',
        startTime: '2026-06-01T09:00:00Z',
        endTime: '2026-06-01T12:00:00Z',
        location: 'Hall A',
        maxParticipants: 50,
        price: 0,
        status: 'open'
    },
    {
        id: 'ws_002',
        title: 'Advanced React Patterns',
        description: 'Deep dive into advanced React patterns and performance optimization.',
        speaker: 'Jane Smith',
        startTime: '2026-06-02T14:00:00Z',
        endTime: '2026-06-02T17:00:00Z',
        location: 'Hall B',
        maxParticipants: 30,
        price: 100000,
        status: 'open'
    },
    {
        id: 'ws_003',
        title: 'Microservices with Node.js',
        description: 'Build scalable microservices using Node.js and RabbitMQ.',
        speaker: 'Robert Brown',
        startTime: '2026-06-03T09:00:00Z',
        endTime: '2026-06-03T16:00:00Z',
        location: 'Hall C',
        maxParticipants: 40,
        price: 50000,
        status: 'closed'
    }
];

export const getAllWorkshops = async () => {
    // In a real app, this would query the database
    return MOCK_WORKSHOPS;
};

export const getWorkshopById = async (id) => {
    const workshop = MOCK_WORKSHOPS.find(w => w.id === id);
    if (!workshop) {
        const error = new Error('Workshop not found');
        error.status = 404;
        throw error;
    }
    return workshop;
};
