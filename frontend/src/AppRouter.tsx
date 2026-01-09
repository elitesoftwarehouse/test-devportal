import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfessionalProfilePage from './components/profile/ProfessionalProfilePage';
import UserProfileMenu from './components/profile/UserProfileMenu';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="ep-layout">
        <UserProfileMenu />
        <main className="ep-main">
          <Routes>
            <Route path="/profilo/professionista" element={<ProfessionalProfilePage />} />
            {/* Altre route di profilo o portale */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
