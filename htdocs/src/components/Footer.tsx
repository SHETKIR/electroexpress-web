import React from 'react';
import '../styles/layout.css';

const Footer: React.FC = () => {
const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="copyright">
          &copy; {currentYear} ElectroExpress. Все права под угрозой!
        </div>
      </div>
    </footer>
  );
};

export default Footer; 