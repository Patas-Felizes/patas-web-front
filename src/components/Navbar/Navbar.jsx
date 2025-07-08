import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/auth';
import './Navbar.css';
import logo from '../../assets/images/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, userData, setUser, setUserData } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      setUser(null);
      setUserData(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const getUserTypeLabel = () => {
    if (userData?.tipoUsuario === 'protetor') return 'Protetor';
    if (userData?.tipoUsuario === 'adotante') return 'Adotante';
    return 'Usuário';
  };

  const getInitials = () => {
    if (userData?.nome) {
      return userData.nome
        .split(' ')
        .map(name => name[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return 'U';
  };

  const isProtetor = userData?.tipoUsuario === 'protetor';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Patas Felizes" className="logo-image" />
      </Link>
      
      {user && userData && (
        <ul className="navbar-links">
          <li><Link to="/" className="active">Pets</Link></li>
          {isProtetor && (
            <li><a href="#">Solicitações de Adoção</a></li>
          )}
        </ul>
      )}

      <div className="navbar-profile">
        {user && userData ? (
          <div className="user-section">
            <div 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="profile-pic-placeholder">
                {getInitials()}
              </div>
              <div className="user-info">
                <span className="user-name">{userData.nome}</span>
                <span className="user-type">({getUserTypeLabel()})</span>
              </div>
              <FaChevronDown className={`dropdown-icon ${showUserMenu ? 'rotated' : ''}`} />
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <p className="user-email">{userData.email}</p>
                  <span className="user-type-badge">{getUserTypeLabel()}</span>
                </div>
                <hr />
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <FaSignOutAlt />
                  {loggingOut ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-pic-placeholder"></div>
        )}
      </div>

      {/* Overlay para fechar menu quando clicar fora */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;