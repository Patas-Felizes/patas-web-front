import React, { useState } from 'react';
import './PetCard.css';

const PetCard = ({ pet }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const formatarIdade = (idade) => {
    return `${idade.valor} ${idade.unidade}`;
  };

  return (
    <div className="pet-card">
      {imageError ? (
        <div className="pet-card-image-placeholder">
          <div>
            <small>Foto não disponível</small>
          </div>
        </div>
      ) : (
        <img 
          src={pet.foto} 
          alt={pet.nome} 
          className="pet-card-image"
          onError={handleImageError}
        />
      )}
      
      <div className="pet-card-info">
        <h3>{pet.nome}</h3>
        <p><strong>Idade:</strong> {formatarIdade(pet.idade)}</p>
        <p><strong>Sexo:</strong> {pet.sexo}</p>
        <p><strong>Espécie:</strong> {pet.especie}</p>
      </div>
    </div>
  );
};

export default PetCard;