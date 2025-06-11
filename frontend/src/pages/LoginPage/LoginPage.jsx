import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, senha);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Erro ao fazer login');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card-container">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={32} color="#d9434f" />
          </div>
          <h1 className="login-title">
            Crim<span>Watch</span>
          </h1>
          <p className="login-subtitle">Faça login para acessar o painel de controle</p>
        </div>

        <div className="login-form-card">
          <div className="login-form">
            {error && (
              <div className="login-error">
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <p>{error}</p>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Senha</label>
              <div className="login-password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <>
                  <div className="login-spinner"></div> Entrando...
                </>
              ) : (
                <>
                  <Shield size={20} /> Acessar Sistema
                </>
              )}
            </button>
          </div>

          <div className="login-footer-links">
            <Link to="/register" className="login-link create-account-link">Criar conta agora</Link>
            <div className="login-divider">
              <p>Sistema seguro para visualização de dados criminais</p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p className="login-copyright">
            © 2024 Crim<span>Watch</span>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
