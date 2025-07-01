import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/Navbar/Navbar';
import PetCard from '../../components/PetCard/PetCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { usePets } from '../../hooks/usePets';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate(); 
  const { pets, loading, error, clearError } = usePets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    especie: '',
    sexo: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleRegisterClick = () => {
    navigate('/register-pet');
  };

  const petsFiltrados = useMemo(() => {
    return pets.filter(pet => {
      const matchesName = pet.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEspecie = !filters.especie || pet.especie === filters.especie;
      const matchesSexo = !filters.sexo || pet.sexo === filters.sexo;
      const matchesStatus = !filters.status || pet.status === filters.status;
      
      return matchesName && matchesEspecie && matchesSexo && matchesStatus;
    });
  }, [pets, searchTerm, filters]);

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
      status: ''
    });
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
          <button 
            className="register-pet-btn"
            onClick={handleRegisterClick}
          >
            Cadastrar Pet
          </button>
          
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

            <button onClick={clearFilters} className="clear-filters-btn">
              Limpar Filtros
            </button>
          </div>
        )}
        
        <h2>Pets ({petsFiltrados.length})</h2>
        
        {loading ? (
          <div className="loading">Carregando pets...</div>
        ) : (
          <div className="pets-grid">
            {petsFiltrados.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}

        {!loading && petsFiltrados.length === 0 && pets.length === 0 && (
          <div className="no-pets">
            <p>Nenhum pet cadastrado ainda.</p>
            <button 
              onClick={handleRegisterClick}
              className="register-pet-btn"
            >
              Cadastrar primeiro pet
            </button>
          </div>
        )}

        {!loading && petsFiltrados.length === 0 && pets.length > 0 && (
          <div className="no-pets">
            <p>Nenhum pet encontrado com os filtros aplicados.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;