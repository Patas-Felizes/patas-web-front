import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../../components/Navbar/Navbar';
import PetCard from '../../components/PetCard/PetCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); 

  const urlAPIMock = "http://localhost:3000/pets";

  useEffect(() => {
    fetchPets();
  }, []);

  async function fetchPets() {
    setLoading(true);
    try {
      const response = await fetch(urlAPIMock);
      const petsData = await response.json();
      setPets(petsData);
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
      setPets([]);
    }
    setLoading(false);
  }

  const handleRegisterClick = () => {
    navigate('/register-pet');
  };

  const petsFiltrados = pets.filter(pet => 
    pet.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Pesquisar" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="filter-btn" title="Filtrar">
            <FaFilter />
          </button>
        </div>
        
        <h2>Pets</h2>
        
        {loading ? (
          <div className="loading">Carregando pets...</div>
        ) : (
          <div className="pets-grid">
            {petsFiltrados.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}

        {!loading && petsFiltrados.length === 0 && (
          <div className="no-pets">
            <p>Nenhum pet encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;