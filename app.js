const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(bodyParser.json());


app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API Controle de Finanças está rodando!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
