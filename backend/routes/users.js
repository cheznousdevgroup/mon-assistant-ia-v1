const express = require('express');
const router = express.Router();
const db = require('../db');

// Exemple de route GET
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
