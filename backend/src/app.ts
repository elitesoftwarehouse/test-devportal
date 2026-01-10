import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import adminCollaboratorCvRoutes from './routes/adminCollaboratorCvRoutes';
// ... altri import esistenti

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ... altre route esistenti
app.use('/api', adminCollaboratorCvRoutes);

export default app;
