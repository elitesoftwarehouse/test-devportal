import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { authRouter } from '../routes/authRoutes.js';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.use('/api/auth', authRouter);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
};
