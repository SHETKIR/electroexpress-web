const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

const dbConfig = {
  host: 'db.dvl.to',
  port: 3306,
  user: 'root',
  password: 'mypassword',
  database: 'electroexpress',
};

const pool = mysql.createPool(dbConfig);

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error in /api/products endpoint:', error);
    res.status(500).json({ error: 'Ошибка при получении списка товаров' });
  }
});

app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Некорректный ID категории' });
    }
    
    const [products] = await pool.query(
      'SELECT * FROM products WHERE category_id = ?', 
      [categoryId]
    );
    res.json(products);
  } catch (error) {
    console.error(`Error in /api/products/category/${req.params.categoryId} endpoint:`, error);
    res.status(500).json({ error: 'Ошибка при получении товаров по категории' });
  }
});

app.get('/api/products/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Поисковый запрос должен содержать не менее 2 символов' });
    }
    
    const [products] = await pool.query(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
      [`%${query}%`, `%${query}%`]
    );
    res.json(products);
  } catch (error) {
    console.error(`Error in /api/products/search/${req.params.query} endpoint:`, error);
    res.status(500).json({ error: 'Ошибка при поиске товаров' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Некорректный ID товара' });
    }
    
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error(`Error in /api/products/${req.params.id} endpoint:`, error);
    res.status(500).json({ error: 'Ошибка при получении информации о товаре' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/products`);
}); 