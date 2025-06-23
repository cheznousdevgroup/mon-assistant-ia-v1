// point d'entrée Express
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
