import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/images/logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Patas Felizes" className="logo-image" />
      </Link>
      <ul className="navbar-links">
        <li><Link to="/" className="active">Pets</Link></li>
        <li><a href="#">Solicitações de Adoção</a></li>
      </ul>
      <div className="navbar-profile">
        <div className="profile-pic-placeholder"></div>
      </div>
    </nav>
  );
};

export default Navbar;