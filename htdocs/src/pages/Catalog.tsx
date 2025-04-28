import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/layout.css';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  discount_percent: number;
  image_url: string | null;
  category_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const API_URL = 'http://localhost:3001';

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const fetchedProducts = await response.json();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке товаров');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };
    
    fetchProducts();
  }, []);

  const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    if (!discountPercent) return parseFloat(price.toString());
    return parseFloat(price.toString()) * (1 - parseFloat(discountPercent.toString()) / 100);
  };

  const formatPrice = (price: number): string => {
    return parseFloat(price.toString()).toFixed(2);
  };

  if (loading) {
    return <h2>Загрузка товаров...</h2>;
  }

  if (error) {
    return <h2>Ошибка: {error}</h2>;
  }

  return (
    <div className="catalog-page">
      <h1>Каталог товаров</h1>
      
      <div className="catalog-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="no-image">Нет изображения</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                {product.discount_percent > 0 ? (
                  <div className="product-price-container">
                    <span className="product-old-price">${formatPrice(product.price)}</span>
                    <span className="product-new-price">${formatPrice(calculateDiscountedPrice(product.price, product.discount_percent))}</span>
                    <span className="product-discount-badge">-{product.discount_percent}%</span>
                  </div>
                ) : (
                  <p className="product-price">${formatPrice(product.price)}</p>
                )}

                <Link to={`/product/${product.id}`} className="product-button">
                  Подробнее
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>Товары не найдены</p>
        )}
      </div>
    </div>
  );
};

export default Catalog;