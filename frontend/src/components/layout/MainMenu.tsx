import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MainMenu: React.FC = () => {
  const { user } = useAuth();

  const isExternalOwner = user?.role === "EXTERNAL_OWNER";

  return (
    <nav className="ep-main-menu">
      {/* voci di menu esistenti */}
      <NavLink to="/dashboard" className="ep-menu-item">
        Dashboard
      </NavLink>
      {/* ...altre voci */}

      {isExternalOwner && (
        <NavLink to="/onboarding/azienda" className="ep-menu-item">
          Primo accreditamento azienda
        </NavLink>
      )}
    </nav>
  );
};

export default MainMenu;
