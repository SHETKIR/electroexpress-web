import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/layout.css';

interface User {
  id: number;
  username: string;
  role: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentPath(location.pathname);
    
    
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user info:', error);
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="container">
        <div className="sidebar-wrapper">
          <nav className="sidebar-nav">
            <ul className="sidebar-main-nav">
              <li><Link to="/" className={isActive('/') ? 'active' : ''}>Главная</Link></li>
              <li><Link to="/catalog" className={isActive('/catalog') ? 'active' : ''}>Каталог</Link></li>
              {(!user || user.role !== 'admin') && (
                <li><Link to="/shopping-cart" className={isActive('/shopping-cart') ? 'active' : ''}>Корзина</Link></li>
              )}
            </ul>
          </nav>
          
          <div className="sidebar-user">
            {user ? (
              <div className="sidebar-user-info">
                <div className="user-info-container">
                  <Link to="/profile">
                    <span className="sidebar-username">{user.username}</span>
                  </Link>
                  {user.role === 'admin' && (
                    <span className="sidebar-admin-badge">Админ</span>
                  )}
                </div>
                <button onClick={handleLogout} className="sidebar-logout-btn">Выйти</button>
              </div>
            ) : (
              <div className="sidebar-auth-links">
                <Link to="/login" className="sidebar-login-link">Войти</Link>
                <Link to="/register" className="sidebar-register-link">Регистрация</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 