const mysql = require('mysql2/promise');
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
};
async function setupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database system successfully!');
    await connection.query('CREATE DATABASE IF NOT EXISTS electroexpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE electroexpress');
    try {
      await connection.query(`
        CREATE TABLE products (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          discount_percent INT DEFAULT 0,
          image_url VARCHAR(255),
          category_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          is_active TINYINT(1) DEFAULT 1
        )
      `);
      console.log('Products table created successfully!');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Products table already exists.');
      } else {
        throw err;
      }
    }
    try {
      await connection.query(`
        ALTER TABLE products 
        ADD COLUMN discount_percent INT DEFAULT 0
      `);
      console.log('Column discount_percent added successfully!');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('discount_percent column already exists.');
      } else {
        throw err;
      }
    }
    try {
      await connection.query(`
        CREATE TABLE users (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          full_name VARCHAR(100),
          role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL,
          is_active TINYINT(1) DEFAULT 1
        )
      `);
      console.log('Users table created successfully!');
      await connection.query(`
        INSERT INTO users (username, password, email, full_name, role) VALUES
        ('admin', 'adminpassword', 'admin@electroexpress.com', 'Administrator', 'admin'),
        ('user1', 'userpassword1', 'user1@example.com', 'Regular User 1', 'user'),
        ('user2', 'userpassword2', 'user2@example.com', 'Regular User 2', 'user')
      `);
      console.log('Default users added successfully!');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Users table already exists.');
      } else {
        throw err;
      }
    }
    try {
      await connection.query(`
        CREATE TABLE cart_items (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          product_id BIGINT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Cart items table created successfully with foreign keys!');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Cart items table already exists.');
      } else {
        console.error('Error creating cart_items table:', err);
        throw err;
      }
    }
    try {
      await connection.query(`
        CREATE TABLE orders (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('new', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'new',
          total_amount DECIMAL(10, 2) NOT NULL,
          shipping_address TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Orders table created successfully!');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Orders table already exists.');
      } else {
        throw err;
      }
    }
    try {
      await connection.query(`
        CREATE TABLE order_items (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          order_id BIGINT NOT NULL,
          product_id BIGINT NOT NULL,
          quantity INT NOT NULL,
          price_per_item DECIMAL(10, 2) NOT NULL,
          discount_percent INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Order items table created successfully!');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Order items table already exists.');
      } else {
        throw err;
      }
    }
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}
setupDatabase();