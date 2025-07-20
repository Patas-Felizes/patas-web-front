import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChevronDown, FaBuilding } from 'react-icons/fa';
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
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Patas Felizes" className="logo-image" />
      </Link>
      
      {user && userData && !isOngSelectionPage && (isAdotante || (isProtetor && selectedOng)) && (
        <ul className="navbar-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              {isProtetor ? 'Animais' : 'Pets'}
            </Link>
          </li>
          {isProtetor && (
            <li>
              <Link 
                to="/solicitacoes-adocao" 
                className={location.pathname === '/solicitacoes-adocao' ? 'active' : ''}
              >
                Solicitações de Adoção
              </Link>
            </li>
          )}
          {isAdotante && (
            <li>
              <Link 
                to="/minhas-solicitacoes" 
                className={location.pathname === '/minhas-solicitacoes' ? 'active' : ''}
              >
                Minhas Solicitações
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
                
                {isProtetor && !isOngSelectionPage && (
                  <>
                    <hr />
                    <div className="ong-section">
                      {selectedOng ? (
                        <div className="current-ong">
                          <div className="ong-info">
                            <FaBuilding className="ong-icon-small" />
                            <span className="ong-name-small">{selectedOng.nome}</span>
                          </div>
                          <button 
                            className="change-ong-button"
                            onClick={handleSelectOng}
                          >
                            Trocar ONG
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="select-ong-button"
                          onClick={handleSelectOng}
                        >
                          <FaBuilding />
                          Selecionar ONG
                        </button>
                      )}
                    </div>
                  </>
                )}
                
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