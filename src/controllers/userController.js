const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const filePath = path.join(__dirname, '../data/users.json');


const getUsers = async () => {
  try {
    const users = await fs.readJSON(filePath);
    return users;
  } catch (err) {
    return [];
  }
};


const saveUsers = async (users) => {
  try {
    await fs.writeJSON(filePath, users);
  } catch (err) {
    console.error('Erro ao salvar usuários:', err);
  }
};


exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  const users = await getUsers();


  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ error: 'E-mail já está em uso!' });
  }


  const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    role: 'user', 
  };

  users.push(newUser);
  await saveUsers(users);

  res.status(201).json({ message: 'Usuário criado com sucesso!', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios!' });
  }

  const users = await getUsers();


  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado!' });
  }


  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Senha inválida!' });
  }


  const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });

  res.status(200).json({ message: 'Login realizado com sucesso!', token });
};
