import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaHeart } from 'react-icons/fa';
import { registerUser } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setUserData } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('auth-page');
    document.documentElement.classList.add('auth-page');
    const root = document.getElementById('root');
    if (root) root.classList.add('auth-page');

    return () => {
      document.body.classList.remove('auth-page');
      document.documentElement.classList.remove('auth-page');
      const root = document.getElementById('root');
      if (root) root.classList.remove('auth-page');
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleUserTypeSelect = (tipo) => {
    setFormData({
      ...formData,
      tipoUsuario: tipo
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      return 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      return 'Email é obrigatório';
    }
    if (!formData.password) {
      return 'Senha é obrigatória';
    }
    if (formData.password.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Senhas não coincidem';
    }
    if (!formData.tipoUsuario) {
      return 'Selecione o tipo de usuário';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { user, userData } = await registerUser(formData);
      
      setUser(user);
      setUserData(userData);

      if (userData.tipoUsuario === 'protetor') {
        navigate('/');
      } else if (userData.tipoUsuario === 'adotante') {
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Criar Conta</h1>
          <p>Junte-se à nossa plataforma de proteção animal e seja a mudança na vida dos animais.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="user-type-section">
            <label>Escolha o seu perfil</label>
            <div className="user-type-options">
              <div 
                className={`user-type-card ${formData.tipoUsuario === 'protetor' ? 'selected' : ''}`}
                onClick={() => handleUserTypeSelect('protetor')}
              >
                <FaHeart className="user-type-icon" />
                <h3>Protetor</h3>
                <p>Gerencie abrigos e animais</p>
              </div>
              <div 
                className={`user-type-card ${formData.tipoUsuario === 'adotante' ? 'selected' : ''}`}
                onClick={() => handleUserTypeSelect('adotante')}
              >
                <FaUser className="user-type-icon" />
                <h3>Adotante</h3>
                <p>Encontre seu novo amigo</p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Digite seu email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone (opcional)</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(85) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Digite sua senha (mín. 6 caracteres)"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div className="login-link">
            <p>
              Já tem uma conta? 
              <Link to="/login"> Faça login aqui</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;