import express from 'express';
import {
  createTimesheet,
  getAllTimesheets,
  getTimesheetById,
  updateTimesheet,
  deleteTimesheet,
} from '../controllers/timesheet.controller.js';
import authenticate from '../middleware/authMiddleware.js';
const router = express.Router();

// POST /api/timesheets
router.post('/',authenticate, createTimesheet);

// GET /api/timesheets
router.get('/',authenticate, getAllTimesheets);

// GET /api/timesheets/:id
router.get('/:id',authenticate, getTimesheetById);

// PUT /api/timesheets/:id
router.put('/:id',authenticate, updateTimesheet);

// DELETE /api/timesheets/:id
router.delete('/:id',authenticate, deleteTimesheet);

export default router;
