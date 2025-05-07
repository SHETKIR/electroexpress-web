const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'db.dvl.to',
  port: 3306,
  user: 'root',
  password: 'mypassword',
  database: 'electroexpress',
};

async function checkProducts() {
  try {
    const pool = mysql.createPool(dbConfig);
    
    console.log('Connecting to database...');
    
    console.log('Querying products...');
    const [rows] = await pool.query('SELECT * FROM products');
    
    console.log('Products in database:');
    if (rows.length === 0) {
      console.log('No products found in the database');
    } else {
      rows.forEach(product => {
        console.log(`ID: ${product.id}, Name: ${product.name}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkProducts(); 