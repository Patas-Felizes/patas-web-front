import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useOngs } from '../../hooks/useOngs';
import './OngCreatePage.css';

const OngCreatePage = () => {
  const { ongId } = useParams();
  const isEditMode = Boolean(ongId);
  const navigate = useNavigate();
  const { ongs, createNewOng, editOng, loading } = useOngs();
  const [existingOng, setExistingOng] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    endereco: {
      rua: '',
      numero: '',
      estado: '',
      cidade: ''
    },
    participantes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && ongs.length > 0) {
      const foundOng = ongs.find(o => o.id === ongId);
      if (foundOng) {
        setExistingOng(foundOng);
        setFormData({
          nome: foundOng.nome || '',
          contato: foundOng.contato || '',
          endereco: {
            rua: foundOng.endereco?.rua || '',
            numero: foundOng.endereco?.numero || '',
            estado: foundOng.endereco?.estado || '',
            cidade: foundOng.endereco?.cidade || ''
          },
          participantes: foundOng.participantes || ''
        });
      }
      setFetchLoading(false);
    }
  }, [isEditMode, ongId, ongs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      return 'Nome da ONG é obrigatório';
    }
    if (!formData.contato.trim()) {
      return 'Contato é obrigatório';
    }
    if (!formData.endereco.cidade.trim()) {
      return 'Cidade é obrigatória';
    }
    if (!formData.endereco.estado.trim()) {
      return 'Estado é obrigatório';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (isEditMode) {
        await editOng(ongId, formData);
        alert('ONG/Abrigo atualizado com sucesso!');
        navigate(`/ong-details/${ongId}`);
      } else {
        await createNewOng(formData);
        alert('ONG/Abrigo criado com sucesso!');
        navigate('/select-ong');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/ong-details/${ongId}`);
    } else {
      navigate('/select-ong');
    }
  };

  if (fetchLoading) {
    return (
      <div className="ong-create-page">
        <Navbar />
        <div className="loading-message">Carregando dados da ONG...</div>
      </div>
    );
  }

  return (
    <div className="ong-create-page">
      <Navbar />
      <form className="ong-create-container" onSubmit={handleSubmit}>
        <div className="ong-create-left">
          <div className="ong-image-placeholder">
            <div className="ong-placeholder-content">
              <span className="ong-placeholder-text">ONG/Abrigo</span>
            </div>
          </div>
          <button type="button" className="action-button cancel-button" onClick={handleCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="action-button save-button" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        <div className="ong-create-right">
          <h2 style={{ textAlign: 'left' }}>
            {isEditMode ? 'Editar ONG/Abrigo' : 'Cadastrar Nova ONG/Abrigo'}
          </h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="info-section">
            <div className="info-field full-width">
              <label className="info-label">Nome da ONG/Abrigo *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="info-input"
                required
                placeholder="Digite o nome da ONG ou abrigo"
              />
            </div>

            <div className="info-field full-width">
              <label className="info-label">Contato *</label>
              <input
                type="text"
                name="contato"
                value={formData.contato}
                onChange={handleChange}
                className="info-input"
                required
                placeholder="Telefone, email ou responsável"
              />
            </div>

            <div className="info-field">
              <label className="info-label">Rua/Avenida/Travessa</label>
              <input
                type="text"
                name="endereco.rua"
                value={formData.endereco.rua}
                onChange={handleChange}
                className="info-input"
                placeholder="Rua/Avenida/Travessa"
              />
            </div>

            <div className="info-field">
              <label className="info-label">Número</label>
              <input
                type="text"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleChange}
                className="info-input"
                placeholder="Nº"
              />
            </div>

            <div className="info-field">
              <label className="info-label">Estado *</label>
              <input
                type="text"
                name="endereco.estado"
                value={formData.endereco.estado}
                onChange={handleChange}
                className="info-input"
                required
                placeholder="Estado"
              />
            </div>

            <div className="info-field full-width">
              <label className="info-label">Cidade *</label>
              <input
                type="text"
                name="endereco.cidade"
                value={formData.endereco.cidade}
                onChange={handleChange}
                className="info-input"
                required
                placeholder="Cidade"
              />
            </div>
          </div>

          <div className="ong-description">
            <label className="description-label">Participantes</label>
            <textarea
              name="participantes"
              value={formData.participantes}
              onChange={handleChange}
              className="description-textarea"
              placeholder="Descreva os participantes ou membros da ONG"
              rows="3"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default OngCreatePage;