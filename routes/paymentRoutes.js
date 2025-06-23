import express from 'express';
import { createPayment, deletePayment, getAllPayments, updatePayment } from '../controllers/paymentball.controller.js';
import authenticate from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/',authenticate, createPayment);
router.get('/',authenticate, getAllPayments);
router.put('/:id',authenticate, updatePayment);
router.delete('/:id',authenticate, deletePayment);

export default router;
