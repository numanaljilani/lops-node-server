import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/project.controller.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticate, createProject);
router.get('/',authenticate, getAllProjects);
router.get('/:id',authenticate, getProjectById);
router.put('/:id',authenticate, updateProject);
router.delete('/:id',authenticate, deleteProject);

export default router;
