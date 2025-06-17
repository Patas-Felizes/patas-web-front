import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './PetRegisterPage.css';

const PetRegisterPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [petData, setPetData] = useState({
    nome: '',
    especie: '',
    idadeValor: '',
    idadeUnidade: 'anos',
    sexo: 'macho',
    castracao: 'false',
    status: 'Para adoção',
    descricao: '',
    foto: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setPetData(prevData => ({
          ...prevData,
          foto: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPetData(prevData => ({
      ...prevData,
      foto: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('Salvando novo pet:', petData);
    alert('Pet cadastrado com sucesso!');
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="register-pet-page">
      <Navbar />
      <form className="register-pet-container" onSubmit={handleSave}>
        <div className="register-pet-left">
          <div className="pet-image-card-placeholder" onClick={handleImageClick}>
            {imagePreview ? (
              <div className="image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Preview do pet" 
                  className="image-preview"
                />
              </div>
            ) : (
              <div className="add-image-content">
                <span className="add-image-text">Adicionar Foto</span>
                <span className="add-image-hint">Clique para selecionar</span>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <div className="register-pet-right">
          <div className="info-section">
            <div className="info-field full-width">
              <label className="info-label">Nome</label>
              <input 
                type="text"
                name="nome"
                value={petData.nome}
                onChange={handleChange}
                className="info-input"
                placeholder="Ex: Paçoca"
                required
              />
            </div>

            <div className="info-field">
              <label className="info-label">Espécie</label>
              <input
                type="text"
                name="especie"
                value={petData.especie}
                onChange={handleChange}
                className="info-input"
                placeholder="Ex: Cachorro"
                required
              />
            </div>

            <div className="info-field">
              <label className="info-label">Idade</label>
              <div className="idade-input-group">
                <input
                  type="number"
                  name="idadeValor"
                  value={petData.idadeValor}
                  onChange={handleChange}
                  className="info-input-idade"
                  placeholder="Ex: 2"
                  required
                />
                <select 
                  name="idadeUnidade"
                  value={petData.idadeUnidade}
                  onChange={handleChange}
                  className="info-select-idade"
                >
                  <option value="Anos">Anos</option>
                  <option value="Meses">Meses</option>
                  <option value="Dias">Dias</option>
                </select>
              </div>
            </div>

            <div className="info-field">
              <label className="info-label">Sexo</label>
              <select 
                name="sexo"
                value={petData.sexo}
                onChange={handleChange}
                className="info-input"
              >
                <option value="macho">Macho</option>
                <option value="fêmea">Fêmea</option>
              </select>
            </div>

            <div className="info-field">
              <label className="info-label">Castração</label>
              <select 
                name="castracao"
                value={petData.castracao}
                onChange={handleChange}
                className="info-input"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div className="info-field">
              <label className="info-label">Status</label>
              <select
                name="status"
                value={petData.status}
                onChange={handleChange}
                className="info-input"
              >
                <option>Para adoção</option>
                <option>Adotado</option>
                <option>Em tratamento</option>
              </select>
            </div>
          </div>

          <div className="pet-description">
            <label className="description-label">Sobre</label>
            <textarea
              name="descricao"
              value={petData.descricao}
              onChange={handleChange}
              className="description-textarea"
              placeholder="Descreva o pet..."
            />
          </div>

          <div className="pet-actions">
            <button type="button" className="action-button cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="action-button save-button">
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PetRegisterPage;