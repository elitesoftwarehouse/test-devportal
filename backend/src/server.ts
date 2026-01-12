import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { logger } from './infrastructure/logger';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Mock authentication middleware
app.use((req, _res, next) => {
  const userIdHeader = req.header('x-mock-user-id');
  const userRoleHeader = req.header('x-mock-user-role');

  if (userIdHeader) {
    (req as any).user = {
      id: Number(userIdHeader),
      roles: userRoleHeader ? [userRoleHeader] : ['EXTERNAL_OWNER']
    };
  }

  next();
});

// Mock data store
const mockCompanies: any[] = [];
const mockInvitations: any[] = [];
const mockUsers: any[] = [
  { id: 1, email: 'admin@elite.com', roles: ['SYS_ADMIN'], firstName: 'Admin', lastName: 'User' },
  { id: 2, email: 'operator@elite.com', roles: ['IT_OPERATOR'], firstName: 'Operator', lastName: 'User' },
  { id: 3, email: 'owner@company.com', roles: ['EXTERNAL_OWNER'], firstName: 'External', lastName: 'Owner' }
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    res.json({
      success: true,
      user: { id: user.id, email: user.email, roles: user.roles, firstName: user.firstName, lastName: user.lastName },
      token: `mock-jwt-${user.id}`
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (user) {
    const fullUser = mockUsers.find(u => u.id === user.id) || user;
    res.json({ ...fullUser, roles: user.roles });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Company onboarding
app.get('/api/company/onboarding/status', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  
  const company = mockCompanies.find(c => c.ownerId === user.id);
  res.json({
    hasCompany: !!company,
    onboardingCompleted: company?.onboardingCompleted || false,
    companyId: company?.id || null
  });
});

app.post('/api/company/draft', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  
  const company = {
    id: `company-${Date.now()}`,
    ...req.body,
    ownerId: user.id,
    onboardingCompleted: false,
    createdAt: new Date().toISOString()
  };
  mockCompanies.push(company);
  logger.info(`Company draft created: ${company.id}`);
  res.status(201).json({ companyId: company.id });
});

app.patch('/api/company/:id/draft', (req, res) => {
  const company = mockCompanies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  
  Object.assign(company, req.body);
  logger.info(`Company updated: ${company.id}`);
  res.json({ success: true });
});

app.post('/api/company/:id/confirm', (req, res) => {
  const company = mockCompanies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  
  company.onboardingCompleted = true;
  company.confirmedAt = new Date().toISOString();
  logger.info(`Company onboarding confirmed: ${company.id}`);
  res.json({ success: true, company });
});

// External collaborators invitations
app.get('/api/external-collaborators/invitations', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  
  const invitations = mockInvitations.filter(i => i.inviterId === user.id);
  res.json(invitations);
});

app.post('/api/external-collaborators/invitations', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  
  const invitation = {
    id: `inv-${Date.now()}`,
    invitedEmail: req.body.email,
    status: 'PENDING',
    inviterId: user.id,
    tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    registrationCompleted: false,
    firstActivationAt: null,
    createdAt: new Date().toISOString()
  };
  mockInvitations.push(invitation);
  logger.info(`Invitation created: ${invitation.id} for ${invitation.invitedEmail}`);
  res.status(201).json(invitation);
});

// Accreditation requests (for IT_OPERATOR and SYS_ADMIN)
const mockAccreditationRequests: any[] = [
  { id: 1, requesterEmail: 'external1@company.com', requesterFullName: 'Mario Rossi', status: 'SUBMITTED', createdAt: new Date().toISOString() },
  { id: 2, requesterEmail: 'external2@company.com', requesterFullName: 'Luigi Verdi', status: 'UNDER_REVIEW', createdAt: new Date().toISOString() }
];

app.get('/api/accreditation-requests', (req, res) => {
  const status = req.query.status as string;
  let requests = mockAccreditationRequests;
  if (status) {
    requests = requests.filter(r => r.status === status);
  }
  res.json({
    data: {
      content: requests,
      totalElements: requests.length,
      totalPages: 1,
      number: 0
    }
  });
});

app.get('/api/accreditation-requests/:id', (req, res) => {
  const request = mockAccreditationRequests.find(r => r.id === Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Not found' });
  res.json({ data: request });
});

app.post('/api/accreditation-requests/:id/approve', (req, res) => {
  const request = mockAccreditationRequests.find(r => r.id === Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Not found' });
  request.status = 'APPROVED';
  request.decisionDate = new Date().toISOString();
  logger.info(`Accreditation request ${request.id} approved`);
  res.json({ data: request });
});

app.post('/api/accreditation-requests/:id/reject', (req, res) => {
  const request = mockAccreditationRequests.find(r => r.id === Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Not found' });
  request.status = 'REJECTED';
  request.rejectionNotes = req.body.note;
  request.decisionDate = new Date().toISOString();
  logger.info(`Accreditation request ${request.id} rejected`);
  res.json({ data: request });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info(`🚀 Elite Portal Backend running on http://localhost:${port}`);
  logger.info(`📋 Health check: http://localhost:${port}/api/health`);
});

export default app;
