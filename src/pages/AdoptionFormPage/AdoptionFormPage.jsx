import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';
import { useAdoptionRequests } from '../../hooks/useAdoptionRequests';
import { usePet } from '../../hooks/usePets';
import { useIBGEData } from '../../hooks/useIBGEData';
import './AdoptionFormPage.css';

const AdoptionFormPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { selectedOng } = useOng();
  const { createRequest, loading } = useAdoptionRequests();
  const { pet, loading: petLoading } = usePet(petId);
  const { states, loadCitiesByState, loadingStates, loadingCities } = useIBGEData();

  const [formData, setFormData] = useState({
    nomeCompleto: userData?.nome || '',
    email: userData?.email || '',
    dataNascimento: '',
    telefone: '',
    
    rua: '',
    numero: '',
    cep: '',
    bairro: '',
    estado: '',
    cidade: '',
    
    moraEmCasaOuApartamento: '',
    permitidoAnimaisImovel: '',
    residenciaTemProtecoes: '',
    outrosAnimaisNaCasa: '',
    historiaAnimaisAnteriores: '',
    espacoParaBrigaTerritorial: '',
    cienteExpectativaVida: '',
    familiaDeAcordo: '',
    concordaEnviarFotosNoticias: '',
    
    declaracaoVerdadeira: false
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    if (userData?.tipoUsuario !== 'adotante') {
      navigate('/');
    }
  }, [userData, navigate]);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    document.getElementById('root').classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
      document.getElementById('root').classList.remove('no-scroll');
    };
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (formData.estado) {
        try {
          const cities = await loadCitiesByState(formData.estado);
          setAvailableCities(cities);
          
          if (formData.cidade && !cities.includes(formData.cidade)) {
            setFormData(prev => ({
              ...prev,
              cidade: ''
            }));
          }
        } catch (error) {
          console.error('Erro ao carregar cidades:', error);
          setAvailableCities([]);
        }
      } else {
        setAvailableCities([]);
      }
    };
    loadCities();
  }, [formData.estado, loadCitiesByState]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotoError('');

    if (files.length > 3) {
      setPhotoError('Máximo de 3 fotos permitidas');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { 
        setPhotoError('Cada foto deve ter no máximo 5MB');
        return false;
      }
      return true;
    });

    setPhotoFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaracaoVerdadeira) {
      alert('Você deve aceitar a declaração para continuar');
      return;
    }

    if (photoFiles.length < 3) {
      alert('É necessário enviar 3 fotos dos ambientes');
      return;
    }

    try {
      const requestData = {
        idAdotante: userData.uid,
        idOng: selectedOng?.id || pet.ongId,
        idAnimal: pet.id,
        nomeOng: selectedOng?.nome || 'Abrigo',
        nomeAnimal: pet.nome,
        
        informacoesPessoais: {
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          dataNascimento: formData.dataNascimento,
          telefone: formData.telefone
        },
        
        endereco: {
          rua: formData.rua,
          numero: formData.numero,
          cep: formData.cep,
          bairro: formData.bairro,
          estado: formData.estado,
          cidade: formData.cidade
        },
        
        informacoesLar: {
          moraEmCasaOuApartamento: formData.moraEmCasaOuApartamento,
          permitidoAnimaisImovel: formData.permitidoAnimaisImovel === 'sim',
          residenciaTemProtecoes: formData.residenciaTemProtecoes === 'sim',
          outrosAnimaisNaCasa: formData.outrosAnimaisNaCasa,
          historiaAnimaisAnteriores: formData.historiaAnimaisAnteriores,
          espacoParaBrigaTerritorial: formData.espacoParaBrigaTerritorial,
          cienteExpectativaVida: formData.cienteExpectativaVida === 'sim',
          familiaDeAcordo: formData.familiaDeAcordo === 'sim',
          concordaEnviarFotosNoticias: formData.concordaEnviarFotosNoticias === 'sim'
        },
        
        declaracaoVerdadeira: formData.declaracaoVerdadeira
      };

      await createRequest(requestData, photoFiles);
      alert('Solicitação de adoção enviada com sucesso!');
      navigate('/minhas-solicitacoes');
    } catch (error) {
      alert(`Erro ao enviar solicitação: ${error.message}`);
    }
  };

  if (petLoading || loadingStates) {
    return (
      <div className="adoption-form-page">
        <Navbar />
        <div className="form-loading">
          {petLoading ? 'Carregando informações do pet...' : 'Carregando estados...'}
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="adoption-form-page">
        <Navbar />
        <div className="form-loading">Pet não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="adoption-form-page">
      <Navbar />
      <div className="adoption-form-container">
        <div className="adoption-form-left">
          <div className="pet-image-card">
            <img src={pet.foto} alt={pet.nome} className="pet-form-image" />
          </div>
          <button 
            type="button" 
            onClick={() => navigate(`/pets/${petId}`)} 
            className="action-button back-button"
          >
            Voltar
          </button>
          <div className="pet-info">
            <h3>{pet.nome}</h3>
            <p><strong>Sexo:</strong> {pet.sexo}</p>
            <p><strong>Idade:</strong> {pet.idade?.valor ? `${pet.idade.valor} ${pet.idade.unidade}` : 'Idade não informada'}</p>
            <p><strong>ONG:</strong> {selectedOng?.nome || pet.nomeOng || 'Abrigo não informado'}</p>
          </div>
        </div>

        <div className="adoption-form-right">
          <div className="form-introduction">
            <p>
                Olá! Para adotar <strong>{pet.nome}</strong>, preencha este questionário e envie fotos de onde ele irá morar. O questionário é detalhado para garantir o bem-estar do animal e evitar devoluções.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="adoption-form">
            <section className="form-section">
              <h3>Informações Pessoais</h3>
              
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Data de Nascimento *</label>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(XX) XXXXX-XXXX"
                  required
                />
              </div>
            </section>

            <section className="form-section">
              <h3>Endereço</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Rua *</label>
                  <input
                    type="text"
                    name="rua"
                    value={formData.rua}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Número *</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="XXXXX-XXX"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    type="text"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                    disabled={loadingStates}
                  >
                    <option value="">
                      {loadingStates ? 'Carregando estados...' : 'Selecione o estado'}
                    </option>
                    {states.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Cidade *</label>
                  <select
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.estado || loadingCities}
                  >
                    <option value="">
                      {!formData.estado 
                        ? 'Primeiro selecione um estado' 
                        : loadingCities 
                        ? 'Carregando cidades...' 
                        : 'Selecione a cidade'
                      }
                    </option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3>Fotos dos Ambientes</h3>
              <p>Envie 3 fotos dos ambientes onde o bichinho irá viver (máx. 5MB cada):</p>
              
              <div className="form-group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
                />
                {photoError && <span className="error-message">{photoError}</span>}
                {photoFiles.length > 0 && (
                  <p className="file-count">{photoFiles.length} foto(s) selecionada(s)</p>
                )}
              </div>
            </section>

            <section className="form-section">
              <h3>Informações sobre o Lar</h3>

              <div className="form-group">
                <label>1. Mora em casa ou apartamento? *</label>
                <select
                  name="moraEmCasaOuApartamento"
                  value={formData.moraEmCasaOuApartamento}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                </select>
              </div>

              <div className="form-group">
                <label>2. Você tem certeza que é permitido animais no imóvel? *</label>
                <select
                  name="permitidoAnimaisImovel"
                  value={formData.permitidoAnimaisImovel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label>3. Sua residência tem proteções (telas, muro, etc) para impedir que o animal tenha acesso à rua? *</label>
                <select
                  name="residenciaTemProtecoes"
                  value={formData.residenciaTemProtecoes}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label>4. Já há outros animais na casa? Se sim, quais e quantos? São castrados e vacinados?</label>
                <textarea
                  name="outrosAnimaisNaCasa"
                  value={formData.outrosAnimaisNaCasa}
                  onChange={handleInputChange}
                  placeholder="Descreva se possui outros animais, quantos, quais tipos e se são castrados e vacinados"
                />
              </div>

              <div className="form-group">
                <label>5. Caso não tenha outros animais atualmente, já teve? Conte a história dele(s):</label>
                <textarea
                  name="historiaAnimaisAnteriores"
                  value={formData.historiaAnimaisAnteriores}
                  onChange={handleInputChange}
                  placeholder="Conte sobre animais que já teve anteriormente"
                />
              </div>

              <div className="form-group">
                <label>6. Se você tem outros animais atualmente, haverá espaço para prevenir uma briga territorial? Terá paciência para fazer a adaptação deles? Como será a adaptação?</label>
                <textarea
                  name="espacoParaBrigaTerritorial"
                  value={formData.espacoParaBrigaTerritorial}
                  onChange={handleInputChange}
                  placeholder="Descreva como será feita a adaptação e se há espaço adequado"
                />
              </div>

              <div className="form-group">
                <label>7. Está ciente da expectativa de vida de um {pet.especie?.toLowerCase()} e se compromete a cuidar bem dele até seu último dia de vida? *</label>
                <select
                  name="cienteExpectativaVida"
                  value={formData.cienteExpectativaVida}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label>8. Toda a família, ou pessoas com quem você divide casa, está de acordo com a adoção? *</label>
                <select
                  name="familiaDeAcordo"
                  value={formData.familiaDeAcordo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="form-group">
                <label>9. Concorda em nos enviar fotos e notícias do animal periodicamente? *</label>
                <select
                  name="concordaEnviarFotosNoticias"
                  value={formData.concordaEnviarFotosNoticias}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="declaration-label">
                  <input
                    type="checkbox"
                    name="declaracaoVerdadeira"
                    checked={formData.declaracaoVerdadeira}
                    onChange={handleInputChange}
                    required
                  />
                  Declaro que todas as informações fornecidas são verdadeiras e que estou ciente de que a adoção é um compromisso de longo prazo. Comprometo-me a cuidar bem do animal adotado, proporcionando-lhe amor, cuidados veterinários adequados e um lar seguro até o fim de sua vida. *
                </label>
              </div>

              <button type="submit" disabled={loading || !formData.declaracaoVerdadeira} className="submit-button">
                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdoptionFormPage;