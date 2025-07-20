import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import PetCard from '../../components/PetCard/PetCard';
import { useAdoptionRequests } from '../../hooks/useAdoptionRequests';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import { getPetById } from '../../services/firebase';
import './AdoptionRequestsPage.css';

const AdoptionRequestsPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { selectedOng } = useOng();
  const { requests, loading, error } = useAdoptionRequests();
  const [petsWithRequests, setPetsWithRequests] = useState([]);
  const [loadingPetData, setLoadingPetData] = useState(true);

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

  useEffect(() => {
    const groupRequestsByPet = async () => {
      if (requests.length === 0) {
        setLoadingPetData(false);
        return;
      }

      try {
        const requestsByPet = requests.reduce((acc, request) => {
          const petId = request.idAnimal;
          if (!acc[petId]) {
            acc[petId] = [];
          }
          acc[petId].push(request);
          return acc;
        }, {});

        const petsData = await Promise.all(
          Object.keys(requestsByPet).map(async (petId) => {
            try {
              const pet = await getPetById(petId);
              return {
                ...pet,
                requestCount: requestsByPet[petId].length,
                requests: requestsByPet[petId]
              };
            } catch (error) {
              console.error('Erro ao buscar pet:', error);
              return null;
            }
          })
        );

        setPetsWithRequests(petsData.filter(Boolean));
      } catch (error) {
        console.error('Erro ao processar solicitações:', error);
      }
      setLoadingPetData(false);
    };

    groupRequestsByPet();
  }, [requests]);

  const handlePetClick = (pet) => {
    navigate(`/solicitacoes-adocao/${pet.id}`, { 
      state: { 
        pet, 
        requests: pet.requests 
      } 
    });
  };

  if (userData && userData.tipoUsuario !== 'protetor') {
    return null;
  }

  if (userData && userData.tipoUsuario === 'protetor' && !selectedOng) {
    return null;
  }

  if (loading || loadingPetData) {
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
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {petsWithRequests.length === 0 ? (
          <div className="no-requests">
            <p>Nenhuma solicitação de adoção recebida ainda.</p>
          </div>
        ) : (
          <>
            <p className="pets-count">
              {petsWithRequests.length} {petsWithRequests.length === 1 ? 'animal tem' : 'animais têm'} solicitações de adoção
            </p>
            <div className="requests-grid">
              {petsWithRequests.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  showStatus={true}
                  statusText={`${pet.requestCount} ${pet.requestCount === 1 ? 'solicitação' : 'solicitações'}`}
                  statusClass="requests-count"
                  onClick={() => handlePetClick(pet)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdoptionRequestsPage;