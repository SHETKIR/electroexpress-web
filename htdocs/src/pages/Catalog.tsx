import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface CartItem {
  id: number;
  name: string;
  price: number;
  discount_percent: number;
  quantity: number;
  image_url: string | null;
}

interface User {
  id: number;
  username: string;
  role: string;
  email: string;
  full_name: string | null;
}

const API_URL = 'http://localhost:3002';

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [luckyProductAdded, setLuckyProductAdded] = useState<boolean>(false);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setIsLoggedIn(!!storedUser);
    
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      setIsAdmin(user.role === 'admin');
    }
    
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

  const addToCart = async (product: Product) => {
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
          cartItems[existingItemIndex].quantity += 1;
        } else {
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            discount_percent: product.discount_percent,
            quantity: 1,
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
            quantity: 1
          }),
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при добавлении товара в корзину');
        }
      }
      
      setAddedToCart(product.id);
      
      setTimeout(() => {
        setAddedToCart(null);
      }, 2000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const editProduct = (productId: number) => {
    navigate(`/edit-product/${productId}`);
  };

  const addProduct = () => {
    navigate('/add-product');
  };

  const deleteProduct = async (productId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при удалении товара');
        }
        
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ошибка при удалении товара');
      }
    }
  };

  const addRandomProductToCart = () => {
    if (products.length === 0) {
      alert('В каталоге нет товаров');
      return;
    }

    const randomIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomIndex];
    
    addToCart(randomProduct);
    
    setLuckyProductAdded(true);
    
    setTimeout(() => {
      setLuckyProductAdded(false);
    }, 2000);
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
      
      {isLoggedIn && !isAdmin && (
        <div className="lucky-button-container">
          <button 
            className={`lucky-button ${luckyProductAdded ? 'added' : ''}`}
            onClick={addRandomProductToCart}
          >
            {luckyProductAdded ? '✓ Товар добавлен в корзину!' : '🎲 Мне повезёт!'}
          </button>
        </div>
      )}
      
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

                <div className="product-buttons">
                  <Link to={`/product/${product.id}`} className="product-button details">
                    Подробнее
                  </Link>
                  {isLoggedIn && !isAdmin && (
                    <button 
                      className={`product-button cart ${addedToCart === product.id ? 'added' : ''}`}
                      onClick={() => addToCart(product)}
                    >
                      {addedToCart === product.id ? '✓ Добавлено' : 'В корзину'}
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      className="product-button edit"
                      onClick={() => editProduct(product.id)}
                    >
                      Редактировать
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      className="product-button delete"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Товары не найдены</p>
        )}

        {isAdmin && (
          <div className="add-product-container">
            <button 
              className="add-product-button"
              onClick={addProduct}
            >
              + Добавить новый товар
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;