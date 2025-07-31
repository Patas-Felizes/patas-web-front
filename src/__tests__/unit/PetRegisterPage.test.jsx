import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PetRegisterPage from '../../pages/PetRegisterPage/PetRegisterPage';
import * as PetsHookModule from '../../hooks/usePets';
import * as AuthContextModule from '../../contexts/AuthContext';
import * as OngContextModule from '../../contexts/OngContext';

jest.mock('../../components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar Mock</nav>;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/pet-register' }),
}));

const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('PetRegisterPage - Testes Unitários', () => {
  let mockCreatePet;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      userData: { tipoUsuario: 'protetor', id: 'user123' },
    });
    jest.spyOn(OngContextModule, 'useOng').mockReturnValue({
      selectedOng: { id: 'ong456', nome: 'ONG Teste' },
    });

    mockCreatePet = jest.fn();
    jest.spyOn(PetsHookModule, 'usePets').mockReturnValue({
      createPet: mockCreatePet,
      editPet: jest.fn(),
      loading: false,
    });
    jest.spyOn(PetsHookModule, 'usePet').mockReturnValue({
      pet: null,
      loading: false,
    });

    global.URL.createObjectURL.mockClear();
    global.URL.revokeObjectURL.mockClear();
  });

  afterAll(() => {
    mockAlert.mockRestore();
  });

  test('deve cadastrar um pet com sucesso e redirecionar para a página inicial (sem imagem)', async () => {
    mockCreatePet.mockResolvedValueOnce({ id: 'newPet1', nome: 'Buddy' });
    render(<PetRegisterPage />);

    fireEvent.change(document.querySelector('input[name="nome"]'), { target: { value: 'Buddy' } });
    fireEvent.change(document.querySelector('select[name="especie"]'), { target: { value: 'Cachorro' } });
    fireEvent.change(document.querySelector('input[name="idadeValor"]'), { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(mockCreatePet).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Buddy',
          especie: 'Cachorro',
          idadeValor: '3',
        }),
        null
      );
    });

    expect(mockAlert).toHaveBeenCalledWith('Pet cadastrado com sucesso!');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('deve alertar se um arquivo de imagem inválido for selecionado', async () => {
    render(<PetRegisterPage />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['conteudo'], 'documento.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockAlert).toHaveBeenCalledWith('Por favor, selecione apenas arquivos de imagem.');
  });
});
