import express from 'express';
import {
  createCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  companyDetails,
} from '../controllers/company.controller.js'
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticate, createCompany);
router.get('/',authenticate, getAllCompanies);
router.get('/:id',authenticate, companyDetails);
router.put('/:id',authenticate, updateCompany);
router.delete('/:id',authenticate, deleteCompany);

export default router;