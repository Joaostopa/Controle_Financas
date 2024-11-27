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

  res.status(201).json({
    message: 'Usuário criado com sucesso!',
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
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

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({ message: 'Login realizado com sucesso!', token });
};


exports.installSystem = async (req, res) => {
  try {
    const users = await getUsers();


    const adminExists = users.some((user) => user.role === 'admin');
    if (adminExists) {
      return res.status(400).json({ message: 'Administrador já existe no sistema!' });
    }

 
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: Date.now(),
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
    };

    users.push(adminUser);
    await saveUsers(users);

    res.status(201).json({
      message: 'Administrador criado com sucesso!',
      admin: { id: adminUser.id, name: adminUser.name, email: adminUser.email },
    });
  } catch (err) {
    console.error('Erro ao inicializar o sistema:', err);
    res.status(500).json({ error: 'Erro interno ao inicializar o sistema.' });
  }
};


exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado! Somente administradores podem criar outros administradores.' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  const users = await getUsers();

  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ error: 'E-mail já está em uso!' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    role: 'admin',
  };

  users.push(newAdmin);
  await saveUsers(users);

  res.status(201).json({
    message: 'Administrador criado com sucesso!',
    admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email },
  });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado! Apenas administradores podem excluir usuários.' });
  }

  const users = await getUsers();


  const userIndex = users.findIndex((user) => user.id === Number(id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado!' });
  }

 
  if (users[userIndex].role === 'admin') {
    return res.status(403).json({ error: 'Administradores não podem excluir outros administradores.' });
  }


  users.splice(userIndex, 1);
  await saveUsers(users);

  res.status(200).json({ message: 'Usuário excluído com sucesso!' });
};


exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado! Apenas administradores podem editar dados de outros usuários.' });
  }

  const users = await getUsers();


  const userIndex = users.findIndex((user) => user.id === Number(id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado!' });
  }


  users[userIndex] = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    email: email || users[userIndex].email,
    role: role || users[userIndex].role, 
  };

  await saveUsers(users);

  res.status(200).json({ message: 'Dados do usuário atualizados com sucesso!', user: users[userIndex] });
};

