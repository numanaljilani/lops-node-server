import Employee from "../models/EmployeeModel.js";
import Timesheet from "../models/timesheetModel.js";
import Project from "../models/projectModel.js";
import mongoose from "mongoose";
// Create Timesheet
export const createTimesheet = async (req, res) => {
  console.log(req.user);
  try {
    const { hours_logged } = req.body;
    const employee = await Employee.findOne({ userId: req.user.userId });
    const companyId = await Project.findById(req.body.projectId);
    let total_amount = Number(req.body.hours_logged) * employee.costPerHour;
    await Project.findByIdAndUpdate(
      req.body.projectId,
      {
        $inc: {
          totalHours: hours_logged,
          employee_cost: total_amount,
        },
      },
      { new: true }
    );
    const timesheet = await Timesheet.create({
      ...req.body,
      total_amount,
      companyId: companyId.companyId,
      userId: employee?._id,
    });
    res.status(201).json(timesheet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all Timesheets
export const getAllTimesheets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const projectId = req?.query?.projectId;
  const admin = req.query.admin;
  const {startDate,endDate} = req.query
  console.log(req.query.companyId, "req.query.companyId");
  let filter = {};
  if (projectId && !admin) {
    console.log("inside projectId")
    filter.projectId =  new mongoose.Types.ObjectId(projectId);
  }
  
    // Filter by date range (using created_at or date_logged)
    if (startDate && endDate) {
      filter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
  if (req.query.companyId) {
    filter.companyId = new mongoose.Types.ObjectId(req.query.companyId);
  }
  try {
    const timesheets = await Timesheet.find(filter)
      .sort({ created_at: -1 })
      .populate([
        {
          path: "userId",
          populate: {
            path: "userId",
            select: "name",
          },
        },
        {
          path: "projectId",
          select: "project_name projectId",
        },
      ]);
    res.json({ data: timesheets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Timesheet by ID
export const getTimesheetById = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)

      .populate("projectId")
      .populate("userId");
    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }
    res.json(timesheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Timesheet
export const updateTimesheet = async (req, res) => {
  try {
    const updated = await Timesheet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Timesheet not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Timesheet
export const deleteTimesheet = async (req, res) => {
  try {
    const deleted = await Timesheet.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Timesheet not found" });
    }
    res.json({ message: "Timesheet deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
