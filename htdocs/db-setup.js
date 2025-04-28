const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'db.dvl.to',
  port: 3306,
  user: 'root',
  password: 'mypassword',
  database: 'electroexpress',
};

async function setupDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });
    
    console.log('Connected to database successfully!');
    
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'`,
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.log('Creating products table...');
      
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
    } else {
      console.log('Products table already exists.');
      
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM products LIKE 'discount_percent'
      `);
      
      if (columns.length === 0) {
        console.log('Adding discount_percent column to products table...');
        await connection.query(`
          ALTER TABLE products 
          ADD COLUMN discount_percent INT DEFAULT 0
        `);
        console.log('Column added successfully!');
      } else {
        console.log('discount_percent column already exists.');
      }
    }
    
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    
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