import express from 'express';
import bodyParser from 'body-parser';
import collaboratorCvRoutes from './routes/collaboratorCvRoutes';
// ... altri import esistenti

const app = express();

app.use(bodyParser.json());

// ... altre route esistenti
app.use('/api', collaboratorCvRoutes);

// ... error handler esistente

export default app;
