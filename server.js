const express = require('express');
const path = require('path');
const app = express();

// Servir tous les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Routes explicites
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/assistant', (req, res) => res.sendFile(path.join(__dirname, 'assistant.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
