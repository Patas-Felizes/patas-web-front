import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import ProcedureList from '../../components/ProcedureList/ProcedureList';
import ConsentModal from '../../components/ConsentModal/ConsentModal';
import { usePet, usePets } from '../../hooks/usePets';
import { useAuth } from '../../contexts/AuthContext'; 
import './PetDetailsPage.css';

const PetDetailsPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { pet, loading, error } = usePet(petId);
  const { removePet, loading: actionLoading } = usePets();
  const { userData, isAdotante } = useAuth(); 
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    document.getElementById('root').classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
      document.getElementById('root').classList.remove('no-scroll');
    };
  }, []);

  const handleRemove = async () => {
    if (window.confirm(`Tem certeza que deseja remover o pet ${pet.nome}?`)) {
      try {
        await removePet(petId);
        alert('Pet removido com sucesso!');
        navigate('/');
      } catch (err) {
        alert(`Erro ao remover o pet: ${err.message}`);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-pet/${petId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAdoptRequest = () => {
    if (!userData || !userData.uid) {
      alert('Você precisa estar logado para solicitar adoção.');
      navigate('/login');
      return;
    }
    if (pet.status !== 'Para adoção') {
      alert('Este pet não está disponível para adoção no momento.');
      return;
    }
    setShowConsentModal(true);
  };

  if (loading) {
    return (
      <div className="pet-detail-page">
        <Navbar />
        <div className="detail-loading">Carregando informações do pet...</div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pet-detail-page">
        <Navbar />
        <div className="detail-loading">{error || 'Pet não encontrado.'}</div>
      </div>
    );
  }

  return (
    <div className="pet-detail-page">
      <Navbar />
      <div className="pet-detail-container">
        <div className="pet-detail-left">
          <div className="pet-image-card">
            <img src={pet.foto} alt={pet.nome} className="pet-detail-image" />
          </div>
          <button onClick={handleBack} className="action-button back-button">Voltar</button>
          {isAdotante ? ( 
            <button onClick={handleAdoptRequest} disabled={pet.status !== 'Para adoção'} className="adopt-button">
              {pet.status === 'Para adoção' ? 'Solicitar Adoção' : `Status: ${pet.status}`}
            </button>
          ) : ( 
            <>
              <button onClick={handleRemove} disabled={actionLoading} className="action-button remove-button">
                {actionLoading ? 'Removendo...' : 'Remover pet'}
              </button>
              <button onClick={handleEdit} className="action-button edit-button">Editar pet</button>
            </>
          )}
        </div>
        <div className="pet-detail-right">
          <div className="info-section">
            <div className="info-field full-width">
              <label className="info-label">Nome</label>
              <div className="info-value">{pet.nome}</div>
            </div>
            <div className="info-field">
              <label className="info-label">Espécie</label>
              <div className="info-value">{pet.especie || 'Não informado'}</div>
            </div>
            <div className="info-field">
              <label className="info-label">Idade</label>
              <div className="info-value">
                {pet.idade?.valor ? `${pet.idade.valor} ${pet.idade.unidade}` : 'Não informado'}
              </div>
            </div>
            <div className="info-field">
              <label className="info-label">Sexo</label>
              <div className="info-value">{pet.sexo}</div>
            </div>
            {!isAdotante && ( 
              <div className="info-field">
                <label className="info-label">Status</label>
                <div className="info-value">{pet.status}</div>
              </div>
            )}
          </div>
          <div className="pet-description">
            <label className="description-label">Sobre</label>
            <div className="description-text">
              {pet.descricao || 'Nenhuma descrição disponível.'}
            </div>
          </div>
          <ProcedureList petId={petId} isAdotante={isAdotante} />
        </div>
      </div>

      {showConsentModal && (
        <ConsentModal 
          pet={pet} 
          onClose={() => setShowConsentModal(false)} 
        />
      )}
    </div>
  );
};

export default PetDetailsPage;