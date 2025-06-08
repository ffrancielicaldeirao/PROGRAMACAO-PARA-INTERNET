import express from 'express';
import session from 'express-session';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: true
}));

const users = [];
const produtos = [];

app.get('/', (req, res) => {
  res.redirect('/cadastro');
});

app.get('/cadastro', (req, res) => {
  res.send(`
  <html>
    <head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <title>Cadastro</title>
    </head>
    <body class="container mt-5">
      <h1>Cadastro de Usuário</h1>
      <form action="/cadastro" method="POST">
        <div class="mb-3">
          <label>Nome:</label>
          <input type="text" name="nome" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Senha:</label>
          <input type="password" name="senha" class="form-control" required>
        </div>
        <button class="btn btn-primary" type="submit">Cadastrar</button>
        <a href="/login" class="btn btn-link">Login</a>
      </form>
    </body>
  </html>
  `);
});

app.post('/cadastro', (req, res) => {
  const { nome, senha } = req.body;
  const existe = users.find(u => u.nome === nome);
  if (existe) {
    return res.send('Usuário já existe. <a href="/cadastro">Voltar</a>');
  }
  users.push({ nome, senha });
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.send(`
  <html>
    <head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <title>Login</title>
    </head>
    <body class="container mt-5">
      <h1>Login</h1>
      <form action="/login" method="POST">
        <div class="mb-3">
          <label>Nome:</label>
          <input type="text" name="nome" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Senha:</label>
          <input type="password" name="senha" class="form-control" required>
        </div>
        <button class="btn btn-success" type="submit">Entrar</button>
        <a href="/cadastro" class="btn btn-link">Criar conta</a>
      </form>
    </body>
  </html>
  `);
});

app.post('/login', (req, res) => {
  const { nome, senha } = req.body;
  const user = users.find(u => u.nome === nome && u.senha === senha);
  if (user) {
    req.session.usuario = nome;
    req.session.ultimoAcesso = new Date().toLocaleString();
    res.redirect('/cadastro-produto');
  } else {
    res.send('Login inválido. <a href="/login">Tentar novamente</a>');
  }
});

app.get('/cadastro-produto', (req, res) => {
  if (!req.session.usuario) {
    return res.send('Você precisa fazer login. <a href="/login">Login</a>');
  }

  let tabela = '';
  if (produtos.length > 0) {
    tabela += '<table class="table table-bordered mt-4"><thead><tr>';
    tabela += '<th>Código de Barras</th><th>Descrição</th><th>Preço de Custo</th><th>Preço de Venda</th><th>Validade</th><th>Estoque</th><th>Fabricante</th>';
    tabela += '</tr></thead><tbody>';
    produtos.forEach(p => {
      tabela += `<tr><td>${p.cod}</td><td>${p.desc}</td><td>${p.custo}</td><td>${p.venda}</td><td>${p.validade}</td><td>${p.qtd}</td><td>${p.fabricante}</td></tr>`;
    });
    tabela += '</tbody></table>';
  }

  res.send(`
  <html>
    <head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <title>Cadastro de Produto</title>
    </head>
    <body class="container mt-5">
      <h1>Cadastro de Produto</h1>
      <p>Bem-vindo, ${req.session.usuario}. Último acesso: ${req.session.ultimoAcesso}</p>
      <form action="/cadastro-produto" method="POST">
        <div class="mb-3">
          <label>Código de Barras:</label>
          <input type="text" name="cod" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Descrição:</label>
          <input type="text" name="desc" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Preço de Custo:</label>
          <input type="number" step="0.01" name="custo" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Preço de Venda:</label>
          <input type="number" step="0.01" name="venda" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Data de Validade:</label>
          <input type="date" name="validade" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Quantidade em Estoque:</label>
          <input type="number" name="qtd" class="form-control" required>
        </div>
        <div class="mb-3">
          <label>Nome do Fabricante:</label>
          <input type="text" name="fabricante" class="form-control" required>
        </div>
        <button class="btn btn-primary" type="submit">Cadastrar Produto</button>
        <a href="/login" class="btn btn-secondary">Sair</a>
      </form>
      ${tabela}
    </body>
  </html>
  `);
});

app.post('/cadastro-produto', (req, res) => {
  if (!req.session.usuario) {
    return res.send('Você precisa fazer login. <a href="/login">Login</a>');
  }
  produtos.push(req.body);
  res.redirect('/cadastro-produto');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});