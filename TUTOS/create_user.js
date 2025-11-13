require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function createUser() {
    const username = 'edinei';
    const email = 'edinei.supermercadoestevam@gmail.com'; // Você pode mudar este email
    const plainPassword = '12312313';
    const saltRounds = 10; // Número de rounds para o bcrypt

    try {
        // Gerar o hash da senha
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

        const insertUserQuery = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at;
        `;

        const result = await pool.query(insertUserQuery, [username, email, passwordHash]);
        console.log('Usuário criado com sucesso:', result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar o usuário:', err);
    } finally {
        await pool.end();
        console.log('Conexão com o banco de dados encerrada.');
    }
}

createUser();