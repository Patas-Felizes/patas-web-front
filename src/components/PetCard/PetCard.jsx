import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PetCard.css';

const PetCard = ({ 
  pet, 
  isAdotante, 
  showStatus = false, 
  statusText = '', 
  statusClass = '', 
  extraInfo = '', 
  onClick = null, 
  linkTo = null 
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatarIdade = (idade) => {
    if (!idade?.valor) return 'Idade não informada';
    return `${idade.valor} ${idade.unidade}`;
  };

  const cardContent = (
  <div className="pet-card">
    {!pet.foto || imageError ? (
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
      
      {showStatus && statusText && (
        <div className={`pet-card-status ${statusClass}`}>
          {statusText}
        </div>
      )}
      
      {extraInfo && (
        <div className="pet-card-extra-info">
          {extraInfo}
        </div>
      )}
    </div>
  </div>
);

  if (onClick) {
    return (
      <div className="pet-card-link" onClick={onClick} style={{ cursor: 'pointer' }}>
        {cardContent}
      </div>
    );
  }

  if (linkTo) {
    return (
      <Link to={linkTo} className="pet-card-link">
        {cardContent}
      </Link>
    );
  }

  return (
    <Link to={`/pets/${pet.id}`} className="pet-card-link">
      {cardContent}
    </Link>
  );
};

export default PetCard;