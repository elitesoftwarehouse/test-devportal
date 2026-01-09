import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import externalInvitesRouter from './routes/externalInvites.routes';
// ... altri import esistenti

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ... middleware di auth che popola req.user

// Routes esistenti
// app.use('/api/companies', companiesRouter);
// app.use('/api/projects', projectsRouter);

// Nuova route per inviti collaboratori esterni
app.use('/api/external-invites', externalInvitesRouter);

// ... error handler generico se presente

export default app;
