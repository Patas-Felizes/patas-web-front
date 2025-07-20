import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOngById } from '../../services/ongs';
import './ConsentModal.css';

const ConsentModal = ({ pet, onClose }) => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [orgName, setOrgName] = useState('nossa organização');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgName = async () => {
      if (pet?.ongId) {
        try {
          const ong = await getOngById(pet.ongId);
          setOrgName(ong.nome || 'nossa organização');
        } catch (error) {
          console.error('Erro ao buscar ONG:', error);
          setOrgName('nossa organização');
        }
      }
      setLoading(false);
    };

    fetchOrgName();
  }, [pet?.ongId]);

  const handleProceed = () => {
    if (!accepted) {
      alert('Você deve aceitar o termo para continuar');
      return;
    }
    
    navigate(`/formulario-adocao/${pet.id}`);
    onClose();
  };

  if (loading) {
    return (
      <div className="consent-modal-overlay">
        <div className="consent-modal-container">
          <div className="consent-modal-content">
            <p>Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal-container">
        <div className="consent-modal-header">
          <h2>Termo de Consentimento para Preenchimento do Formulário de Adoção</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="consent-modal-content">
          <p><strong> Ao preencher e enviar este formulário de solicitação de adoção, você concorda com o seguinte:</strong></p>
          
          <div className="consent-terms">
            <div className="term-item">
              <strong>Finalidade:</strong> Suas informações (dados pessoais, endereço, fotos do lar e respostas sobre o ambiente) são coletadas exclusivamente para avaliar sua adequação para a adoção de um animal, garantir o bem-estar do pet e facilitar a comunicação durante o processo.
            </div>

            <div className="term-item">
              <strong>Uso dos Dados:</strong> Seus dados serão acessados e utilizados apenas pela equipe da <strong>{orgName}</strong> responsável pela avaliação das adoções. Eles não serão compartilhados com terceiros para fins comerciais ou outros que não os aqui previstos.
            </div>

            <div className="term-item">
              <strong>Voluntariedade:</strong> O fornecimento destas informações é totalmente voluntário. Você pode revogar seu consentimento a qualquer momento, excluindo a sua solicitação, o que interromperá o processo de adoção e resultará na exclusão dos seus dados (salvo exigências legais).
            </div>

            <div className="term-item">
              <strong>Compromisso:</strong> Ao prosseguir, você declara que leu e compreendeu este termo, concorda com o tratamento dos seus dados para os fins descritos e que as informações fornecidas são verdadeiras.
            </div>
          </div>

          <p className="thanks-message">
            Agradecemos sua compreensão e seu interesse em oferecer um lar feliz a um de nossos animais!
          </p>

          <div className="consent-checkbox">
            <label>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              Li e aceito os termos de consentimento para preenchimento do formulário
            </label>
          </div>

          <div className="consent-actions">
            <button onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button 
              onClick={handleProceed} 
              disabled={!accepted}
              className="proceed-button"
            >
              Ir para Formulário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;