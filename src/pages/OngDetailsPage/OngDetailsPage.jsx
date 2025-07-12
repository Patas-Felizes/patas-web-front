import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useOngs } from '../../hooks/useOngs';
import './OngDetailsPage.css';

const OngDetailsPage = () => {
  const { ongId } = useParams();
  const navigate = useNavigate();
  const { ongs, removeOng, loading: actionLoading } = useOngs();
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundOng = ongs.find(o => o.id === ongId);
    setOng(foundOng);
    setLoading(false);
  }, [ongId, ongs]);

  const handleRemove = async () => {
    if (window.confirm(`Tem certeza que deseja remover a ONG ${ong.nome}?`)) {
      try {
        await removeOng(ongId);
        alert('ONG removida com sucesso!');
        navigate('/select-ong');
      } catch (err) {
        alert(`Erro ao remover a ONG: ${err.message}`);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/create-ong/${ongId}`);
  };

  const handleBack = () => {
    navigate('/select-ong');
  };

  if (loading) {
    return (
      <div className="ong-detail-page">
        <Navbar />
        <div className="detail-loading">Carregando informações da ONG...</div>
      </div>
    );
  }

  if (!ong) {
    return (
      <div className="ong-detail-page">
        <Navbar />
        <div className="detail-loading">ONG não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="ong-detail-page">
      <Navbar />
      <div className="ong-detail-container">
        <div className="ong-detail-left">
          <div className="ong-image-card">
            <div className="ong-placeholder-content">
              <span className="ong-placeholder-text">ONG/Abrigo</span>
            </div>
          </div>
          <button onClick={handleBack} className="action-button back-button">Voltar</button>
          <button onClick={handleRemove} disabled={actionLoading} className="action-button remove-button">
            {actionLoading ? 'Removendo...' : 'Remover ONG'}
          </button>
          <button onClick={handleEdit} className="action-button edit-button">Editar ONG</button>
        </div>
        <div className="ong-detail-right">
          <div className="info-section">
            <div className="info-field full-width">
              <label className="info-label">Nome</label>
              <div className="info-value">{ong.nome}</div>
            </div>
            
            <div className="info-field full-width">
              <label className="info-label">Contato</label>
              <div className="info-value">{ong.contato || 'Não informado'}</div>
            </div>

            {ong.endereco && (
              <>
                <div className="info-field">
                  <label className="info-label">Rua/Avenida/Travessa</label>
                  <div className="info-value">{ong.endereco.rua || 'Não informado'}</div>
                </div>

                <div className="info-field">
                  <label className="info-label">Número</label>
                  <div className="info-value">{ong.endereco.numero || 'Não informado'}</div>
                </div>
                
                <div className="info-field">
                  <label className="info-label">Estado</label>
                  <div className="info-value">{ong.endereco.estado || 'Não informado'}</div>
                </div>

                <div className="info-field full-width">
                  <label className="info-label">Cidade</label>
                  <div className="info-value">{ong.endereco.cidade || 'Não informado'}</div>
                </div>
              </>
            )}
          </div>
          
          {ong.participantes && (
            <div className="ong-description">
              <label className="description-label">Participantes</label>
              <div className="description-text">
                {ong.participantes || 'Nenhuma informação sobre participantes.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OngDetailsPage;