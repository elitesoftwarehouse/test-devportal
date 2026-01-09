import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RbacDebugPage from './pages/RbacDebugPage';
// import OtherPage from './pages/OtherPage'; // mantenere le altre pagine già esistenti

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Altre route esistenti */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/rbac-debug" element={<RbacDebugPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
