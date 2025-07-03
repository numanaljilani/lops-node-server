import express from 'express';
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseByProjectId,
} from '../controllers/expenses.controller.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticate, createExpense);
router.get('/',authenticate, getAllExpenses); // supports ?page=1&limit=10&projectId=<id>
router.get('/projectId',authenticate, getExpenseByProjectId); // supports ?page=1&limit=10&projectId=<id>
router.get('/:id',authenticate, getExpenseById);
router.put('/:id',authenticate, updateExpense);
router.delete('/:id',authenticate, deleteExpense);

export default router;
