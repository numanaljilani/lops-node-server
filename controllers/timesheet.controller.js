import Employee from "../models/EmployeeModel.js";
import Timesheet from "../models/timesheetModel.js";
import Project from "../models/projectModel.js";
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
  console.log(projectId, "projectId");
  let filter = {};
  if (projectId) {
    filter.projectId = projectId;
  }
  try {
    // [
    //     {
    //       path: 'rfq',
    //       populate: {
    //         path: 'client',
    //         select: 'client_name contact_info'
    //       }
    //     },
    //     { path: 'company'   },
    //     { path: 'approvedBy'}
    //   ]
    const timesheets = await Timesheet.find(filter).populate([
      {
        path: "userId",
        populate: {
          path: "userId",
          select: "name",
        },
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
