const express = require('express')
const path = require('path')
const pool = require('./config/db')
const bcrypt = require('bcrypt')

const app = express()
const port = process.env.PORT || 3000

// Middleware para processar o body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir o formulário de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});