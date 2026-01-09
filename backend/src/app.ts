import express from 'express';
import bodyParser from 'body-parser';
import suppliersRouter from './routes/suppliers';

const app = express();

app.use(bodyParser.json());

app.use('/api/suppliers', suppliersRouter);

export default app;
