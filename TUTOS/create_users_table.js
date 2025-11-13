require('dotenv').config();
const pool = require('../config/db');

async function createUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_successful_login TIMESTAMP WITH TIME ZONE,
            last_failed_login_attempt TIMESTAMP WITH TIME ZONE
        );

        -- Função para atualizar o campo updated_at automaticamente
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger para aplicar a função em alterações de registro
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Tabela "users" criada com sucesso (ou já existe).');
    } catch (err) {
        console.error('Erro ao criar a tabela "users":', err);
    } finally {
        await pool.end();
        console.log('Conexão com o banco de dados encerrada.');
    }
}

createUsersTable();