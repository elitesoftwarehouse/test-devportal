import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import CompanyAreaPage from "../pages/company/CompanyAreaPage";
import CompanyOnboardingWizard from "../pages/onboarding/CompanyOnboardingWizard";
import { ProtectedRoute } from "./ProtectedRoute";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/azienda"
          element={
            <ProtectedRoute>
              <CompanyAreaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/azienda"
          element={
            <ProtectedRoute allowedRoles={["EXTERNAL_OWNER"]}>
              <CompanyOnboardingWizard />
            </ProtectedRoute>
          }
        />
        {/* altre route esistenti */}
      </Routes>
    </Router>
  );
};

export default AppRouter;
