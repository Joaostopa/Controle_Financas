require('dotenv').config();


const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes'); 
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swager.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/income', incomeRoutes);
app.use('/expenses', expenseRoutes); 

app.get('/', (req, res) => {
  res.send('API Controle de Finanças está rodando!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
