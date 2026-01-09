import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AccountActivationPage from "./pages/AccountActivationPage";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate/:token" element={<AccountActivationPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
