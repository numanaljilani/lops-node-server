import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} from '../controllers/client.controller.js'
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticate, createClient);
router.get('/',authenticate, getAllClients);
router.get('/:id',authenticate, getClientById);
router.put('/:id',authenticate, updateClient);
router.delete('/:id',authenticate, deleteClient);

export default router;
