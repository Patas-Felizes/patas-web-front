import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './OngFormModal.css';

const OngFormModal = ({ ong, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    endereco: {
      numero: '',
      estado: '',
      cidade: ''
    },
    participantes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ong) {
      setFormData({
        nome: ong.nome || '',
        contato: ong.contato || '',
        endereco: {
          numero: ong.endereco?.numero || '',
          estado: ong.endereco?.estado || '',
          cidade: ong.endereco?.cidade || ''
        },
        participantes: ong.participantes || ''
      });
    }
  }, [ong]);

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
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="ong-form-modal">
        <div className="modal-header">
          <h2>{ong ? 'Editar ONG/Abrigo' : 'Nova ONG/Abrigo'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ong-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nome">Nome da ONG/Abrigo *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome da ONG ou abrigo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contato">Contato *</label>
            <input
              type="text"
              id="contato"
              name="contato"
              value={formData.contato}
              onChange={handleChange}
              required
              placeholder="Telefone, email ou responsável"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="endereco.numero">Número</label>
              <input
                type="text"
                id="endereco.numero"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleChange}
                placeholder="Número/Endereço"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endereco.estado">Estado</label>
              <input
                type="text"
                id="endereco.estado"
                name="endereco.estado"
                value={formData.endereco.estado}
                onChange={handleChange}
                placeholder="Estado"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="endereco.cidade">Cidade</label>
            <input
              type="text"
              id="endereco.cidade"
              name="endereco.cidade"
              value={formData.endereco.cidade}
              onChange={handleChange}
              placeholder="Cidade"
            />
          </div>

          <div className="form-group">
            <label htmlFor="participantes">Participantes</label>
            <textarea
              id="participantes"
              name="participantes"
              value={formData.participantes}
              onChange={handleChange}
              placeholder="Descreva os participantes ou membros da ONG"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (ong ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OngFormModal;