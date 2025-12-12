const { exec } = require('child_process');
const mysql = require('mysql2/promise');
const path = require('path');


const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
  database: 'electroexpress',
};


async function checkDatabase(){
  try
  {
    const connection = await mysql.createConnection(dbConfig);
    await connection.end();
    console.log('Database is ready!');
    return true;
  }
  catch(error)
  {
    console.log('Error: ', error);
    console.log('Trying to setup Database...');
    const setupScript = path.resolve(__dirname, 'db-setup.js');
    exec(`node "${setupScript}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('Failed to launch script: ', err.message);
        return;
      }
      if (stderr) {
        console.error('stderr:', stderr);
        return;
      }
      console.log('Script executed successfully!\n', stdout);
    });

    return false;
  }  
}

checkDatabase();