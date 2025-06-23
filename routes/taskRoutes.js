import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import authenticate from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/',authenticate, createTask);
router.get('/',authenticate, getAllTasks); // supports ?paymentId=<id>
router.get('/:id',authenticate, getTaskById);
router.put('/:id',authenticate, updateTask);
router.delete('/:id',authenticate, deleteTask);

export default router;
