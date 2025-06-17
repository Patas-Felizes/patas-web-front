import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './PetDetailsPage.css';

const PetDetailsPage = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const urlAPIMock = "http://localhost:3000/pets";

  useEffect(() => {
    const fetchPetDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(urlAPIMock);
        const petsData = await response.json();
        const foundPet = petsData.find(p => p.id === parseInt(petId));
        setPet(foundPet);
      } catch (error) {
        console.error("Erro ao buscar detalhes do pet:", error);
        setPet(null);
      }
      setLoading(false);
    };

    fetchPetDetails();
  }, [petId]);

  if (loading) {
    return (
      <div className="pet-detail-page">
        <Navbar />
        <div className="detail-loading">Carregando informações do pet...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-detail-page">
        <Navbar />
        <div className="detail-loading">Pet não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="pet-detail-page">
      <Navbar />
      <div className="pet-detail-container">
        <div className="pet-detail-left">
          <div className="pet-image-card">
            <img 
              src={pet.foto} 
              alt={pet.nome} 
              className="pet-detail-image" 
            />
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
              <select className="info-value-select" defaultValue={pet.sexo || 'Macho'}>
                <option value="macho">Macho</option>
                <option value="fêmea">Fêmea</option>
              </select>
            </div>

            <div className="info-field">
              <label className="info-label">Castração</label>
              <select className="info-value-select" defaultValue={pet.castracao ? 'sim' : 'não'}>
                <option value="sim">Sim</option>
                <option value="não">Não</option>
              </select>
            </div>

            <div className="info-field">
              <label className="info-label">Status</label>
              <select className="info-value-select" defaultValue={pet.status || 'Para adoção'}>
                <option>Para adoção</option>
                <option>Adotado</option>
                <option>Em tratamento</option>
              </select>
            </div>
          </div>

          <div className="pet-description">
            <label className="description-label">Sobre</label>
            <div className="description-text">
              {pet.descricao || 'Nenhuma descrição disponível.'}
            </div>
          </div>

          <div className="pet-actions">
            <button className="action-button back-button">Voltar</button>
            <button className="action-button remove-button">Remover</button>
            <button className="action-button edit-button">Editar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailsPage;