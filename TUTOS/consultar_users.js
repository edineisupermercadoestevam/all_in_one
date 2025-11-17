require('dotenv').config();
const pool = require('../config/db');

async function consultarUsers() {
    try {
        const consulta = `
            SELECT * FROM users
        `;

        const result = await pool.query(consulta);
        console.log('Usuários:', result.rows);
    } catch (err) {
        console.error('Erro ao consultar os usuários:', err);
    } finally {
        await pool.end();
        console.log('Conexão com o banco de dados encerrada.');
    }
}

consultarUsers();