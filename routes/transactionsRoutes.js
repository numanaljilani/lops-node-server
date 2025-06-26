import express from 'express';

import authenticate from '../middleware/authMiddleware.js';
import { getTransactions } from '../controllers/transaction.controller.js';

const router = express.Router();

// router.post('/',authenticate, createRFQ);
router.get('/',authenticate, getTransactions);
// router.get('/:id',authenticate, getRFQById);
// router.put('/:id',authenticate, updateRFQ);
// router.delete('/:id',authenticate, deleteRFQ);

export default router;
