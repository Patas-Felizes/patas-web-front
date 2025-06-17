import React from 'react';
import './Navbar.css';
import logo from '../../assets/images/logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Patas Felizes" className="logo-image" />
      </div>
      <ul className="navbar-links">
        <li><a href="#" className="active">Pets</a></li>
        <li><a href="#">Solicitações de Adoção</a></li>
      </ul>
      <div className="navbar-profile">
        <div className="profile-pic-placeholder"></div>
      </div>
    </nav>
  );
};

export default Navbar;