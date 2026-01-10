import express, { Application } from 'express';
import bodyParser from 'body-parser';
import competenceProfileRoutes from './routes/competenceProfileRoutes';

const app: Application = express();

app.use(bodyParser.json());

// Monta le route del profilo competenze sotto /api/competence-profile
app.use('/api/competence-profile', competenceProfileRoutes);

export default app;
