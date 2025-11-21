// Testar banco do acesse
const { Pool } = require('pg')
const express = require('express')
const path = require('path')

const pool = new Pool({
  user: '001_2',
  host: '192.168.0.200',
  database: 'banco001',
  password: '001_2',
  port: '5434',
});

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com o banco bem-sucedida:', res.rows[0]);
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco:', err);
  } finally {
    // await pool.end();
  }
}

testConnection()
