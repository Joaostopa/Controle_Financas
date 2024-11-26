const fs = require('fs-extra');
const path = require('path');

const filePath = path.join(__dirname, '../data/income.json');


const getIncomes = async () => {
  try {
    const incomes = await fs.readJSON(filePath);
    return incomes;
  } catch (err) {
    return [];
  }
};


const saveIncomes = async (incomes) => {
  try {
    await fs.writeJSON(filePath, incomes);
  } catch (err) {
    console.error('Erro ao salvar receitas:', err);
  }
};


exports.createIncome = async (req, res) => {
  const { description, value, date, category } = req.body;

  if (!description || !value || !date || !category) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  const incomes = await getIncomes();

  const newIncome = {
    id: Date.now(),
    description,
    value,
    date,
    category,
    userId: req.user.id, 
  };

  incomes.push(newIncome);
  await saveIncomes(incomes);

  res.status(201).json({ message: 'Receita criada com sucesso!', newIncome });
};


exports.listIncomes = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const incomes = await getIncomes();


  const userIncomes = incomes.filter((income) => income.userId === req.user.id);


  const startIndex = (page - 1) * limit;
  const paginatedIncomes = userIncomes.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    total: userIncomes.length,
    page: Number(page),
    limit: Number(limit),
    data: paginatedIncomes,
  });
};


exports.updateIncome = async (req, res) => {
  const { id } = req.params;
  const { description, value, date, category } = req.body;

  const incomes = await getIncomes();
  const incomeIndex = incomes.findIndex((income) => income.id === Number(id) && income.userId === req.user.id);

  if (incomeIndex === -1) {
    return res.status(404).json({ error: 'Receita não encontrada!' });
  }

  const updatedIncome = {
    ...incomes[incomeIndex],
    description: description || incomes[incomeIndex].description,
    value: value || incomes[incomeIndex].value,
    date: date || incomes[incomeIndex].date,
    category: category || incomes[incomeIndex].category,
  };

  incomes[incomeIndex] = updatedIncome;
  await saveIncomes(incomes);

  res.status(200).json({ message: 'Receita atualizada com sucesso!', updatedIncome });
};


exports.deleteIncome = async (req, res) => {
  const { id } = req.params;

  const incomes = await getIncomes();
  const filteredIncomes = incomes.filter((income) => income.id !== Number(id) || income.userId !== req.user.id);

  if (incomes.length === filteredIncomes.length) {
    return res.status(404).json({ error: 'Receita não encontrada!' });
  }

  await saveIncomes(filteredIncomes);
  res.status(200).json({ message: 'Receita deletada com sucesso!' });
};
