import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/Navbar/Navbar';
import PetCard from '../../components/PetCard/PetCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { usePets } from '../../hooks/usePets';
import { useAuth } from '../../contexts/AuthContext';
import { useIBGEData } from '../../hooks/useIBGEData';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate(); 
  const { userData } = useAuth();
  const { pets, loading, error, clearError } = usePets();
  const { states, loadCitiesByState, loadingStates } = useIBGEData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    especie: '',
    sexo: '',
    status: '',
    estado: '',
    cidade: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);

  const isProtetor = userData?.tipoUsuario === 'protetor';
  const isAdotante = userData?.tipoUsuario === 'adotante';

  const handleRegisterClick = () => {
    navigate('/register-pet');
  };

  const handleEstadoChange = async (estadoCode) => {
    setFilters(prev => ({
      ...prev,
      estado: estadoCode,
      cidade: '' 
    }));

    if (estadoCode) {
      setLoadingCities(true);
      try {
        const cities = await loadCitiesByState(estadoCode);
        setAvailableCities(cities || []);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        setAvailableCities([]);
      } finally {
        setLoadingCities(false);
      }
    } else {
      setAvailableCities([]);
    }
  };

  const petsFiltrados = useMemo(() => {
  let filteredPets = pets || [];

  if (isAdotante) {
    filteredPets = filteredPets.filter(pet => pet.status === 'Para adoção');
  }

  return filteredPets.filter(pet => {
    if (!pet) return false;
    
    const matchesName = !searchTerm || 
      (pet.nome && pet.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEspecie = !filters.especie || pet.especie === filters.especie;
    const matchesSexo = !filters.sexo || pet.sexo === filters.sexo;
    const matchesStatus = !filters.status || pet.status === filters.status;
    
    let matchesEstado = true;
    let matchesCidade = true;
    
    if (isAdotante) {
      if ((filters.estado || filters.cidade) && (!pet.ong || !pet.ong.endereco)) {
        return false;
      }
      
      matchesEstado = !filters.estado || 
        (pet.ong && pet.ong.endereco && pet.ong.endereco.estado === filters.estado);
      matchesCidade = !filters.cidade || 
        (pet.ong && pet.ong.endereco && pet.ong.endereco.cidade === filters.cidade);
    }
    
    return matchesName && matchesEspecie && matchesSexo && matchesStatus && 
           matchesEstado && matchesCidade;
  });
}, [pets, searchTerm, filters, isAdotante]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      especie: '',
      sexo: '',
      status: '',
      estado: '',
      cidade: ''
    });
    setAvailableCities([]);
  };

  if (error) {
    return (
      <div className="homepage">
        <Navbar />
        <main className="main-content">
          <div className="error-message">
            <p>Erro ao carregar pets: {error}</p>
            <button onClick={clearError} className="retry-button">
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Navbar />
      <main className="main-content">

        <div className="action-bar">
          {isProtetor && (
            <button 
              className="register-pet-btn"
              onClick={handleRegisterClick}
            >
              Cadastrar Pet
            </button>
          )}
          
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            title="Filtrar"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Espécie:</label>
              <select 
                value={filters.especie} 
                onChange={(e) => handleFilterChange('especie', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sexo:</label>
              <select 
                value={filters.sexo} 
                onChange={(e) => handleFilterChange('sexo', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="macho">Macho</option>
                <option value="fêmea">Fêmea</option>
              </select>
            </div>

            {isAdotante && (
              <>
                <div className="filter-group">
                  <label>Estado:</label>
                  <select 
                    value={filters.estado} 
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    disabled={loadingStates}
                  >
                    <option value="">
                      {loadingStates ? 'Carregando...' : 'Todos os estados'}
                    </option>
                    {states.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Cidade:</label>
                  <select 
                    value={filters.cidade} 
                    onChange={(e) => handleFilterChange('cidade', e.target.value)}
                    disabled={!filters.estado || loadingCities}
                  >
                    <option value="">
                      {!filters.estado 
                        ? 'Primeiro selecione um estado' 
                        : loadingCities 
                        ? 'Carregando cidades...' 
                        : 'Todas as cidades'
                      }
                    </option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {isProtetor && (
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Para adoção">Para adoção</option>
                  <option value="Adotado">Adotado</option>
                  <option value="Em tratamento">Em tratamento</option>
                </select>
              </div>
            )}

            <button onClick={clearFilters} className="clear-filters-btn">
              Limpar Filtros
            </button>
          </div>
        )}
        
        <h2>
          {isAdotante ? 'Animais Disponíveis' : 'Pets'} ({petsFiltrados.length})
        </h2>
        
        {loading ? (
          <div className="loading">Carregando pets...</div>
        ) : (
          <div className="pets-grid">
            {petsFiltrados.map(pet => (
              <PetCard key={pet.id} pet={pet} isAdotante={isAdotante} />
            ))}
          </div>
        )}

        {!loading && petsFiltrados.length === 0 && pets && pets.length === 0 && (
          <div className="no-pets">
            <p>
              {isAdotante ? 
                'Nenhum animal disponível para adoção no momento.' : 
                'Nenhum pet cadastrado ainda.'
              }
            </p>
          </div>
        )}

        {!loading && petsFiltrados.length === 0 && pets && pets.length > 0 && (
          <div className="no-pets">
            <p>Nenhum pet encontrado com os filtros aplicados.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;