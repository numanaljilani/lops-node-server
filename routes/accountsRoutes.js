import express from 'express';

import authenticate from '../middleware/authMiddleware.js';
import { getAllAccountsBalls, getPaymentBallDetailsById, updateAccountsPayment } from '../controllers/accounts.controller.js';

const router = express.Router();

// router.post('/',authenticate, createCompany);
router.get('/',authenticate, getAllAccountsBalls);
router.get('/:id',authenticate, getPaymentBallDetailsById);
router.put('/:id',authenticate, updateAccountsPayment);
// router.delete('/:id',authenticate, deleteCompany);

export default router;