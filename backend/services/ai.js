// connexion OpenAI

const axios = require('axios');
const db = require('../db');

async function askOpenAI(prompt) {
  try {
    const response = await axios.post('http://localhost:4891/v1/chat/completions', {
      model: 'gpt4all',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });

    const answer = response.data.choices[0].message.content;

    // Enregistrer prompt + réponse dans la BDD
    db.query(
      'INSERT INTO messages (prompt, response) VALUES (?, ?)',
      [prompt, answer],
      (err) => {
        if (err) console.error('❌ Erreur d’enregistrement dans MySQL :', err);
      }
    );

    return answer;
  } catch (err) {
    console.error('Erreur OpenAI:', err);
    return '❌ Erreur lors de la requête à OpenAI.';
  }
}

module.exports = { askOpenAI };
