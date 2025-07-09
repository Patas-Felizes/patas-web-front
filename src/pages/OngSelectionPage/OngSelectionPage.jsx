import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import { useOngs } from '../../hooks/useOngs';
import OngFormModal from '../../components/OngFormModal/OngFormModal';
import './OngSelectionPage.css';

const OngSelectionPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { selectOng } = useOng();
  const { ongs, loading, error, createNewOng, editOng, removeOng, clearError } = useOngs();
  
  const [showModal, setShowModal] = useState(false);
  const [editingOng, setEditingOng] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSelectOng = (ong) => {
    selectOng(ong);
    navigate('/');
  };

  const handleCreateOng = () => {
    setEditingOng(null);
    setShowModal(true);
  };

  const handleEditOng = (ong, e) => {
    e.stopPropagation();
    setEditingOng(ong);
    setShowModal(true);
  };

  const handleDeleteOng = async (ongId, e) => {
    e.stopPropagation();
    setConfirmDelete(ongId);
  };

  const confirmDeleteOng = async () => {
    try {
      await removeOng(confirmDelete);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao deletar ONG:', error);
    }
  };

  const handleSaveOng = async (ongData) => {
    try {
      if (editingOng) {
        await editOng(editingOng.id, ongData);
      } else {
        await createNewOng(ongData);
      }
      setShowModal(false);
      setEditingOng(null);
    } catch (error) {
      console.error('Erro ao salvar ONG:', error);
    }
  };

  if (error) {
    return (
      <div className="ong-selection-page">
        <div className="error-container">
          <h2>Erro ao carregar ONGs</h2>
          <p>{error}</p>
          <button onClick={clearError} className="retry-button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ong-selection-page">
      <div className="ong-selection-container">
        <div className="ong-selection-header">
          <h1>Olá, {userData?.nome}!</h1>
          <p>Selecione uma ONG/Abrigo para gerenciar ou cadastre uma nova.</p>
        </div>

        <div className="ong-actions">
          <button className="create-ong-btn" onClick={handleCreateOng}>
            <FaPlus /> Nova ONG/Abrigo
          </button>
        </div>

        {loading ? (
          <div className="loading">Carregando ONGs...</div>
        ) : (
          <div className="ongs-grid">
            {ongs.map(ong => (
              <div
                key={ong.id}
                className="ong-card"
                onClick={() => handleSelectOng(ong)}
              >
                <div className="ong-card-header">
                  <div className="ong-icon">
                    <FaBuilding />
                  </div>
                  <div className="ong-actions-buttons">
                    <button
                      className="edit-btn"
                      onClick={(e) => handleEditOng(ong, e)}
                      title="Editar ONG"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteOng(ong.id, e)}
                      title="Excluir ONG"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="ong-info">
                  <h3>{ong.nome}</h3>
                  {ong.endereco && (
                    <p className="ong-address">
                      📍 {ong.endereco.cidade} - {ong.endereco.estado}
                    </p>
                  )}
                  {ong.telefone && (
                    <p className="ong-contact">📞 {ong.telefone}</p>
                  )}
                  <div className="ong-participants">
                    <FaUsers /> {ong.protetores?.length || 1} protetor(es)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && ongs.length === 0 && (
          <div className="no-ongs">
            <FaBuilding className="no-ongs-icon" />
            <h3>Nenhuma ONG/Abrigo cadastrada</h3>
            <p>Crie sua primeira ONG/Abrigo para começar a gerenciar seus animais.</p>
            <button className="create-first-ong-btn" onClick={handleCreateOng}>
              <FaPlus /> Criar primeira ONG/Abrigo
            </button>
          </div>
        )}

        {showModal && (
          <OngFormModal
            ong={editingOng}
            onSave={handleSaveOng}
            onCancel={() => {
              setShowModal(false);
              setEditingOng(null);
            }}
          />
        )}

        {confirmDelete && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h3>Confirmar Exclusão</h3>
              <p>Tem certeza que deseja excluir esta ONG/Abrigo?</p>
              <p className="warning">Esta ação não pode ser desfeita e todos os dados associados serão perdidos.</p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={confirmDeleteOng}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OngSelectionPage;