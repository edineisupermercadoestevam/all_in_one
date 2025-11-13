// test-db.js
const pool = require('./config/db.js');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com o banco bem-sucedida:', res.rows[0]);
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco:', err);
  } finally {
    await pool.end();
  }
}

// async function testLogin() {
//   try {
//     const res = await pool.query('SELECT * FROM users', []);
//     for (const user of res.rows) {
//       console.log(user);
//     }
//   } catch (err) {
//     console.error('❌Não conectou ao banco de dados', err);
//   } finally {
//     await pool.end();
//   }
// }

testConnection();
// testLogin();