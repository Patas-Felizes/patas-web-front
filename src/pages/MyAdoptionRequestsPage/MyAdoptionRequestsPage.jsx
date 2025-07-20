import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import PetCard from '../../components/PetCard/PetCard';
import { useAdoptionRequests } from '../../hooks/useAdoptionRequests';
import { useAuth } from '../../contexts/AuthContext';
import { getPetById } from '../../services/firebase';
import './MyAdoptionRequestsPage.css';

const MyAdoptionRequestsPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { requests, loading, error, deleteRequest } = useAdoptionRequests();
  const [requestsWithPetData, setRequestsWithPetData] = useState([]);
  const [loadingPetData, setLoadingPetData] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (userData && userData.tipoUsuario !== 'adotante') {
      navigate('/');
    }
  }, [userData, navigate]);

  useEffect(() => {
    const fetchPetData = async () => {
      if (requests.length === 0) {
        setLoadingPetData(false);
        return;
      }

      try {
        const requestsWithPets = await Promise.all(
          requests.map(async (request) => {
            try {
              const pet = await getPetById(request.idAnimal);
              return {
                ...request,
                pet: pet
              };
            } catch (error) {
              console.error('Erro ao buscar pet:', error);
              return request;
            }
          })
        );
        setRequestsWithPetData(requestsWithPets);
      } catch (error) {
        console.error('Erro ao buscar dados dos pets:', error);
        setRequestsWithPetData(requests);
      }
      setLoadingPetData(false);
    };

    fetchPetData();
  }, [requests]);

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
      year: 'numeric'
    });
  };

  const handleCardClick = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleEdit = (request) => {
    navigate(`/formulario-adocao/${request.idAnimal}?edit=${request.id}`);
  };

  const handleDelete = async (request) => {
  if (window.confirm(`Tem certeza que deseja excluir a solicitação para ${request.nomeAnimal}?`)) {
      try {
        await deleteRequest(request.id);
        alert('Solicitação excluída com sucesso!');
        setSelectedRequest(null);
      } catch (error) {
        alert(`Erro ao excluir solicitação: ${error.message}`);
      }
    }
  };

  if (userData && userData.tipoUsuario !== 'adotante') {
    return null;
  }

  if (loading || loadingPetData) {
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
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {requestsWithPetData.length === 0 ? (
          <div className="no-requests">
            <p>Você ainda não fez nenhuma solicitação de adoção.</p>
            <button onClick={() => navigate('/')} className="browse-pets-button">
              Ver Pets Disponíveis
            </button>
          </div>
        ) : (
          <div className="requests-grid">
            {requestsWithPetData.map((request) => (
              <PetCard
                key={request.id}
                pet={request.pet}
                showStatus={true}
                statusText={getStatusText(request.status)}
                statusClass={getStatusClass(request.status)}
                extraInfo={`Solicitado em: ${formatDate(request.dataEnvio)}`}
                onClick={() => handleCardClick(request)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Solicitação - {selectedRequest.nomeAnimal}</h2>
              <button onClick={handleCloseModal} className="close-button">×</button>
            </div>
            
            <div className="modal-body">
              <div className="request-details">
                <p><strong>Status:</strong> {getStatusText(selectedRequest.status)}</p>
                <p><strong>ONG:</strong> {selectedRequest.nomeOng}</p>
                <p><strong>Data da solicitação:</strong> {formatDate(selectedRequest.dataEnvio)}</p>
                {selectedRequest.responseDate && (
                  <p><strong>Data da resposta:</strong> {formatDate(selectedRequest.responseDate)}</p>
                )}
                
                {selectedRequest.responseMessage && (
                  <div className="response-section">
                    <p><strong>Resposta da ONG:</strong></p>
                    <div className="response-message">
                      {selectedRequest.responseMessage}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button onClick={handleCloseModal} className="btn-secondary">
                  Fechar
                </button>
                
                {selectedRequest.status === 'em_espera' && (
                  <>
                    <button 
                      onClick={() => handleEdit(selectedRequest)} 
                      className="btn-primary"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedRequest)} 
                      className="btn-danger"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAdoptionRequestsPage;