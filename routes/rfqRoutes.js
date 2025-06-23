import express from 'express';
import {
  createRFQ,
  getAllRFQs,
  getRFQById,
  updateRFQ,
  deleteRFQ
} from '../controllers/rfq.controller.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticate, createRFQ);
router.get('/',authenticate, getAllRFQs);
router.get('/:id',authenticate, getRFQById);
router.put('/:id',authenticate, updateRFQ);
router.delete('/:id',authenticate, deleteRFQ);

export default router;
