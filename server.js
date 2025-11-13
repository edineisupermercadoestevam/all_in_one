// server.js

const express = require('express')
const path = require('path')
const pool = require('./config/db')
const bcrypt = require('bcrypt')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 3000

// Middleware para processar o body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Mude para true se usar HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// ROTA DE LOGIN
app.post('/login', async (req, res) => {
  // console.log('--- Requisição recebida em /login ---')
  // console.log('Body:', req.body)
  // console.log('Headers:', req.headers)
  // console.log('Método:', req.method)
  // res.send({ message: 'Dados recebidos com sucesso!' })

  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [username]);
    
    // Verifica se o usuário foi encontrado
    if (result.rows.length === 0) {
      // Usuário não encontrado
      return res.redirect('/?error=usuário_ou_senha_incorretos');
    }

    const user = result.rows[0]; // Obtém o primeiro (e único esperado) resultado

    // Compara a senha fornecida com o hash armazenado usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (isPasswordValid) {
      // Senha correta - login bem-sucedido
      // Armazena informações do usuário na sessão
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.loggedIn = true; // Indicador de login

      console.log(`Login bem-sucedido para o usuário: ${user.username}`);
      // Redireciona para uma página protegida ou para a home após login
      // Por enquanto, vamos redirecionar para uma nova rota '/dashboard'
      return res.redirect('/dashboard');
    } else {
      // Senha incorreta
      console.log(`Falha no login para o usuário: ${username} - senha incorreta`);
      return res.redirect('/?error=usuário_ou_senha_incorretos');
    }
  } catch (err) {
    console.error('Erro durante o login:', err);
    // Em caso de erro genérico no servidor, também redireciona com erro
    return res.redirect('/?error=erro_interno');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});