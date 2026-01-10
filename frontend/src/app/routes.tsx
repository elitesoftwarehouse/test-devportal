import React from 'react';
import { RouteObject } from 'react-router-dom';

// Layouts
import { ExternalLayout, BackofficeLayout, AuthLayout } from '../layouts';
import { ProtectedRoute } from '../features/auth';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// External Pages
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import CollaboratorsPage from '../features/collaborators/pages/CollaboratorsPage';
import OrdersListPage from '../features/orders/pages/OrdersListPage';
import OrderDetailPage from '../features/orders/pages/OrderDetailPage';
import InvoicesPage from '../features/invoices/pages/InvoicesPage';

// Backoffice Pages
import BackofficeDashboardPage from '../features/backoffice/pages/BackofficeDashboardPage';
import AccreditationsPage from '../features/backoffice/pages/AccreditationsPage';
import AccreditationDetailPage from '../features/backoffice/pages/AccreditationDetailPage';
import ResourcesPage from '../features/backoffice/pages/ResourcesPage';
import BackofficeOrdersPage from '../features/backoffice/pages/BackofficeOrdersPage';
import BackofficeInvoicesPage from '../features/backoffice/pages/BackofficeInvoicesPage';

export const routes: RouteObject[] = [
  // Auth routes (public)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // External user routes (authenticated)
  {
    element: (
      <ProtectedRoute roles={['EXTERNAL_OWNER', 'EXTERNAL_COLLABORATOR']}>
        <ExternalLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/collaborators', element: <CollaboratorsPage /> },
      { path: '/orders', element: <OrdersListPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '/invoices', element: <InvoicesPage /> },
    ],
  },

  // Backoffice routes (IT_OPERATOR, SYS_ADMIN)
  {
    element: (
      <ProtectedRoute roles={['IT_OPERATOR', 'SYS_ADMIN']}>
        <BackofficeLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/backoffice', element: <BackofficeDashboardPage /> },
      { path: '/backoffice/accreditations', element: <AccreditationsPage /> },
      { path: '/backoffice/accreditations/:id', element: <AccreditationDetailPage /> },
      { path: '/backoffice/resources', element: <ResourcesPage /> },
      { path: '/backoffice/orders', element: <BackofficeOrdersPage /> },
      { path: '/backoffice/invoices', element: <BackofficeInvoicesPage /> },
    ],
  },
];

export default routes;

