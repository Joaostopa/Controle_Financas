const express = require('express');
const incomeController = require('../controllers/incomeController');
const authMiddleware = require('../middlewares/authMiddleware'); 
const router = express.Router();

router.post('/', authMiddleware, incomeController.createIncome);
router.get('/', authMiddleware, incomeController.listIncomes);
router.put('/:id', authMiddleware, incomeController.updateIncome);
router.delete('/:id', authMiddleware, incomeController.deleteIncome);

module.exports = router;
