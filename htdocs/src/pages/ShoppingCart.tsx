import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/cart.css';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  discount_percent: number;
  quantity: number;
  image_url: string | null;
}

const API_URL = 'http://localhost:3002';

const ShoppingCart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        setIsLoggedIn(!!storedUser);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setIsAdmin(user.role === 'admin');
          if (user.role === 'admin') {
            navigate('/catalog');
            return;
          }
          const response = await fetch(`${API_URL}/api/cart?userId=${user.id}`);
          if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
          }
          const fetchedItems = await response.json();
          setCartItems(fetchedItems);
        } else {
          const storedCart = localStorage.getItem('cart');
          if (storedCart) {
            try {
              setCartItems(JSON.parse(storedCart));
            } catch (error) {
              console.error('Failed to parse cart items:', error);
              localStorage.removeItem('cart');
            }
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке корзины');
        setLoading(false);
        console.error('Error fetching cart items:', err);
      }
    };
    fetchCartItems();
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const response = await fetch(`${API_URL}/api/cart/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        if (!response.ok) {
          throw new Error('Ошибка при обновлении количества товара');
        }
      }
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const response = await fetch(`${API_URL}/api/cart/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Ошибка при удалении товара из корзины');
        }
      }
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    if (!discountPercent) return price;
    return price * (1 - discountPercent / 100);
  };

  const formatPrice = (price: number): string => {
    return Number(price).toFixed(2);
  };

  const calculateItemTotal = (item: CartItem): number => {
    const discountedPrice = calculateDiscountedPrice(item.price, item.discount_percent);
    return discountedPrice * item.quantity;
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

const submitOrder = async () => {
  if (!shippingAddress.trim()) {
    alert('Пожалуйста, введите адрес доставки');
    return;
  }

  setSubmittingOrder(true);
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Пожалуйста, войдите в систему для оформления заказа');
      setSubmittingOrder(false);
      return;
    }

    const user = JSON.parse(storedUser);
    
    if (cartItems.length === 0) {
      alert('Ваша корзина пуста');
      setSubmittingOrder(false);
      return;
    }
    
    const orderData = {
      user_id: user.id,
      items: cartItems.map(item => ({
        product_id: item.product_id || item.id,
        item_name: item.name,
        item_price: item.price,
        item_discount: item.discount_percent || 0,
        item_quantity: item.quantity
      })),
      shipping_address: shippingAddress.trim()
    };

    console.log('Sending order data:', orderData);

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const responseData = await response.json();
    console.log('Server response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Ошибка при оформлении заказа');
    }

    setOrderData(responseData.order);
    setOrderSubmitted(true);
    setCartItems([]);
    
    if (!storedUser) {
      localStorage.removeItem('cart');
    }
  } catch (error) {
    console.error('Order submission error:', error);
    alert(error instanceof Error ? error.message : 'Ошибка при оформлении заказа');
  } finally {
    setSubmittingOrder(false);
  }
};

  if (loading) {
    return (
      <div className="cart-page">
        <h1>Корзина</h1>
        <p>Загрузка корзины...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <h1>Корзина</h1>
        <p className="error-message">{error}</p>
        <Link to="/catalog" className="continue-shopping">Перейти в каталог</Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="cart-page">
        <h1>Корзина</h1>
        <div className="empty-cart">
          <p>Войдите в систему, чтобы пользоваться корзиной</p>
          <Link to="/catalog" className="continue-shopping">Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSubmitted) {
    return (
      <div className="cart-page">
        <h1>Корзина</h1>
        <div className="empty-cart">
          <p>Ваша корзина пуста</p>
          <Link to="/catalog" className="continue-shopping">Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="cart-page">
        <h1>Заказ оформлен</h1>
        <div className="order-confirmation">
          <div className="order-details">
            <p><strong>Номер заказа:</strong> {orderData.id}</p>
            <p><strong>Адрес доставки:</strong> {orderData.shipping_address}</p>
            <p><strong>Общая сумма:</strong> ${orderData.total_amount}</p>
          </div>
          <p className="thank-you-message">Спасибо за ваш заказ!</p>
          <Link to="/catalog" className="continue-shopping">Продолжить покупки</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>
      <div className="cart-items">
        {cartItems.map(item => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-image">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} />
              ) : (
                <div className="no-image">Нет изображения</div>
              )}
            </div>
            <div className="cart-item-details">
              <h3 className="cart-item-name">
                <Link to={`/product/${item.product_id || item.id}`}>{item.name}</Link>
              </h3>
              <div className="cart-item-price">
                {item.discount_percent > 0 ? (
                  <>
                    <span className="original-price">${formatPrice(item.price)}</span>
                    <span className="discounted-price">${formatPrice(calculateDiscountedPrice(item.price, item.discount_percent))}</span>
                    <span className="discount-badge">-{item.discount_percent}%</span>
                  </>
                ) : (
                  <span className="item-price">${formatPrice(item.price)}</span>
                )}
              </div>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button 
                  className="quantity-btn decrease" 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="quantity-btn increase" 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="item-total">
                ${formatPrice(calculateItemTotal(item))}
              </div>
              <button className="remove-item" onClick={() => removeItem(item.id)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="shipping-form">
      <div className="form-group">
        <label htmlFor="shippingAddress">Адрес доставки</label>
        <textarea
          id="shippingAddress"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Введите ваш полный адрес доставки"
          required
          rows={3}
        />
      </div>
    </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <span className="total-label">Итого:</span>
          <span className="total-price">${formatPrice(calculateTotal())}</span>
        </div>
        <div className="cart-actions">
          <Link to="/catalog" className="continue-shopping">Продолжить покупки</Link>
          <button 
            className="place-order" 
            onClick={submitOrder}
            disabled={submittingOrder || !shippingAddress.trim()}
          >
            {submittingOrder ? 'Оформление заказа...' : 'Оформить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;