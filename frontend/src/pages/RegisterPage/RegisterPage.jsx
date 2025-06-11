import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import './RegisterPage.css';

const RegisterPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', { nome, email, senha });
      
      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar usuário. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card-container">
        {/* Logo/Header Section */}
        <div className="register-header">
          <div className="register-logo">
            <Shield size={32} color="#d9434f" />
          </div>
          <h1 className="register-title">
            Crim<span>Watch</span>
          </h1>
          <p className="register-subtitle">
            Crie sua conta para acessar o painel de controle
          </p>
        </div>

        {/* Register Form */}
        <div className="register-form-card">
          <div className="register-form">
            {/* Error Message */}
            {error && (
              <div className="register-error">
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="register-success">
                <CheckCircle size={20} style={{ flexShrink: 0 }} />
                <p>{success}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="register-field">
              <label htmlFor="nome" className="register-label">
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="register-input"
              />
            </div>

            {/* Email Field */}
            <div className="register-field">
              <label htmlFor="email" className="register-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="register-input"
              />
            </div>

            {/* Password Field */}
            <div className="register-field">
              <label htmlFor="password" className="register-label">
                Senha
              </label>
              <div className="register-password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="register-password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="register-button"
            >
              {isLoading ? (
                <>
                  <div className="register-spinner"></div>
                  Cadastrando...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Criar Conta
                </>
              )}
            </button>
          </div>

          {/* Footer Links */}
          <div className="register-footer-links">
            <a href="/login" className="register-link">
              Já tem uma conta? Faça login
            </a>
            <div className="register-divider">
              <p>Sistema seguro para visualização de dados criminais</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="register-footer">
          <p className="register-copyright">
            © 2024 Crim<span>Watch</span>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;