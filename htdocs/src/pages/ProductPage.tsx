import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/product.css';

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

interface CartItem {
  id: number;
  name: string;
  price: number;
  discount_percent: number;
  quantity: number;
  image_url: string | null;
}

const API_URL = 'http://localhost:3002';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  useEffect(() => {
    
    const storedUser = localStorage.getItem('user');
    setIsLoggedIn(!!storedUser);
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAdmin(user.role === 'admin');
    }
    
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const productData = await response.json();
        setProduct(productData);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке товара');
        setLoading(false);
        console.error('Error fetching product:', err);
      }
    };
    
    fetchProduct();
  }, [id]);

  const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    if (!discountPercent) return parseFloat(price.toString());
    return parseFloat(price.toString()) * (1 - parseFloat(discountPercent.toString()) / 100);
  };

  const formatPrice = (price: number): string => {
    return parseFloat(price.toString()).toFixed(2);
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const addToCart = async () => {
    if (!product) return;

    try {
      
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        
        let cartItems: CartItem[] = [];
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          try {
            cartItems = JSON.parse(storedCart);
          } catch (error) {
            console.error('Failed to parse cart items:', error);
            localStorage.removeItem('cart');
          }
        }

        
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
          
          cartItems[existingItemIndex].quantity += quantity;
        } else {
          
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            discount_percent: product.discount_percent,
            quantity: quantity,
            image_url: product.image_url
          };
          cartItems.push(newItem);
        }

        
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } else {
        
        const user = JSON.parse(storedUser);
        
        const response = await fetch(`${API_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            productId: product.id,
            quantity: quantity
          }),
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при добавлении товара в корзину');
        }
      }
      
      
      setAddedToCart(true);
      
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      
    }
  };

  const goToCart = () => {
    navigate('/shopping-cart');
  };

  if (loading) {
    return <div className="product-page-loading">Загрузка товара...</div>;
  }

  if (error || !product) {
    return <div className="product-page-error">Ошибка: {error || 'Товар не найден'}</div>;
  }

  return (
    <div className="product-page">
      <div className="product-navigation">
        <Link to="/catalog" className="back-link">← Назад в каталог</Link>
      </div>
      
      <div className="product-details">
        <div className="product-image-large">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="no-image-large">Нет изображения</div>
          )}
        </div>
        
        <div className="product-info-detailed">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-pricing">
            {product.discount_percent > 0 ? (
              <>
                <div className="product-original-price">${formatPrice(product.price)}</div>
                <div className="product-final-price">${formatPrice(calculateDiscountedPrice(product.price, product.discount_percent))}</div>
                <div className="discount-badge">-{product.discount_percent}%</div>
              </>
            ) : (
              <div className="product-final-price">${formatPrice(product.price)}</div>
            )}
          </div>
          
          <div className="product-description-full">
            <h2>Описание</h2>
            <p>{product.description || 'Описание отсутствует'}</p>
          </div>
          
          {isLoggedIn && !isAdmin && (
            <>
              <div className="product-quantity">
                <span className="quantity-label">Количество:</span>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn decrease" 
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button 
                    className="quantity-btn increase" 
                    onClick={() => updateQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="product-actions">
                <button className="add-to-cart-button" onClick={addToCart}>
                  {addedToCart ? 'Добавлено ✓' : 'Добавить в корзину'}
                </button>
                {addedToCart && (
                  <button className="go-to-cart-button" onClick={goToCart}>
                    Перейти в корзину
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage; 