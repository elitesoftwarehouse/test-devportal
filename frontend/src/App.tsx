import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResourceSearchPage from './components/resources/ResourceSearchPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/resources/search" element={<ResourceSearchPage />} />
        <Route path="*" element={<Navigate to="/resources/search" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
