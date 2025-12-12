import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const API_URL = 'http://localhost:3002';

const Home: React.FC = () => {
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const allProducts = await response.json();
        
        const productsWithDiscount = allProducts.filter(
          (product: Product) => product.discount_percent > 0
        ).slice(0, 5);
        
        setDiscountedProducts(productsWithDiscount);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке товаров со скидкой');
        setLoading(false);
        console.error('Error fetching discounted products:', err);
      }
    };
    
    fetchDiscountedProducts();
  }, []);

  const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    if (!discountPercent) return parseFloat(price.toString());
    return parseFloat(price.toString()) * (1 - parseFloat(discountPercent.toString()) / 100);
  };

  const formatPrice = (price: number): string => {
    return parseFloat(price.toString()).toFixed(2);
  };

  return (
    <>
      <h1>Добро пожаловать в ElectroExpress</h1>
      <p>"Здесь распологается слоган компании"</p>
      
      <div className="feature-section">
        <div className="feature">
          <h2>Весенние скидки на память от патриотов</h2>
          <p>Скидка 100%</p>
        </div>
        <div className="feature">
          <h2>Бесплатная консультация по памяти</h2>
          <p>(без скриптов), бесплатно, всего за $1000</p>
        </div>
      </div>
      
      <div className="promo-section">
        <h2>Специальные предложения</h2>
        
        {loading ? (
          <p className="loading-text">Загрузка специальных предложений...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : discountedProducts.length === 0 ? (
          <p className="no-items-text">В данный момент специальных предложений нет</p>
        ) : (
          <div className="promo-items">
            {discountedProducts.map(product => (
              <div className="promo-item" key={product.id}>
                <div className="promo-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="no-image">Нет изображения</div>
                  )}
                </div>
                <h3>{product.name}</h3>
                <p className="promo-old-price">${formatPrice(product.price)}</p>
                <p className="promo-price">
                  ${formatPrice(calculateDiscountedPrice(product.price, product.discount_percent))}
                </p>
                <p className="promo-discount">Скидка: {product.discount_percent}%</p>
                <Link to={`/product/${product.id}`} className="promo-button">
                  Подробнее
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home; 