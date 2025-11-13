# TUTORIAIS

## BANCO DE DADOS

### Exemplo de código que recebe os dados do login:

```javascript
app.post('/login', async (req, res) => {
  console.log('--- Requisição recebida em /login ---')
  console.log('Body:', req.body)
  console.log('Headers:', req.headers)
  console.log('Método:', req.method)
  res.send({ message: 'Dados recebidos com sucesso!' })
}
```
