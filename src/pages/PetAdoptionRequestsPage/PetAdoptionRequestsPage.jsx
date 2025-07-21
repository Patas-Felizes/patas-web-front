import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAdoptionRequests } from '../../hooks/useAdoptionRequests';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import { getPetById } from '../../services/firebase';
import './PetAdoptionRequestsPage.css';

const PetAdoptionRequestsPage = () => {
  const { petId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { selectedOng } = useOng();
  const { updateRequestStatus } = useAdoptionRequests();
  
  const [pet, setPet] = useState(location.state?.pet || null);
  const [requests, setRequests] = useState(location.state?.requests || []);
  const [loadingPet, setLoadingPet] = useState(!location.state?.pet);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    if (userData?.tipoUsuario !== 'protetor' || !selectedOng) {
      navigate('/');
    }
  }, [userData, selectedOng, navigate]);

  useEffect(() => {
    const fetchPetData = async () => {
      if (!pet && petId) {
        try {
          const petData = await getPetById(petId);
          setPet(petData);
        } catch (error) {
          console.error('Erro ao buscar pet:', error);
        }
        setLoadingPet(false);
      }
    };

    fetchPetData();
  }, [pet, petId]);

  const handleApprove = async (requestId) => {
    if (window.confirm('Tem certeza que deseja aprovar esta solicitação? O animal será marcado como ADOTADO e não ficará mais visível para outros adotantes.')) {
      try {
        await updateRequestStatus(
          requestId, 
          'aprovada', 
          responseMessage || 'Solicitação aprovada! Entre em contato conosco para finalizar o processo.',
          petId 
        );
        
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'aprovada', responseMessage: responseMessage || 'Solicitação aprovada!', responseDate: new Date() }
              : req
          )
        );
        
        setPet(prevPet => ({ ...prevPet, status: 'Adotado' }));
        
        setResponseMessage('');
        setRespondingTo(null);
        alert('Solicitação aprovada com sucesso! O animal foi marcado como adotado.');
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
        
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'rejeitada', responseMessage, responseDate: new Date() }
              : req
          )
        );
        
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
    
    try {
      let date;
      
      if (timestamp && timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        return 'Data não disponível';
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', timestamp);
      return 'Data não disponível';
    }
  };

  const toggleExpanded = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  if (loadingPet) {
    return (
      <div className="pet-adoption-requests-page">
        <Navbar />
        <div className="loading">Carregando informações...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-adoption-requests-page">
        <Navbar />
        <div className="loading">Pet não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="pet-adoption-requests-page">
      <Navbar />
      <div className="pet-requests-container">
        <div className="page-header">
          <div className="pet-header-info">
            <img src={pet.foto} alt={pet.nome} className="pet-header-image" />
            <div className="pet-header-details">
              <h1>Solicitações para {pet.nome}</h1>
              <p>{pet.especie} • {pet.sexo} • {pet.idade?.valor} {pet.idade?.unidade}</p>
              <p className="pet-status">Status atual: <strong>{pet.status}</strong></p>
              <p className="requests-count-header">
                {requests.length} {requests.length === 1 ? 'solicitação recebida' : 'solicitações recebidas'}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/solicitacoes-adocao')} className="back-button">
              Voltar à Lista
            </button>
            <button onClick={() => navigate(`/pets/${petId}`)} className="view-pet-button">
              Ver Detalhes do Pet
            </button>
          </div>
        </div>

        {pet.status === 'Adotado' && (
          <div className="adopted-warning">
            <p><strong>⚠️ Este animal já foi adotado!</strong> Ele não está mais visível para outros adotantes.</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="no-requests">
            <p>Nenhuma solicitação de adoção para este animal.</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="adopter-info">
                    <h3>{request.informacoesPessoais?.nomeCompleto}</h3>
                    <p className="request-date">Solicitado em: {formatDate(request.dataEnvio)}</p>
                  </div>
                  <div className={`status-badge ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </div>
                </div>

                <div className="request-summary">
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
                          <span className="question">Residência tem proteções?</span>
                          <span className="answer">{request.informacoesLar?.residenciaTemProtecoes ? 'Sim' : 'Não'}</span>
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

                    {request.status === 'em_espera' && pet.status !== 'Adotado' && (
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

                    {pet.status === 'Adotado' && request.status === 'em_espera' && (
                      <div className="adopted-notice">
                        <p><strong>Este animal já foi adotado.</strong> Esta solicitação não pode mais ser processada.</p>
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

export default PetAdoptionRequestsPage;