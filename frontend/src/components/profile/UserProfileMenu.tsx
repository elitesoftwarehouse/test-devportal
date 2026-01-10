import React from 'react';
import { NavLink } from 'react-router-dom';
import './UserProfileMenu.css';

const UserProfileMenu: React.FC = () => {
  return (
    <nav className="ep-user-profile-menu">
      <ul>
        <li>
          <NavLink to="/profilo" className={({ isActive }) => (isActive ? 'active' : '')} end>
            Dati utente
          </NavLink>
        </li>
        <li>
          <NavLink to="/profilo/professionista" className={({ isActive }) => (isActive ? 'active' : '')}>
            Profilo Professionista
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default UserProfileMenu;
