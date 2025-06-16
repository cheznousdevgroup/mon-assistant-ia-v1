// point API pour recevoir les questions

const express = require('express');
const router = express.Router();
const db = require('../db');
const { askOpenAI } = require('../services/ai');

router.post('/', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message requis' });
  }

  try {
    const response = await askOpenAI(userMessage);
    res.json({ response });
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    res.status(500).json({ error: 'Erreur lors du traitement avec OpenAI' });
  }
});

// Nouvelle route : historique
router.get('/history', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;