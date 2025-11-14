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

  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    
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

// Rota para a página inicial (index.html), agora manipulando erros
app.get('/', (req, res) => {
    // Lê possíveis mensagens de erro da query string
    let errorMessage = '';
    if (req.query.error) {
        switch (req.query.error) {
            case 'usuário_ou_senha_vazios':
                errorMessage = 'Por favor, preencha todos os campos.';
                break;
            case 'usuário_ou_senha_incorretos':
                errorMessage = 'Nome de usuário ou senha incorretos.';
                break;
            case 'erro_interno':
                errorMessage = 'Ocorreu um erro interno. Tente novamente mais tarde.';
                break;
            default:
                errorMessage = 'Ocorreu um erro.'; // Trata erros desconhecidos
        }
    }
    // Lê o nome de usuário da sessão, se estiver logado
    const username = req.session.username || null;

    // Serve o index.html, injetando a mensagem de erro e o nome do usuário (se logado)
    // Para injetar dinamicamente, o ideal é usar um template engine (como EJS, Handlebars, etc.).
    // Como estamos servindo um arquivo estático, a forma mais direta de passar a mensagem
    // é modificando o HTML antes de enviá-lo ou renderizando-o com um template.
    // Vamos optar por modificar o HTML estático com JavaScript do lado do servidor ou
    // usar uma abordagem mais simples: servir o HTML e adicionar a mensagem via JS do lado do cliente
    // recebendo o erro via query string.
    // Modificaremos o index.html para ler o parâmetro 'error' da URL e exibir a mensagem.
    // Por enquanto, apenas servimos o arquivo estático.
    // A lógica de exibir a mensagem no frontend será ajustada no script.js.
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para uma página de dashboard (exemplo de página protegida)
app.get('/dashboard', (req, res) => {
  // Verifica se o usuário está logado
  if (!req.session.loggedIn) {
    // Se não estiver logado, redireciona para o login
    return res.redirect('/?error=acesso_negado');
  }
  // Se estiver logado, serve uma página de dashboard (você precisa criar esta página)
  // Por enquanto, enviamos uma resposta simples
  res.send(`
      <h1>Bem-vindo, ${req.session.username}!</h1>
      <p>Você está na página do Dashboard.</p>
      <a href="/logout">Sair</a>
  `);
});

// Rota para logout
app.get('/logout', (req, res) => {
  // Destrói a sessão
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
      // Pode ser necessário lidar com o erro de forma mais robusta
    }
    // Redireciona para a página de login após o logout
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});