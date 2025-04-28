import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import './styles/layout.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Home />} /> 
          <Route path="/catalog" element={<Catalog />} /> 
          <Route path="/shopping-cart" element={<Home />} /> 
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>,
);
