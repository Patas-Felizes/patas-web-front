import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAdoptionRequests } from '../../hooks/useAdoptionRequests';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import './AdoptionRequestsPage.css';

const AdoptionRequestsPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { selectedOng } = useOng();
  const { requests, loading, error, updateRequestStatus } = useAdoptionRequests();
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    if (userData && userData.tipoUsuario !== 'protetor') {
      navigate('/');
      return;
    }
    if (userData && userData.tipoUsuario === 'protetor' && !selectedOng) {
      navigate('/select-ong');
      return;
    }
  }, [userData, selectedOng, navigate]);

  const handleApprove = async (requestId) => {
    if (window.confirm('Tem certeza que deseja aprovar esta solicitação?')) {
      try {
        await updateRequestStatus(requestId, 'aprovada', responseMessage || 'Solicitação aprovada! Entre em contato conosco para finalizar o processo.');
        setResponseMessage('');
        setRespondingTo(null);
        alert('Solicitação aprovada com sucesso!');
      } catch (error) {
        alert(`Erro ao aprovar solicitação: ${error.message}`);
      }
    }
  };

  const handleReject = async (requestId) => {
    if (!responseMessage.trim()) {
      alert('Por favor, informe o motivo da recusa.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja rejeitar esta solicitação?')) {
      try {
        await updateRequestStatus(requestId, 'rejeitada', responseMessage);
        setResponseMessage('');
        setRespondingTo(null);
        alert('Solicitação rejeitada.');
      } catch (error) {
        alert(`Erro ao rejeitar solicitação: ${error.message}`);
      }
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'em_espera': 'Aguardando análise',
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

  const toggleExpanded = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  if (userData && userData.tipoUsuario !== 'protetor') {
    return null;
  }

  if (userData && userData.tipoUsuario === 'protetor' && !selectedOng) {
    return null;
  }

  if (loading) {
    return (
      <div className="adoption-requests-page">
        <Navbar />
        <div className="loading">Carregando solicitações...</div>
      </div>
    );
  }

  return (
    <div className="adoption-requests-page">
      <Navbar />
      <div className="adoption-requests-container">
        <div className="page-header">
          <h1>Solicitações de Adoção</h1>
          <div className="header-info">
            <span className="ong-name">ONG: {selectedOng?.nome}</span>
            <button onClick={() => navigate('/')} className="back-button">
              Voltar aos Animais
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="no-requests">
            <p>Nenhuma solicitação de adoção recebida ainda.</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="animal-info">
                    <h3>{request.nomeAnimal}</h3>
                    <p className="adopter-name">Solicitante: {request.informacoesPessoais?.nomeCompleto}</p>
                  </div>
                  <div className={`status-badge ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </div>
                </div>

                <div className="request-summary">
                  <div className="summary-item">
                    <span className="summary-label">Data da solicitação:</span>
                    <span>{formatDate(request.dataEnvio)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Contato:</span>
                    <span>{request.informacoesPessoais?.telefone} - {request.informacoesPessoais?.email}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Endereço:</span>
                    <span>
                      {request.endereco?.cidade}, {request.endereco?.estado} - 
                      {request.informacoesLar?.moraEmCasaOuApartamento || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="request-actions-top">
                  <button 
                    onClick={() => toggleExpanded(request.id)}
                    className="toggle-details-button"
                  >
                    {expandedRequest === request.id ? 'Ocultar Detalhes' : 'Ver Detalhes Completos'}
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/pets/${request.idAnimal}`)}
                    className="view-pet-button"
                  >
                    Ver Animal
                  </button>
                </div>

                {expandedRequest === request.id && (
                  <div className="expanded-details">
                    <div className="details-section">
                      <h4>Informações Pessoais</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Nome:</span>
                          <span>{request.informacoesPessoais?.nomeCompleto}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">E-mail:</span>
                          <span>{request.informacoesPessoais?.email}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Telefone:</span>
                          <span>{request.informacoesPessoais?.telefone}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Data de Nascimento:</span>
                          <span>{request.informacoesPessoais?.dataNascimento}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Endereço</h4>
                      <div className="address-full">
                        {request.endereco?.rua}, {request.endereco?.numero} - 
                        {request.endereco?.bairro}, {request.endereco?.cidade}/{request.endereco?.estado} - 
                        CEP: {request.endereco?.cep}
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Fotos dos Ambientes</h4>
                      {request.fotosAmbiente && request.fotosAmbiente.length > 0 ? (
                        <div className="photos-grid">
                          {request.fotosAmbiente.map((photo, index) => (
                            <img 
                              key={index} 
                              src={photo} 
                              alt={`Ambiente ${index + 1}`}
                              className="environment-photo"
                            />
                          ))}
                        </div>
                      ) : (
                        <p>Nenhuma foto enviada</p>
                      )}
                    </div>

                    <div className="details-section">
                      <h4>Informações sobre o Lar</h4>
                      <div className="questionnaire-responses">
                        <div className="response-item">
                          <span className="question">Mora em casa ou apartamento?</span>
                          <span className="answer">{request.informacoesLar?.moraEmCasaOuApartamento}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">Permitido animais no imóvel?</span>
                          <span className="answer">{request.informacoesLar?.permitidoAnimaisImovel ? 'Sim' : 'Não'}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">Outros animais na casa:</span>
                          <span className="answer">{request.informacoesLar?.outrosAnimaisNaCasa || 'Não informado'}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">História de animais anteriores:</span>
                          <span className="answer">{request.informacoesLar?.historiaAnimaisAnteriores || 'Não informado'}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">Plano de adaptação:</span>
                          <span className="answer">{request.informacoesLar?.espacoParaBrigaTerritorial || 'Não informado'}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">Ciente da expectativa de vida?</span>
                          <span className="answer">{request.informacoesLar?.cienteExpectativaVida ? 'Sim' : 'Não'}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">Família de acordo?</span>
                          <span className="answer">{request.informacoesLar?.familiaDeAcordo ? 'Sim' : 'Não'}</span>
                        </div>
                        <div className="response-item">
                          <span className="question">Concorda em enviar notícias?</span>
                          <span className="answer">{request.informacoesLar?.concordaEnviarFotosNoticias ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>
                    </div>

                    {request.status === 'em_espera' && (
                      <div className="response-section">
                        <h4>Responder Solicitação</h4>
                        <textarea
                          value={respondingTo === request.id ? responseMessage : ''}
                          onChange={(e) => {
                            setResponseMessage(e.target.value);
                            setRespondingTo(request.id);
                          }}
                          placeholder="Digite uma mensagem para o adotante (obrigatório para recusa, opcional para aprovação)"
                          className="response-textarea"
                        />
                        <div className="response-actions">
                          <button 
                            onClick={() => handleApprove(request.id)}
                            className="approve-button"
                          >
                            Aprovar Solicitação
                          </button>
                          <button 
                            onClick={() => handleReject(request.id)}
                            className="reject-button"
                          >
                            Rejeitar Solicitação
                          </button>
                        </div>
                      </div>
                    )}

                    {request.responseMessage && (
                      <div className="previous-response">
                        <h4>Sua Resposta</h4>
                        <p>{request.responseMessage}</p>
                        <small>Enviada em: {formatDate(request.responseDate)}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptionRequestsPage;