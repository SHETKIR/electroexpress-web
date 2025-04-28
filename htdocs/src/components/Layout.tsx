import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="content-area">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 