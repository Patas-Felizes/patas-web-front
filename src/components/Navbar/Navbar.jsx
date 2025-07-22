import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChevronDown, FaBuilding, FaPaw } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import { logoutUser } from '../../services/auth';
import './Navbar.css';
import logo from '../../assets/images/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, setUser, setUserData } = useAuth();
  const { selectedOng, clearSelectedOng } = useOng();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isOngSelectionPage = location.pathname === '/select-ong' || 
                            location.pathname === '/create-ong' || 
                            location.pathname.startsWith('/create-ong/') ||
                            location.pathname.startsWith('/ong-details/');

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      setUser(null);
      setUserData(null);
      clearSelectedOng();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const handleSelectOng = () => {
    setShowUserMenu(false);
    navigate('/select-ong');
  };

  const getUserTypeLabel = () => {
    if (userData?.tipoUsuario === 'protetor') return 'Protetor';
    if (userData?.tipoUsuario === 'adotante') return 'Adotante';
    return 'Usuário';
  };

  const getUserTypeWithOng = () => {
    if (userData?.tipoUsuario === 'protetor' && selectedOng && !isOngSelectionPage) {
      return `Protetor do(a) ${selectedOng.nome}`;
    }
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
  const isAdotante = userData?.tipoUsuario === 'adotante';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Patas Felizes" className="logo-image" />
        </Link>
        
        {user && userData && !isOngSelectionPage && (isAdotante || (isProtetor && selectedOng)) && (
          <ul className="navbar-links">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                <FaPaw className="nav-icon" />
                <span>{isProtetor ? 'Animais' : 'Pets'}</span>
              </Link>
            </li>
            {isProtetor && (
              <li>
                <Link 
                  to="/solicitacoes-adocao" 
                  className={location.pathname === '/solicitacoes-adocao' ? 'active' : ''}
                >
                  <FaUser className="nav-icon" />
                  <span>Solicitações</span>
                </Link>
              </li>
            )}
            {isAdotante && (
              <li>
                <Link 
                  to="/minhas-solicitacoes" 
                  className={location.pathname === '/minhas-solicitacoes' ? 'active' : ''}
                >
                  <FaUser className="nav-icon" />
                  <span>Minhas Solicitações</span>
                </Link>
              </li>
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
                  <span className="user-type">{getUserTypeWithOng()}</span>
                </div>
                <FaChevronDown className={`dropdown-icon ${showUserMenu ? 'rotated' : ''}`} />
              </div>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar-large">
                      {getInitials()}
                    </div>
                    <div className="user-details">
                      <p className="user-name-large">{userData.nome}</p>
                      <p className="user-email">{userData.email}</p>
                      <span className="user-type-badge">{getUserTypeWithOng()}</span>
                    </div>
                  </div>
                  
                  {isProtetor && !isOngSelectionPage && (
                    <>
                      <div className="dropdown-divider"></div>
                      <div className="ong-section">
                        {selectedOng ? (
                          <div className="current-ong">
                            <div className="ong-info">
                              <div className="ong-icon-wrapper">
                                <FaBuilding className="ong-icon-small" />
                              </div>
                              <div className="ong-details">
                                <span className="ong-label">ONG Atual</span>
                                <span className="ong-name-small">{selectedOng.nome}</span>
                                {selectedOng.endereco?.cidade && selectedOng.endereco?.estado && (
                                  <span className="ong-location">
                                    {selectedOng.endereco.cidade}, {selectedOng.endereco.estado}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button 
                              className="change-ong-button"
                              onClick={handleSelectOng}
                            >
                              <FaBuilding />
                              <span>Trocar ONG</span>
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="select-ong-button"
                            onClick={handleSelectOng}
                          >
                            <FaBuilding />
                            <span>Selecionar ONG</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <button 
                    className="logout-button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <FaSignOutAlt />
                    <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-pic-placeholder"></div>
          )}
        </div>
      </div>
      
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