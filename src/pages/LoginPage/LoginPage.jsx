import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setUserData } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Aplicar classe ao body quando componente montar
  useEffect(() => {
    document.body.classList.add('auth-page');
    document.documentElement.classList.add('auth-page');
    const root = document.getElementById('root');
    if (root) root.classList.add('auth-page');

    // Limpar quando componente desmontar
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
    // Limpar erro quando usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, userData } = await loginUser(formData.email, formData.password);
      
      setUser(user);
      setUserData(userData);

      // Redirecionar baseado no tipo de usuário
      if (userData.tipoUsuario === 'protetor') {
        navigate('/');
      } else if (userData.tipoUsuario === 'adotante') {
        // Por enquanto redireciona para home também, até ter a página do adotante
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Patas Felizes</h1>
          <p>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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
            <label htmlFor="password">Senha</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Digite sua senha"
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

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="register-link">
            <p>
              Não tem uma conta? 
              <Link to="/register"> Cadastre-se aqui</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;