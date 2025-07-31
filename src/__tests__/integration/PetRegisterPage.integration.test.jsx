import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PetRegisterPage from '../../pages/PetRegisterPage/PetRegisterPage';

jest.mock('../../config/firebase', () => ({ db: {}, storage: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), addDoc: jest.fn(), getDocs: jest.fn(), doc: jest.fn(),
  getDoc: jest.fn(), updateDoc: jest.fn(), deleteDoc: jest.fn(), query: jest.fn(),
  where: jest.fn(), orderBy: jest.fn(), serverTimestamp: jest.fn(() => new Date()),
  arrayUnion: jest.fn(), arrayRemove: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn(), uploadBytes: jest.fn(), getDownloadURL: jest.fn(), deleteObject: jest.fn(),
}));

jest.mock('../../services/ongs', () => ({
  getOngById: jest.fn(),
}));
jest.mock('../../services/firebase', () => ({
  getAllPets: jest.fn(), addPet: jest.fn(), uploadPetImage: jest.fn(),
}));

jest.mock('../../components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar Mock</nav>;
  };
});
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ userData: { tipoUsuario: 'protetor', id: 'user123' } }),
}));
jest.mock('../../contexts/OngContext', () => ({
  useOng: () => ({ selectedOng: { id: 'ong456', nome: 'ONG Teste' } }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/pet-register' }),
}));

describe('PetRegisterPage - Testes de Integração', () => {
  const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    const { getAllPets, addPet } = require('../../services/firebase');
    const { getOngById } = require('../../services/ongs');

    getAllPets.mockResolvedValue([]);
    addPet.mockResolvedValue({ id: 'new-pet-id', nome: 'Test Pet' });
    getOngById.mockResolvedValue({ id: 'ong456', nome: 'ONG Teste' });
  });

  afterAll(() => {
    mockAlert.mockRestore();
  });

  test('deve integrar com hooks reais usando Firebase', async () => {
    const { addPet } = require('../../services/firebase');
    addPet.mockResolvedValue({ id: 'new-pet-id', nome: 'Pretinha' });

    await act(async () => {
      render(<BrowserRouter><PetRegisterPage /></BrowserRouter>);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Salvar/i })).toBeEnabled();
    });

    await act(async () => {
      fireEvent.change(document.querySelector('input[name="nome"]'), { target: { value: 'Pretinha' } });
      fireEvent.change(document.querySelector('select[name="especie"]'), { target: { value: 'Cachorro' } });
      fireEvent.change(document.querySelector('input[name="idadeValor"]'), { target: { value: '2' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    });

    await waitFor(() => {
      expect(addPet).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Pretinha',
          especie: 'Cachorro',
        }),
        'ong456'
      );
    });

    expect(mockAlert).toHaveBeenCalledWith('Pet cadastrado com sucesso!');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('deve integrar upload de imagem com Firebase Storage', async () => {
    const { addPet, uploadPetImage } = require('../../services/firebase');
    uploadPetImage.mockResolvedValue('https://storage.firebase.com/pet-image.jpg');
    addPet.mockResolvedValue({ id: 'new-pet-id', nome: 'Pet com Imagem' });

    await act(async () => {
      render(<BrowserRouter><PetRegisterPage /></BrowserRouter>);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Salvar/i })).toBeEnabled();
    });

    // Preencher formulário e upload
    await act(async () => {
      fireEvent.change(document.querySelector('input[name="nome"]'), { target: { value: 'Pet com Imagem' } });
      fireEvent.change(document.querySelector('select[name="especie"]'), { target: { value: 'Cachorro' } });
    });

    const validFile = new File(['image content'], 'pet.jpg', { type: 'image/jpeg' });
    await act(async () => {
      fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [validFile] } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    });

    await waitFor(() => {
      expect(uploadPetImage).toHaveBeenCalledWith(validFile, expect.stringMatching(/temp_\d+/));
      expect(addPet).toHaveBeenCalledWith(
        expect.objectContaining({
          foto: 'https://storage.firebase.com/pet-image.jpg'
        }),
        'ong456'
      );
    });
  });

  test('deve validar arquivo de imagem inválido', async () => {
    await act(async () => {
      render(<BrowserRouter><PetRegisterPage /></BrowserRouter>);
    });

    const fileInput = document.querySelector('input[type="file"]');
    const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    });

    expect(mockAlert).toHaveBeenCalledWith('Por favor, selecione apenas arquivos de imagem.');
  });
});
