// // public/js/script.js
document.addEventListener('DOMContentLoaded', () => {


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

// Função para ler parâmetros de erro da URL e exibir
function displayUrlError() {
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  let errorMessage = '';

  if (errorParam) {
    // Limpa o parâmetro 'error' da URL para que não fique aparecendo a cada refresh
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);

    switch (errorParam) {
      case 'usuário_ou_senha_vazios':
        errorMessage = 'Por favor, preencha todos os campos.';
        break;
      case 'usuário_ou_senha_incorretos':
        errorMessage = 'Nome de usuário ou senha incorretos.';
        break;
      case 'acesso_negado':
        errorMessage = 'Acesso negado. Faça login para continuar.';
        break;
      case 'erro_interno':
        errorMessage = 'Ocorreu um erro interno. Tente novamente mais tarde.';
        break;
      default:
        errorMessage = 'Ocorreu um erro.'; // Trata erros desconhecidos
    }
  }
  // Exibe a mensagem na div de erro
  if (errorMessage && error) {
    setError(errorMessage);
  }
}