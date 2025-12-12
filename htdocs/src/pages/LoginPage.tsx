import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const API_URL = 'http://localhost:3002';

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    role: string;
  }
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Пожалуйста, введите имя пользователя и пароль');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка входа');
      }
      
      const data: LoginResponse = await response.json();
      
      
      localStorage.setItem('user', JSON.stringify(data.user));
      
      
      navigate('/');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вход в аккаунт</h1>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="login-info">
          <p>Тестовые учетные записи:</p>
          <ul>
            <li>Имя пользователя: <strong>admin</strong>, Пароль: <strong>adminpassword</strong></li>
            <li>Имя пользователя: <strong>user1</strong>, Пароль: <strong>userpassword1</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 