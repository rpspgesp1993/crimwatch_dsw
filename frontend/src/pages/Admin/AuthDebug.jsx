// AuthDebug.jsx
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, Card, CardContent } from '@mui/material';
import api from '../../services/api'; // Seu axiosInstance

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runFullDiagnostic = async () => {
    setLoading(true);
    const diagnostic = {};

    // 1. Verificar dados do localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    diagnostic.token = {
      exists: !!token,
      value: token ? `${token.substring(0, 20)}...` : null,
      length: token?.length || 0
    };

    diagnostic.user = {
      exists: !!userStr,
      value: userStr
    };

    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        diagnostic.userParsed = {
          success: true,
          data: userObj,
          role: userObj.role,
          id: userObj._id,
          nome: userObj.nome,
          email: userObj.email
        };
      } catch (e) {
        diagnostic.userParsed = {
          success: false,
          error: e.message
        };
      }
    }

    // 2. Testar requisição para /users
    try {
      console.log('🧪 Testando requisição GET /users...');
      const response = await api.get('/users');
      diagnostic.apiTest = {
        success: true,
        status: response.status,
        dataLength: response.data?.length || 0,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Erro na requisição /users:', error);
      diagnostic.apiTest = {
        success: false,
        status: error.response?.status,
        error: error.response?.data?.error || error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        }
      };
    }

    // 3. Verificar variáveis de ambiente
    diagnostic.environment = {
      apiUrl: process.env.REACT_APP_API_URL,
      nodeEnv: process.env.NODE_ENV
    };

    setDebugInfo(diagnostic);
    setLoading(false);
    
    console.log('🔍 DIAGNÓSTICO COMPLETO:', diagnostic);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setDebugInfo({});
    console.log('🧹 Dados de autenticação limpos');
  };

  const testLogin = async () => {
    try {
      // Exemplo de teste de login - ajuste conforme sua API
      const response = await api.post('/auth/login', {
        email: 'admin@teste.com', // Coloque um email de admin válido
        senha: '123456' // Coloque a senha
      });
      
      console.log('✅ Login teste bem-sucedido:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('💾 Token e usuário salvos no localStorage');
      }
      
    } catch (error) {
      console.error('❌ Erro no login teste:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Debug de Autenticação
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Este componente vai ajudar a identificar o problema de autenticação. 
        Abra o console (F12) para ver logs detalhados.
      </Alert>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={runFullDiagnostic}
          disabled={loading}
        >
          🧪 Executar Diagnóstico Completo
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testLogin}
          color="secondary"
        >
          🔐 Teste de Login
        </Button>
        
        <Button 
          variant="outlined" 
          color="warning" 
          onClick={clearAuth}
        >
          🧹 Limpar Auth
        </Button>
      </Box>

      {Object.keys(debugInfo).length > 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          {/* Token Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎫 Token
              </Typography>
              <Typography variant="body2" color={debugInfo.token?.exists ? 'success.main' : 'error.main'}>
                Status: {debugInfo.token?.exists ? '✅ Presente' : '❌ Ausente'}
              </Typography>
              {debugInfo.token?.exists && (
                <>
                  <Typography variant="body2">
                    Tamanho: {debugInfo.token.length} caracteres
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    Preview: {debugInfo.token.value}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👤 Usuário
              </Typography>
              <Typography variant="body2" color={debugInfo.user?.exists ? 'success.main' : 'error.main'}>
                Status: {debugInfo.user?.exists ? '✅ Presente' : '❌ Ausente'}
              </Typography>
              {debugInfo.userParsed?.success && (
                <>
                  <Typography variant="body2">
                    Nome: {debugInfo.userParsed.data.nome}
                  </Typography>
                  <Typography variant="body2">
                    Email: {debugInfo.userParsed.data.email}
                  </Typography>
                  <Typography variant="body2" color={debugInfo.userParsed.role === 'admin' ? 'success.main' : 'warning.main'}>
                    Role: {debugInfo.userParsed.role}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* API Test */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌐 Teste da API
              </Typography>
              <Typography variant="body2" color={debugInfo.apiTest?.success ? 'success.main' : 'error.main'}>
                Status: {debugInfo.apiTest?.success ? '✅ Sucesso' : '❌ Erro'}
              </Typography>
              {debugInfo.apiTest?.success ? (
                <Typography variant="body2">
                  Usuários encontrados: {debugInfo.apiTest.dataLength}
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="error">
                    HTTP {debugInfo.apiTest?.status}: {debugInfo.apiTest?.error}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    URL: {debugInfo.apiTest?.config?.baseURL}{debugInfo.apiTest?.config?.url}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Environment */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔧 Ambiente
              </Typography>
              <Typography variant="body2">
                API URL: {debugInfo.environment?.apiUrl || 'http://localhost:4000/api'}
              </Typography>
              <Typography variant="body2">
                Ambiente: {debugInfo.environment?.nodeEnv}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Quick Status */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          📊 Status Rápido
        </Typography>
        <Typography variant="body2">
          Token: {localStorage.getItem('token') ? '✅' : '❌'} | 
          User: {localStorage.getItem('user') ? '✅' : '❌'} | 
          Admin: {(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user.role === 'admin' ? '✅' : '❌';
            } catch {
              return '❌';
            }
          })()} | 
          API URL: {process.env.REACT_APP_API_URL || 'localhost:4000'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthDebug;