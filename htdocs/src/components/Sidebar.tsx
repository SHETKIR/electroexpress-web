import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/layout.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <aside className="sidebar">
      <div className="container">
        <nav className="sidebar-nav">
          <ul>
          <li><Link to="/" className={isActive('/') ? 'active' : ''}>Главная</Link></li>
            <li><Link to="/catalog" className={isActive('/catalog') ? 'active' : ''}>Каталог</Link></li>
            <li><Link to="/shopping-cart" className={isActive('/shopping-cart') ? 'active' : ''}>Корзина</Link></li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 