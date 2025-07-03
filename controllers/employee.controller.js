import User from "../models/User.js";
import Employee from "../models/EmployeeModel.js";
import Task from "../models/taskModel.js";
import mongoose from "mongoose";
import ProjectPayment from "../models/paymentballModel.js";

const createEmployee = async (req, res) => {
  console.log(req.body);
  try {
    const {
      name,
      email,
      contact,
      description,
      location,
      company,
      position,
      salary,
      currency,
      status,
      access,
    } = req.body;

    if (!contact || contact.length < 4) {
      return res
        .status(400)
        .json({ message: "Contact must be at least 4 digits" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log(contact.slice(-6), "PASS");
      const rawPassword = contact.slice(-6); // last 4 digits of contact
      user = new User({
        name,
        email,
        password: rawPassword,
        access,
      });
      await user.save();
    }

    // Create employee and link userId
    const employee = new Employee({
      userId: user._id,
      contact,
      description,
      location,
      company,
      position,
      salary,
      costPerHour: (salary / 207).toFixed(2),
      currency,
      status,
    });

    await employee.save();

    res
      .status(201)
      .json({ message: "Employee created", employeeId: employee._id });
  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const employeeDetails = async (req, res) => {
  try {
    const { id } = req.params; // employee _id

    const employee = await Employee.findById(id).populate("userId company");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee updated", employee });
  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // employee _id
    const updates = req.body;
    console.log(updates, "update");

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update associated User
    const user = await User.findById(employee.userId);
    if (user) {
      if (updates?.userId?.name !== undefined)
        user.name = updates?.userId?.name;
      if (updates?.userId?.email !== undefined)
        user.email = updates?.userId?.email;
      if (updates?.access !== undefined) user.access = updates.access;
      await user.save();
    }

    // Selectively update only present fields for Employee
    const updatableFields = [
      "contact",
      "description",
      "location",
      "company",
      "position",
      "salary",
      "currency",
      "status",
    ];

    updatableFields.forEach((field) => {
      if (updates[field] !== undefined) {
        employee[field] = updates[field];
      }
    });

    await employee.save();

    res.status(200).json({ message: "Employee updated", employee });
  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params; // employee ID

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const userId = employee.userId;

    await Employee.findByIdAndDelete(id);
    await User.findByIdAndDelete(userId); // Also delete user account

    res.status(200).json({ message: "Employee and user deleted" });
  } catch (err) {
    console.error("Delete Employee Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllEmployees = async (req, res) => {
  console.log(req.query)
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const matchStage = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      matchStage.$or = [
        { contact: { $regex: regex } },
        { "user.name": { $regex: regex } },
        { "user.email": { $regex: regex } },
      ];
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search ? [{ $match: matchStage }] : []),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, totalResult] = await Promise.all([
      Employee.aggregate(aggregationPipeline),
      Employee.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        ...(search ? [{ $match: matchStage }] : []),
        { $count: "total" },
      ]),
    ]);

    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("Get All Employees Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEmployeesByProject = async (req, res, projectId) => {
  try {
    console.log(projectId, "ProjectId");

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Valid projectId is required" });
    }

    // Aggregate tasks linked through payments to the project
    // const tasks = []
    const payments = await ProjectPayment.find({ projectId }).select("_id");
    const employeeIds = payments.map((t) => t._id);
    const tasks = await Task.find({ paymentId: { $in: employeeIds } }).select(
      "assignTo"
    );

    console.log(tasks, "TASK");

    const employees = await Employee.find({ _id: { $in: tasks } });

    console.log(employees);
  } catch (err) {
    console.error("Error fetching project employees:", err);
    // res.status(500).json({ message: 'Internal server error' });
  }
};

export { createEmployee };
