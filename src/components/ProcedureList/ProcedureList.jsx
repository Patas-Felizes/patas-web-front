import React, { useState, useEffect } from 'react';
import { useProcedures } from '../../hooks/useProcedures';
import './ProcedureList.css';

const ProcedureList = ({ petId }) => {
  const { procedures, loading, error, createProcedure, removeProcedure, loadProcedures } = useProcedures(petId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProcedure, setNewProcedure] = useState({
    descricao: '',
    categoria: '',
    data_realizacao: '',
  });

  const categorias = [
    'Vacina',
    'Cirurgia',
    'Consulta',
    'Exame',
    'Medicamento',
    'Tratamento',
    'Outros',
  ];

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewProcedure({ descricao: '', categoria: '', data_realizacao: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProcedure((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProcedure = async (e) => {
    e.preventDefault();
    if (newProcedure.descricao && newProcedure.categoria && newProcedure.data_realizacao) {
      try {
        await createProcedure(newProcedure);
        closeAddModal();
      } catch (err) {
        alert(`Erro ao cadastrar procedimento: ${err.message}`);
      }
    }
  };

  const handleRemoveProcedure = async (procedureId, description) => {
    if (window.confirm(`Tem certeza que deseja remover o procedimento "${description}"?`)) {
      try {
        await removeProcedure(procedureId);
        alert('Procedimento removido com sucesso!');
      } catch (err) {
        alert(`Erro ao remover procedimento: ${err.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="loading-message">Carregando procedimentos...</div>;
  }

  if (error) {
    return <div className="error-message">Erro ao carregar procedimentos: {error}</div>;
  }

  return (
    <div className="procedure-section">
      <h3 className="procedure-title">Procedimentos médicos</h3>

      <div className="procedure-list-container">
        <div className="procedure-item add-item">
          <div className="procedure-header add-header" onClick={openAddModal}>
            <div className="add-icon">+</div>
            <span>Adicionar novo procedimento</span>
          </div>
        </div>

        {procedures.length > 0 ? (
          procedures.map((procedure) => (
            <div key={procedure.id} className="procedure-item">
              <div className="procedure-header">
                <div className="procedure-summary">
                  <div className="procedure-description">{procedure.descricao}</div>
                  <span className="procedure-category-display">{procedure.categoria}</span>
                  <span className="procedure-date">
                    {formatDate(procedure.data_realizacao?.toDate ? procedure.data_realizacao.toDate() : procedure.data_realizacao)}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveProcedure(procedure.id, procedure.descricao)}
                  className="remove-procedure-btn"
                >
                  X
                </button>
              </div>
            </div>
          ))
        ) : (
          !showAddModal && (
            <div className="no-procedures">
              <p>Nenhum procedimento médico registrado ainda.</p>
            </div>
          )
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cadastrar Novo Procedimento</h3>
              <button className="close-modal-btn" onClick={closeAddModal}>
                X
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddProcedure} className="add-procedure-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Descrição *</label>
                    <textarea
                      name="descricao"
                      value={newProcedure.descricao}
                      onChange={handleInputChange}
                      placeholder="Descreva o procedimento realizado"
                      required
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria *</label>
                    <select
                      name="categoria"
                      value={newProcedure.categoria}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Data de realização *</label>
                    <input
                      type="date"
                      name="data_realizacao"
                      value={newProcedure.data_realizacao}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeAddModal} className="cancel-btn">
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn">
                    Salvar procedimento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcedureList;