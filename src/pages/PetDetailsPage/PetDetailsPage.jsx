// src/pages/PetDetailsPage/PetDetailsPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { usePet, usePets } from '../../hooks/usePets'; // Importamos os hooks
import './PetDetailsPage.css';

const PetDetailsPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  // Hook para buscar os dados de um pet específico
  const { pet, loading, error } = usePet(petId);
  
  // Hook para acessar as ações (como remover)
  const { removePet, loading: actionLoading } = usePets();

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
    navigate(-1); // Volta para a página anterior
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
          <button className="adopt-button">
            Solicitar adoção
          </button>
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
            <div className="info-field">
              <label className="info-label">Castração</label>
              <div className="info-value">{pet.castracao ? 'Sim' : 'Não'}</div>
            </div>
            <div className="info-field">
              <label className="info-label">Status</label>
              <div className="info-value">{pet.status}</div>
            </div>
          </div>
          <div className="pet-description">
            <label className="description-label">Sobre</label>
            <div className="description-text">
              {pet.descricao || 'Nenhuma descrição disponível.'}
            </div>
          </div>
          <div className="pet-actions">
            <button onClick={handleBack} className="action-button back-button">Voltar</button>
            <button onClick={handleRemove} disabled={actionLoading} className="action-button remove-button">
              {actionLoading ? 'Removendo...' : 'Remover'}
            </button>
            <button onClick={handleEdit} className="action-button edit-button">Editar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailsPage;