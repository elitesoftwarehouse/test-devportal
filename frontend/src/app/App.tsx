import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { routes } from './routes';
import '../styles/globals.css';

// Router component that uses the routes config
const AppRoutes: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

