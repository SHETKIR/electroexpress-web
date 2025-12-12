import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ShoppingCart from './pages/ShoppingCart';
import EditProduct from './pages/EditProduct';
import AddProduct from './pages/AddProduct';
import Contact from './pages/Contact';
import './styles/layout.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} /> 
          <Route path="/catalog" element={<Catalog />} /> 
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shopping-cart" element={<ShoppingCart />} /> 
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>,
);
