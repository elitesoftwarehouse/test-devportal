import express, { Application } from 'express';
import bodyParser from 'body-parser';
import supplierCompaniesAdminRoutes from './routes/admin/supplierCompaniesRoutes';

const app: Application = express();

app.use(bodyParser.json());

// Middleware fittizio di autenticazione per integrazione con authorizationMiddleware
// In produzione questo deve essere sostituito con il sistema di autenticazione reale.
app.use((req: any, _res, next) => {
  // Esempio: utente admin
  req.user = {
    id: 1,
    name: 'Admin',
    roles: ['ADMIN'],
  };
  next();
});

app.use('/api/admin/supplier-companies', supplierCompaniesAdminRoutes);

export default app;
