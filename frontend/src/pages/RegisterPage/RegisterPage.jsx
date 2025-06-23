// RegisterPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import AlertSnackbar from '../../components/AlertSnackbar';
import './RegisterPage.css';

const RegisterPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/register', { nome, email, senha });
      setSnackbar({ open: true, message: 'Cadastro realizado com sucesso! Redirecionando para login...', severity: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erro ao cadastrar usuário.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <AlertSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <div className="register-card-container">
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

        <div className="register-form-card">
          <div className="register-form">
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

          <div className="register-footer-links">
            <a href="/login" className="register-link">
              Já tem uma conta? Faça login
            </a>
            <div className="register-divider">
              <p>Sistema seguro para visualização de dados criminais</p>
            </div>
          </div>
        </div>

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
