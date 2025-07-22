import { useState, useEffect } from 'react';

export const useIBGEData = () => {
  const [states, setStates] = useState([]);
  const [citiesCache, setCitiesCache] = useState({});
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const statesData = await response.json();
        
        const formattedStates = statesData.map(state => ({
          code: state.sigla,
          name: state.nome,
          id: state.id
        }));
        
        setStates(formattedStates);
      } catch (error) {
        console.error('Erro ao carregar estados do IBGE:', error);
        setStates([
          { code: 'AC', name: 'Acre', id: 12 },
          { code: 'AL', name: 'Alagoas', id: 17 },
          { code: 'AP', name: 'Amapá', id: 16 },
          { code: 'AM', name: 'Amazonas', id: 13 },
          { code: 'BA', name: 'Bahia', id: 29 },
          { code: 'CE', name: 'Ceará', id: 23 },
          { code: 'DF', name: 'Distrito Federal', id: 53 },
          { code: 'ES', name: 'Espírito Santo', id: 32 },
          { code: 'GO', name: 'Goiás', id: 52 },
          { code: 'MA', name: 'Maranhão', id: 21 },
          { code: 'MT', name: 'Mato Grosso', id: 51 },
          { code: 'MS', name: 'Mato Grosso do Sul', id: 50 },
          { code: 'MG', name: 'Minas Gerais', id: 31 },
          { code: 'PA', name: 'Pará', id: 15 },
          { code: 'PB', name: 'Paraíba', id: 25 },
          { code: 'PR', name: 'Paraná', id: 41 },
          { code: 'PE', name: 'Pernambuco', id: 26 },
          { code: 'PI', name: 'Piauí', id: 22 },
          { code: 'RJ', name: 'Rio de Janeiro', id: 33 },
          { code: 'RN', name: 'Rio Grande do Norte', id: 24 },
          { code: 'RS', name: 'Rio Grande do Sul', id: 43 },
          { code: 'RO', name: 'Rondônia', id: 11 },
          { code: 'RR', name: 'Roraima', id: 14 },
          { code: 'SC', name: 'Santa Catarina', id: 42 },
          { code: 'SP', name: 'São Paulo', id: 35 },
          { code: 'SE', name: 'Sergipe', id: 28 },
          { code: 'TO', name: 'Tocantins', id: 27 }
        ]);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  const loadCitiesByState = async (stateCode) => {
    if (citiesCache[stateCode]) {
      return citiesCache[stateCode];
    }

    const state = states.find(s => s.code === stateCode);
    if (!state) {
      console.error('Estado não encontrado:', stateCode);
      return [];
    }

    setLoadingCities(true);
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.id}/municipios?orderBy=nome`);
      const citiesData = await response.json();
      
      const cityNames = citiesData.map(city => city.nome);
      
      setCitiesCache(prev => ({
        ...prev,
        [stateCode]: cityNames
      }));
      
      return cityNames;
    } catch (error) {
      console.error('Erro ao carregar cidades do IBGE:', error);
      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  return {
    states,
    loadCitiesByState,
    loadingStates,
    loadingCities,
    citiesCache
  };
};