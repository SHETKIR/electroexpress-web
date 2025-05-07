import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/layout.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') {
      return true;
    }
    return path !== '/' && currentPath.startsWith(path);
  };

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">ElectroExpress</Link>
          </div>
          <nav className="main-nav">
            <ul>
              <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>О нас</Link></li>
              <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Контакты</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
