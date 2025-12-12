import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.css';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    const userInfo = localStorage.getItem('user');
    
    if (!userInfo) {
      
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userInfo) as User;
      setUser(parsedUser);
    } catch (error) {
      console.error('Failed to parse user info:', error);
      
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div className="profile-loading">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Личный кабинет</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.full_name ? user.full_name.charAt(0) : user.username.charAt(0)}
            </div>
            <div className="profile-title">
              <h2>{user.full_name || user.username}</h2>
              <div className="profile-role">{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</div>
            </div>
          </div>
          
          <div className="profile-info">
            <div className="profile-info-item">
              <span className="profile-label">Имя пользователя:</span>
              <span className="profile-value">{user.username}</span>
            </div>
            
            <div className="profile-info-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.email}</span>
            </div>
            
            {user.full_name && (
              <div className="profile-info-item">
                <span className="profile-label">Полное имя:</span>
                <span className="profile-value">{user.full_name}</span>
              </div>
            )}
          </div>
          
          <div className="profile-actions">
            <button onClick={handleLogout} className="logout-button">
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 