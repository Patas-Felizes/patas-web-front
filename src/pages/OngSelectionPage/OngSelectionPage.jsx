import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBuilding, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import { useOngs } from '../../hooks/useOngs';
import Navbar from '../../components/Navbar/Navbar';
import './OngSelectionPage.css';

const OngSelectionPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { selectOng } = useOng();
  const { ongs, loading, error, clearError } = useOngs();
  
  const [searchTerm, setSearchTerm] = useState('');

  console.log('OngSelectionPage - ongs:', ongs);
  console.log('OngSelectionPage - loading:', loading);
  console.log('OngSelectionPage - error:', error);
  console.log('OngSelectionPage - userData:', userData);

  const handleSelectOng = (ong) => {
    selectOng(ong);
    navigate('/');
  };

  const handleCreateOng = () => {
    navigate('/create-ong');
  };

  const handleViewDetails = (ong, e) => {
    e.stopPropagation();
    navigate(`/ong-details/${ong.id}`);
  };

  const ongsFiltradas = useMemo(() => {
    if (!ongs || !Array.isArray(ongs)) {
      console.log('ONGs não é um array válido:', ongs);
      return [];
    }
    
    return ongs.filter(ong => 
      (ong.nome && ong.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ong.endereco?.cidade && ong.endereco.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ong.endereco?.estado && ong.endereco.estado.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [ongs, searchTerm]);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="ong-selection-page">
          <main className="main-content">
            <div className="error-container">
              <h2>Erro ao carregar ONGs</h2>
              <p>{error}</p>
              <button onClick={clearError} className="retry-button">
                Tentar novamente
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ong-selection-page">
        <main className="main-content">
          <div className="action-bar">
            <button className="register-ong-btn" onClick={handleCreateOng}>
              <FaPlus /> Cadastrar Abrigo
            </button>
            
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou localização" 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <h3>Minhas ONGs/Abrigos ({ongsFiltradas.length})</h3>

          {loading ? (
            <div className="loading">Carregando ONGs...</div>
          ) : (
            <div className="ongs-grid">
              {ongsFiltradas.map(ong => (
                <div
                  key={ong.id}
                  className="ong-card"
                  onClick={() => handleSelectOng(ong)}
                >
                  <div className="ong-card-image">
                    <FaBuilding />
                  </div>
                  
                  <div className="ong-card-content">
                    <div className="ong-card-info">
                      <h4>{ong.nome}</h4>
                      {ong.endereco && (ong.endereco.cidade || ong.endereco.estado || ong.endereco.numero || ong.endereco.rua) && (
                        <p className="ong-address">
                          Endereço: {[ong.endereco.rua, ong.endereco.numero, ong.endereco.cidade, ong.endereco.estado].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="ong-card-actions">
                      <button
                        className="details-btn"
                        onClick={(e) => handleViewDetails(ong, e)}
                        title="Ver detalhes"
                      >
                        Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && ongsFiltradas.length === 0 && (!ongs || ongs.length === 0) && (
            <div className="no-ongs">
              <FaBuilding className="no-ongs-icon" />
              <h3>Nenhuma ONG/Abrigo cadastrada</h3>
              <p>Crie sua primeira ONG/Abrigo para começar a gerenciar seus animais.</p>
              <button className="create-first-ong-btn" onClick={handleCreateOng}>
                <FaPlus /> Criar primeira ONG/Abrigo
              </button>
            </div>
          )}

          {!loading && ongsFiltradas.length === 0 && ongs && ongs.length > 0 && (
            <div className="no-ongs">
              <p>Nenhuma ONG/Abrigo encontrada com o termo pesquisado.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default OngSelectionPage;