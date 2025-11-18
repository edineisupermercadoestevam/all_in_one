const bcrypt = require('bcrypt');

async function createTestUser() {
  const username = 'edinei';
  const plainPassword = '12312313'; // Senha em texto plano
  const hashedPassword = await bcrypt.hash(plainPassword, 10); // Gera o hash

  console.log('Senha Plana:', plainPassword);
  console.log('Hash da Senha:', hashedPassword);

  // Agora, insira manualmente no banco de dados:
  // INSERT INTO usuarios (username, password_hash) VALUES ('testuser', '$2b$10$...'); -- usando o hash gerado acima
}

createTestUser();