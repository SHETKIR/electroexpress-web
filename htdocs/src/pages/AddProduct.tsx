import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/edit-product.css';

interface Product {
  name: string;
  description: string | null;
  price: number;
  discount_percent: number;
  image_url: string | null;
  category_id: number | null;
}

const API_URL = 'http://localhost:3002';


const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    discount_percent: 0,
    image_url: '',
    category_id: null
  });
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAdmin(user.role === 'admin');
      
      if (user.role !== 'admin') {
        navigate('/catalog');
      }
    } else {
      navigate('/catalog');
    }
  }, [navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'discount_percent') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setProduct({
        ...product,
        [name]: numValue
      });
    } else {
      setProduct({
        ...product,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        discount_percent: Number(product.discount_percent),
        image_url: product.image_url,
        category_id: product.category_id
      };
      
      console.log('Sending product data:', productData);
      
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Ошибка при добавлении товара';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.log('Error data:', errorData);
        } catch (jsonError) {
          console.log('Error parsing JSON response:', jsonError);
          errorMessage = `Ошибка при добавлении товара: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Result:', result);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/catalog');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании товара');
      console.error('Error creating product:', err);
    }
  };
  
  if (!isAdmin) {
    return <div>Перенаправление...</div>;
  }
  
  if (loading) {
    return <div className="edit-product-loading">Загрузка...</div>;
  }
  
  if (error) {
    return (
      <div className="edit-product-error">
        <h2>Ошибка: {error}</h2>
        <Link to="/catalog" className="back-to-catalog">Вернуться в каталог</Link>
      </div>
    );
  }
  
  return (
    <div className="edit-product-page">
      <h1>Добавление товара</h1>
      
      {success && (
        <div className="success-message">
          Товар успешно добавлен! Перенаправление в каталог...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="edit-product-form">
        <div className="form-group">
          <label htmlFor="name">Название товара</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={product.description || ''}
            onChange={handleChange}
            rows={5}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Цена ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="discount_percent">Скидка (%)</label>
          <input
            type="number"
            id="discount_percent"
            name="discount_percent"
            value={product.discount_percent}
            onChange={handleChange}
            min="0"
            max="100"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image_url">URL изображения</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={product.image_url || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <Link to="/catalog" className="cancel-button">Отмена</Link>
          <button type="submit" className="save-button">Создать</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct; 