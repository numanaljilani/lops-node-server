import moment from "moment";
import Client from "../models/clientModel.js";
import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Employee from "../models/EmployeeModel.js";


export const getAdminDashboard = async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    // Validate companyId
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: 'Invalid or missing company ID' });
    }

    // Set default date range to current month if not provided
    let start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
    let end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    // Validate dates
    if (startDate && isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid start date' });
    }
    if (endDate && isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid end date' });
    }
    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Total Sales (sum of final_amount)
    const result = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          company: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $group: {
          _id: null,
          totalFinalAmount: {
            $sum: {
              $toDouble: { $ifNull: ['$final_amount', '0'] }, // Handle null/undefined
            },
          },
        },
      },
    ]);

    // Total Net Profit (for completed projects)
    const profit = await Project.aggregate([
      // Match fully completed projects within date range and company
      {
        $match: {
          completion_percentage: 100,
          createdAt: { $gte: start, $lte: end },
          company: new mongoose.Types.ObjectId(companyId),
        },
      },
      // Convert string fields to numbers
      {
        $project: {
          finalAmountNum: { $toDouble: { $ifNull: ['$final_amount', '0'] } },
          employeeCostNum: { $toDouble: { $ifNull: ['$employee_cost', '0'] } },
          totalExpensesNum: { $toDouble: { $ifNull: ['$total_expenses', '0'] } },
        },
      },
      // Compute net profit per project
      {
        $addFields: {
          netProfit: {
            $subtract: [
              '$finalAmountNum',
              { $add: ['$employeeCostNum', '$totalExpensesNum'] },
            ],
          },
        },
      },
      // Sum net profits
      {
        $group: {
          _id: null,
          totalNetProfit: { $sum: '$netProfit' },
        },
      },
    ]);

    // Active Projects (incomplete projects for the company)
    const activeProjects = await Project.countDocuments({
      completion_percentage: { $lt: 100 },
      company: new mongoose.Types.ObjectId(companyId),
    });

    // Active Clients (clients with status true for the company)
    const activeClients = await Client.countDocuments({
      status: true,
      company: new mongoose.Types.ObjectId(companyId),
    });

    const totalSales = result[0]?.totalFinalAmount || 0;
    const totalNetProfit = profit[0]?.totalNetProfit || 0;

    res.status(200).json({
      activeProjects,
      activeClients,
      totalSales,
      totalNetProfit,
    });
  } catch (err) {
    console.error('Get Admin Dashboard Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const getUserDashboard = async (req, res) =>  {
  try {
    
     const user = await Employee.findOne({ userId: req.user.userId });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const assigneeId = user._id
    console.log(req.query.companyId , "Company Id")

    if (!assigneeId || !mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ message: 'Valid assigneeId is required' });
    }

    // Aggregation pipeline
    const tasks = await Task.aggregate([
      {
        $match: {
          assigne: new mongoose.Types.ObjectId(assigneeId),
          completion_percentage: { $lt: 100 },
          companyId : new mongoose.Types.ObjectId(req?.query?.companyId)
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
          companyId : req?.query?.companyId
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
      companyId : req?.query?.companyId
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
