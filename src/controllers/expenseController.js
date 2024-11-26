const fs = require('fs-extra');
const path = require('path');

const filePath = path.join(__dirname, '../data/expenses.json');


const getExpenses = async () => {
  try {
    const expenses = await fs.readJSON(filePath);
    return expenses;
  } catch (err) {
    return [];
  }
};


const saveExpenses = async (expenses) => {
  try {
    await fs.writeJSON(filePath, expenses);
  } catch (err) {
    console.error('Erro ao salvar despesas:', err);
  }
};

exports.createExpense = async (req, res) => {
  const { description, value, date, category } = req.body;

  if (!description || !value || !date || !category) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  const expenses = await getExpenses();

  const newExpense = {
    id: Date.now(),
    description,
    value,
    date,
    category,
    userId: req.user.id, 
  };

  expenses.push(newExpense);
  await saveExpenses(expenses);

  res.status(201).json({ message: 'Despesa criada com sucesso!', newExpense });
};


exports.listExpenses = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const expenses = await getExpenses();


  const userExpenses = expenses.filter((expense) => expense.userId === req.user.id);

  const startIndex = (page - 1) * limit;
  const paginatedExpenses = userExpenses.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    total: userExpenses.length,
    page: Number(page),
    limit: Number(limit),
    data: paginatedExpenses,
  });
};


exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, value, date, category } = req.body;

  const expenses = await getExpenses();
  const expenseIndex = expenses.findIndex((expense) => expense.id === Number(id) && expense.userId === req.user.id);

  if (expenseIndex === -1) {
    return res.status(404).json({ error: 'Despesa não encontrada!' });
  }

  const updatedExpense = {
    ...expenses[expenseIndex],
    description: description || expenses[expenseIndex].description,
    value: value || expenses[expenseIndex].value,
    date: date || expenses[expenseIndex].date,
    category: category || expenses[expenseIndex].category,
  };

  expenses[expenseIndex] = updatedExpense;
  await saveExpenses(expenses);

  res.status(200).json({ message: 'Despesa atualizada com sucesso!', updatedExpense });
};


exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  const expenses = await getExpenses();
  const filteredExpenses = expenses.filter((expense) => expense.id !== Number(id) || expense.userId !== req.user.id);

  if (expenses.length === filteredExpenses.length) {
    return res.status(404).json({ error: 'Despesa não encontrada!' });
  }

  await saveExpenses(filteredExpenses);
  res.status(200).json({ message: 'Despesa deletada com sucesso!' });
};
