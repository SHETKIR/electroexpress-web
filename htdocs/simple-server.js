const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3002;


const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
  database: 'electroexpress',
};


const pool = mysql.createPool(dbConfig);


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


app.use(cors());
app.use(express.json());


app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
    }
    
    const [users] = await pool.query(
      'SELECT id, username, email, full_name, role FROM users WHERE username = ? AND password = ? AND is_active = 1',
      [username, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [users[0].id]
    );
    
    res.json({
      message: 'Вход выполнен успешно',
      user: users[0]
    });
  } catch (error) {
    console.error('Error in /api/auth/login endpoint:', error);
    res.status(500).json({ error: 'Ошибка при входе в систему' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, full_name } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password and email are required' });
    }
    
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this username or email already exists' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO users (username, password, email, full_name, role, created_at, updated_at, is_active)
       VALUES (?, ?, ?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`,
      [username, password, email, full_name || null]
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    const [users] = await pool.query(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Error in /api/auth/register endpoint:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, full_name, role, created_at, last_login, is_active FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Error in GET /api/users endpoint:', error);
    res.status(500).json({ error: 'Ошибка при получении списка пользователей' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Некорректный ID пользователя' });
    }
    
    const [users] = await pool.query(
      'SELECT id, username, email, full_name, role, created_at, last_login, is_active FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(`Error in GET /api/users/${req.params.id} endpoint:`, error);
    res.status(500).json({ error: 'Ошибка при получении информации о пользователе' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, discount_percent, image_url, category_id } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const [maxIdResult] = await pool.query('SELECT MAX(id) as maxId FROM products');
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    
    const [result] = await pool.query(
      `INSERT INTO products (id, name, description, price, discount_percent, image_url, category_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [nextId, name, description, price, discount_percent || 0, image_url, category_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [nextId]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product created but not found' });
    }
    
    res.status(201).json({
      message: 'Product created successfully',
      product: products[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const { name, description, price, discount_percent, image_url, category_id } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const [existingProducts] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    
    if (existingProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, 
           description = ?, 
           price = ?, 
           discount_percent = ?, 
           image_url = ?, 
           category_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, price, discount_percent || 0, image_url, category_id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product update failed' });
    }
    
    res.json({ 
      message: 'Product updated successfully',
      id
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const [existingProducts] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    
    if (existingProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product deletion failed' });
    }
    
    res.json({ 
      message: 'Product deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/update-product', async (req, res) => {
  try {
    const { id, name, description, price, discount_percent, image_url, category_id } = req.body;
    
    if (!id || isNaN(id) || !name || price === undefined) {
      return res.status(400).json({ error: 'Invalid product data' });
    }
    
    const [existingProducts] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    
    if (existingProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, 
           description = ?, 
           price = ?, 
           discount_percent = ?, 
           image_url = ?, 
           category_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, price, discount_percent || 0, image_url, category_id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product update failed' });
    }
    
    res.json({ 
      message: 'Product updated successfully',
      id
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const [cartItems] = await pool.query(`
      SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, 
             p.name, p.price, p.image_url, p.discount_percent
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID and product ID are required' });
    }
    
    const [existingItems] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingItems.length > 0) {
      const newQuantity = existingItems[0].quantity + quantity;
      
      await pool.query(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
      
      res.json({ 
        message: 'Cart item quantity updated',
        id: existingItems[0].id,
        quantity: newQuantity
      });
    } else {
      const [result] = await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [userId, productId, quantity]
      );
      
      res.status(201).json({
        message: 'Item added to cart',
        id: result.insertId,
        quantity
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (isNaN(id) || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid cart update data' });
    }
    
    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json({ message: 'Cart item updated', quantity });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }
    
    const [result] = await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/products`);
}); 