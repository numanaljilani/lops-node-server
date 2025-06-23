
import express from 'express';
import { createEmployee, deleteEmployee, employeeDetails, getAllEmployees, getEmployeesByProject, updateEmployee } from '../controllers/employee.controller.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticate, createEmployee);
router.get('/:id',authenticate, employeeDetails);
router.put('/:id',authenticate, updateEmployee);
router.delete('/:id',authenticate, deleteEmployee);
router.get('/',authenticate, getAllEmployees);
router.get('/project-employee',authenticate, getEmployeesByProject);


export default router;