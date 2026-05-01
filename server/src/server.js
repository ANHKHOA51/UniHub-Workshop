import app from './app.js';
import dotenv from 'dotenv/config.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});