import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AccreditamentoTestPage from '../pages/AccreditamentoTestPage';

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/testing/accreditamento" element={<AccreditamentoTestPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
