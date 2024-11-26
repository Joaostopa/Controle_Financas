const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes'); 
const app = express();

app.use(bodyParser.json());

// Rotas
app.use('/users', userRoutes);
app.use('/income', incomeRoutes);
app.use('/expenses', expenseRoutes); 

app.get('/', (req, res) => {
  res.send('API Controle de Finanças está rodando!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
