// connecteur à la base

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',         
  password: '123456',        
  database: 'mon_assistant_ia' 
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à MySQL :', err.message);
  } else {
    console.log('✅ Connecté à la base MySQL.');
  }
});

module.exports = connection;
