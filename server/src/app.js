import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js';
import {loggerMiddleware} from './middlewares/log.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Idempotency-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(loggerMiddleware)

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'static')));

app.use('/api', router);

export default app;