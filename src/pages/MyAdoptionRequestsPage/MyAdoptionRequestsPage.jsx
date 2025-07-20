import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAdoptionRequests } from '../../hooks/useAdoptionRequests';
import { useAuth } from '../../contexts/AuthContext';
import './MyAdoptionRequestsPage.css';

const MyAdoptionRequestsPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { requests, loading, error } = useAdoptionRequests();

  useEffect(() => {
    if (userData && userData.tipoUsuario !== 'adotante') {
      navigate('/');
    }
  }, [userData, navigate]);

  const getStatusText = (status) => {
    const statusMap = {
      'em_espera': 'Em análise',
      'aprovada': 'Aprovada',
      'rejeitada': 'Rejeitada',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'em_espera': 'status-pending',
      'aprovada': 'status-approved',
      'rejeitada': 'status-rejected',
      'cancelada': 'status-cancelled'
    };
    return classMap[status] || 'status-pending';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userData && userData.tipoUsuario !== 'adotante') {
    return null;
  }

  if (loading) {
    return (
      <div className="my-requests-page">
        <Navbar />
        <div className="loading">Carregando suas solicitações...</div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <Navbar />
      <div className="my-requests-container">
        <div className="page-header">
          <h1>Minhas Solicitações de Adoção</h1>
          <button onClick={() => navigate('/')} className="back-button">
            Voltar aos Pets
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="no-requests">
            <p>Você ainda não fez nenhuma solicitação de adoção.</p>
            <button onClick={() => navigate('/')} className="browse-pets-button">
              Ver Pets Disponíveis
            </button>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="animal-info">
                    <h3>{request.nomeAnimal}</h3>
                    <p className="ong-name">ONG: {request.nomeOng}</p>
                  </div>
                  <div className={`status-badge ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </div>
                </div>

                <div className="request-details">
                  <div className="detail-item">
                    <span className="detail-label">Data da solicitação:</span>
                    <span className="detail-value">{formatDate(request.dataEnvio)}</span>
                  </div>

                  {request.responseDate && (
                    <div className="detail-item">
                      <span className="detail-label">Data da resposta:</span>
                      <span className="detail-value">{formatDate(request.responseDate)}</span>
                    </div>
                  )}

                  {request.responseMessage && (
                    <div className="response-message">
                      <span className="detail-label">Mensagem da ONG:</span>
                      <p className="response-text">{request.responseMessage}</p>
                    </div>
                  )}

                  <div className="contact-info">
                    <span className="detail-label">Contato enviado:</span>
                    <span className="detail-value">
                      {request.informacoesPessoais?.nomeCompleto} - {request.informacoesPessoais?.telefone}
                    </span>
                  </div>
                </div>

                <div className="request-actions">
                  <button 
                    onClick={() => navigate(`/pets/${request.idAnimal}`)}
                    className="view-pet-button"
                  >
                    Ver Pet
                  </button>
                  
                  {request.status === 'aprovada' && (
                    <div className="approved-message">
                      <p>🎉 Parabéns! Sua solicitação foi aprovada!</p>
                      <p>Entre em contato com a ONG para finalizar o processo.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAdoptionRequestsPage;