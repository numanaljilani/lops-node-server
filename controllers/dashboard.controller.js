import moment from "moment";
import Client from "../models/clientModel.js";
import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Employee from "../models/EmployeeModel.js";

export const getAdminDashboard = async (req, res) => {
  console.log(req.query);
  try {
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const result = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalFinalAmount: {
            $sum: {
              $toDouble: "$final_amount", // Convert from string to number if needed
            },
          },
        },
      },
    ]);

    const profit = await Project.aggregate([
      // ── 1) keep only fully-completed projects ────────────────────────────────
      {
        $match: {
          completion_percentage: 100,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // ← remove if not needed
        },
      },

      // ── 2) turn string fields into numbers when necessary ───────────────────
      {
        $project: {
          finalAmountNum: { $toDouble: "$final_amount" },
          employeeCostNum: { $toDouble: "$employee_cost" },
          totalExpensesNum: { $toDouble: "$total_expenses" },
        },
      },

      // ── 3) compute net profit per project: final − (employee + expenses) ────
      {
        $addFields: {
          netProfit: {
            $subtract: [
              "$finalAmountNum",
              { $add: ["$employeeCostNum", "$totalExpensesNum"] },
            ],
          },
        },
      },

      // ── 4) sum the net profits (or remove this stage if you want
      //       the per-project breakdown instead of a grand total) ──────────────
      {
        $group: {
          _id: null,
          totalNetProfit: { $sum: "$netProfit" },
        },
      },
    ]);

    const totalNetProfit = profit[0]?.totalNetProfit || 0;

    const total = result[0]?.totalFinalAmount || 0;

    const activeProjects = await Project.countDocuments({
      completion_percentage: { $lt: 100 },
    });
    const activeClients = await Client.countDocuments({ status: true });

    res.status(200).json({
      activeProjects,
      activeClients,
      totalSales: total,
      totalNetProfit,
    });
  } catch (err) {
    console.error("Get All Companies Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserDashboard = async (req, res) =>  {
  try {
    
     const user = await Employee.findOne({ userId: req.user.userId });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const assigneeId = user._id

    if (!assigneeId || !mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ message: 'Valid assigneeId is required' });
    }

    // Aggregation pipeline
    const tasks = await Task.aggregate([
      {
        $match: {
          assigne: new mongoose.Types.ObjectId(assigneeId),
          completion_percentage: { $lt: 100 },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $match: {
          project: { $ne: [] }, // only tasks with existing project
        },
      },
      {
        $sort: { due_date: 1 },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Total tasks count (filtered and valid)
    const totalCountResult = await Task.aggregate([
      {
        $match: {
          assigne: new mongoose.Types.ObjectId(assigneeId),
          completion_percentage: { $lt: 100 },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $match: {
          project: { $ne: [] },
        },
      },
      {
        $count: 'count',
      },
    ]);

    const totalTasks = totalCountResult[0]?.count || 0;

    // Count of ALL pending tasks (with or without valid projectId)
    const pendingCount = await Task.countDocuments({
      assigne: assigneeId,
      completion_percentage: { $lt: 100 },
    });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks,
      pendingCount,
      tasks,
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
