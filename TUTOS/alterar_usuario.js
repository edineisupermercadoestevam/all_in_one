require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// --- Dados de Teste ---
// Teste 1: Altera apenas o username
// const ID = 1;
// const USERNAME = 'novo_username';
// const PASSWORD = '';

// Teste 2: Altera apenas a senha
// const ID = 1;
// const USERNAME = '';
// const PASSWORD = 'nova_senha_forte';

// Teste 3: Altera ambos
const ID = 1;
const USERNAME = 'usuario_completo';
const PASSWORD = 'senha_muito_segura123';

// Teste 4: Não altera nada
// const ID = 1;
// const USERNAME = '';
// const PASSWORD = '';


async function alterUsers(ID, USERNAME, PASSWORD) {
    const userId = ID;
    const username = USERNAME;
    const plainPassword = PASSWORD;
    const saltRounds = 10;

    let passwordHash = null; // Inicializa como null

    try {
        // 1. Gera o hash da senha APENAS se a nova senha foi fornecida
        if (plainPassword) {
            passwordHash = await bcrypt.hash(plainPassword, saltRounds);
        }

        // 2. Query SQL inteligente que atualiza apenas se os valores não forem nulos/vazios
        const alterUserQuery = `
            UPDATE users
            SET 
                username = COALESCE(NULLIF($1, ''), username),
                password_hash = COALESCE($2, password_hash),
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, username, created_at, updated_at;
        `;

        // 3. Passa os valores para a query. Se passwordHash for null, a query manterá o valor antigo.
        const result = await pool.query(alterUserQuery, [username, passwordHash, userId]);
        
        if (result.rowCount > 0) {
            console.log('Usuário alterado com sucesso:', result.rows[0]);
        } else {
            console.log('Nenhum usuário encontrado com o ID:', userId);
        }

    } catch (err) {
        console.error('Erro ao alterar o usuário:', err);
    } finally {
        // Em uma aplicação real, você não fecharia o pool a cada requisição.
        // O pool deve ser gerenciado pelo ciclo de vida da aplicação.
        // await pool.end(); 
        // console.log('Conexão com o banco de dados encerrada.');
    }
}

alterUsers(ID, USERNAME, PASSWORD);