const express = require('express')
const session = require('express-session')
const path = require('path')
require('dotenv').config()

const { Pool } = require('pg')
const crypto = require('crypto')

const app = express()
const port = process.env.PORT || 3000

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT || 5432),
  database: process.env.PG_DATABASE,
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/db/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1')
    res.json({ ok: true, result: rows[0] })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.get('/db/tables', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public' ORDER BY tablename")
    res.json({ ok: true, tables: rows.map(r => r.tablename) })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.get('/db/tables/:name/columns', async (req, res) => {
  try {
    const { name } = req.params
    const { rows } = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1
       ORDER BY ordinal_position`,
      [name]
    )
    res.json({ ok: true, columns: rows })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

function hashPassword(password) {
  const saltBuf = crypto.randomBytes(16)
  const iterations = 150000
  const hashBuf = crypto.pbkdf2Sync(password, saltBuf, iterations, 32, 'sha256')
  return `pbkdf2_sha256$${iterations}$${saltBuf.toString('base64')}$${hashBuf.toString('base64')}`
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 4) return false
  const [algo, iterStr, saltB64, hashB64] = parts
  if (algo !== 'pbkdf2_sha256') return false
  const iterations = Number(iterStr)
  if (!iterations || !saltB64 || !hashB64) return false
  const saltBuf = Buffer.from(saltB64, 'base64')
  const expected = Buffer.from(hashB64, 'base64')
  const computed = crypto.pbkdf2Sync(password, saltBuf, iterations, expected.length, 'sha256')
  if (computed.length !== expected.length) return false
  return crypto.timingSafeEqual(computed, expected)
}

async function ensureAdminUser() {
  const email = 'edinei'
  const name = 'Edinei'
  const role = 'admin'
  const status = 'active'
  const existing = await pool.query('SELECT 1 FROM users WHERE email=$1 LIMIT 1', [email])
  if (!existing.rows.length) {
    const passwordHash = hashPassword('12312312')
    await pool.query(
      'INSERT INTO users (email, password_hash, role, name, status) VALUES ($1,$2,$3,$4,$5)',
      [email, passwordHash, role, name, status]
    )
  }
}

app.get('/db/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, role, name, status, created_at, updated_at FROM users ORDER BY id LIMIT 50')
    res.json({ ok: true, users: rows })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.post('/login', async (req, res) => {
  const userField = (req.body.username || '').trim()
  const password = req.body.password || ''
  if (userField.length < 3 || password.length < 8) {
    return res.redirect('/')
  }
  try {
    const { rows } = await pool.query('SELECT id, email, role, name, status, password_hash FROM users WHERE email=$1 LIMIT 1', [userField])
    const row = rows[0]
    if (!row || !verifyPassword(password, row.password_hash) || row.status !== 'active') {
      return res.redirect('/')
    }
    req.session.user = { id: row.id, email: row.email, role: row.role, name: row.name }
    return res.redirect('/dashboard')
  } catch (err) {
    return res.redirect('/')
  }
})

app.get('/dashboard', (req, res) => {
  const u = req.session.user
  if (!u) return res.redirect('/')
  res.type('html').send(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Dashboard</title><link rel="stylesheet" href="/css/style.css"></head><body><main class="login-page"><section class="login-card"><h1>Dashboard</h1><p class="subtitle">Bem-vindo, ${u.name} (${u.role})</p><p>Seu login: ${u.email}</p><a class="btn-primary" href="/">Voltar</a></section></main></body></html>`
  )
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

;(async () => {
  try {
    await ensureAdminUser()
  } catch {}
})()
