// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const THEME_KEY = 'theme-preference'
  const root = document.documentElement

  function applyTheme(theme) {
    const t = ['light','dark','auto'].includes(theme) ? theme : 'auto'
    root.setAttribute('data-theme', t)
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || 'auto'
  applyTheme(savedTheme)
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  if (savedTheme === 'auto') {
    mql.addEventListener?.('change', () => applyTheme('auto'))
  }
  window.setTheme = (t) => {
    localStorage.setItem(THEME_KEY, t)
    applyTheme(t)
  }

  const form = document.getElementById('login-form')
  const username = document.getElementById('username')
  const password = document.getElementById('password')
  const toggleBtn = document.querySelector('.toggle-password')
  const error = document.getElementById('form-error')
  const submitBtn = document.getElementById('submit-btn')

  function setError(msg) {
    if (!error) return
    error.textContent = msg || ''
  }

  if (toggleBtn && password) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = password.type === 'password'
      password.type = isHidden ? 'text' : 'password'
      toggleBtn.setAttribute('aria-pressed', String(isHidden))
      toggleBtn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha')
    })
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      setError('')
      const user = (username && username.value || '').trim()
      const pass = (password && password.value) || ''

      if (user.length < 3) {
        setError('Informe um usuário com pelo menos 3 caracteres.')
        username && username.focus()
        return
      }

      if (pass.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.')
        password && password.focus()
        return
      }

      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.textContent = 'Entrando...'
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = 'Entrar'
        }
        form.submit()
      }, 300)
    })
  }

  ;[username, password].forEach((el) => {
    if (!el) return
    el.addEventListener('input', () => {
      if (error && error.textContent) setError('')
    })
  })
})
