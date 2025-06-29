// src/pages/PetRegisterPage/PetRegisterPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { usePets, usePet } from '../../hooks/usePets'; // Importamos os dois hooks
import './PetRegisterPage.css';

const PetRegisterPage = () => {
  const navigate = useNavigate();
  const { petId } = useParams(); // Pega o ID da URL, se existir
  const isEditMode = Boolean(petId);

  const { createPet, editPet, loading: actionLoading } = usePets();
  const { pet: existingPet, loading: fetchLoading } = usePet(petId); // Hook para buscar o pet em modo de edição
  
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
    foto: '' // Armazenará a URL da foto
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Se estiver em modo de edição, preenche o formulário quando os dados do pet chegarem
  useEffect(() => {
    if (isEditMode && existingPet) {
      setPetData({
        nome: existingPet.nome || '',
        especie: existingPet.especie || '',
        idadeValor: existingPet.idade?.valor?.toString() || '',
        idadeUnidade: existingPet.idade?.unidade || 'anos',
        sexo: existingPet.sexo || 'macho',
        castracao: existingPet.castracao?.toString() || 'false',
        status: existingPet.status || 'Para adoção',
        descricao: existingPet.descricao || '',
        foto: existingPet.foto || ''
      });
      setImagePreview(existingPet.foto);
    }
  }, [isEditMode, existingPet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData(prevData => ({ ...prevData, [name]: value }));
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
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await editPet(petId, petData, imageFile); // Chama a função de edição do hook
        alert('Pet atualizado com sucesso!');
      } else {
        await createPet(petData, imageFile); // Chama a função de criação do hook
        alert('Pet cadastrado com sucesso!');
      }
      navigate('/');
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const isLoading = actionLoading || fetchLoading;

  if (fetchLoading) {
    return (
        <div className="register-pet-page">
            <Navbar />
            <div className="loading-message">Carregando dados do pet...</div>
        </div>
    );
  }

  return (
    <div className="register-pet-page">
      <Navbar />
      <form className="register-pet-container" onSubmit={handleSave}>
        <div className="register-pet-left">
          <div className="pet-image-card-placeholder" onClick={handleImageClick}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview do pet" className="image-preview" />
            ) : (
              <div className="add-image-content">
                <span className="add-image-text">Adicionar Foto</span>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
        </div>

        <div className="register-pet-right">
          <h2>{isEditMode ? 'Editar Pet' : 'Cadastrar Novo Pet'}</h2>
          <div className="info-section">
             {/* ... Campos do formulário ... */}
             <div className="info-field full-width">
              <label className="info-label">Nome</label>
              <input type="text" name="nome" value={petData.nome} onChange={handleChange} className="info-input" required />
            </div>
            <div className="info-field">
              <label className="info-label">Espécie</label>
              <input type="text" name="especie" value={petData.especie} onChange={handleChange} className="info-input" required />
            </div>
             <div className="info-field">
              <label className="info-label">Idade</label>
              <div className="idade-input-group">
                <input type="number" name="idadeValor" value={petData.idadeValor} onChange={handleChange} className="info-input-idade" required />
                <select name="idadeUnidade" value={petData.idadeUnidade} onChange={handleChange} className="info-select-idade">
                  <option value="anos">Anos</option>
                  <option value="meses">Meses</option>
                  <option value="dias">Dias</option>
                </select>
              </div>
            </div>
            <div className="info-field">
                <label className="info-label">Sexo</label>
                <select name="sexo" value={petData.sexo} onChange={handleChange} className="info-input">
                    <option value="macho">Macho</option>
                    <option value="fêmea">Fêmea</option>
                </select>
            </div>
            <div className="info-field">
                <label className="info-label">Castração</label>
                <select name="castracao" value={petData.castracao} onChange={handleChange} className="info-input">
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                </select>
            </div>
            <div className="info-field">
              <label className="info-label">Status</label>
              <select name="status" value={petData.status} onChange={handleChange} className="info-input">
                <option>Para adoção</option>
                <option>Adotado</option>
                <option>Em tratamento</option>
              </select>
            </div>
          </div>
          <div className="pet-description">
            <label className="description-label">Sobre</label>
            <textarea name="descricao" value={petData.descricao} onChange={handleChange} className="description-textarea" />
          </div>
          <div className="pet-actions">
            <button type="button" className="action-button cancel-button" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="action-button save-button" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PetRegisterPage;