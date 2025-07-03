import mongoose from "mongoose";
import Expense from "../models/expensesModel.js";
import Project from "../models/projectModel.js";
import Company from "../models/companyModel.js";
// Create Expense
export const createExpense = async (req, res) => {
  try {
    console.log(req.body);
    const projectCompanyId = await Project.findById(req.body.projectId);
    if (projectCompanyId.companyId) {
      req.body.companyId = projectCompanyId.companyId;
    }

    const count = await Expense.countDocuments({
      companyId: projectCompanyId?.companyId,
    });
    const company = await Company.findById(projectCompanyId?.companyId);
    const expenseNumber = 1001 + count;
    const safeCompanyName = company.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    req.body.expenseId = `${safeCompanyName}-exp-${expenseNumber}`;

    const expense = await Expense.create(req.body);
    const updateProject = await Project.findByIdAndUpdate(
      req.body.projectId,
      {
        $inc: {
          total_expenses: Number(req.body.amount),
        },
      },
      { new: true } // optional: returns updated document
    );
    res.status(201).json({ message: "Expense created", expense });
  } catch (err) {
    console.error("Create Expense Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Expenses with Pagination
export const getAllExpenses = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const skip   = (page - 1) * limit;
    const search = req.query.search?.trim();
    console.log(search , "Search")

    const matchStage = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(escaped, 'i'); // Case-insensitive

      matchStage.$or = [
        { expenseId: { $regex: regex } },
        { 'project.projectId': { $regex: regex } },
      ];
    }

    const aggregation = [
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $lookup: {
          from: 'employees',
          localField: 'verifiedBy',
          foreignField: '_id',
          as: 'verifiedBy',
        },
      },
      { $unwind: { path: '$verifiedBy', preserveNullAndEmptyArrays: true } },
      ...(search ? [{ $match: matchStage }] : []),
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, totalResult] = await Promise.all([
      Expense.aggregate(aggregation),
      Expense.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        ...(search ? [{ $match: matchStage }] : []),
        { $count: 'total' },
      ]),
    ]);

    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get All Expenses Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single Expense
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      "projectId verifiedBy"
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get projectExpenses Expense
export const getExpenseByProjectId = async (req, res) => {
  try {
    console.log(req.query.projectId , ">>>>")
    const expense = await Expense.find({projectId : req.query.projectId}).populate(
      "verifiedBy"
    );
    console.log(expense , ">>>>")
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Expense (only provided fields)
export const updateExpense = async (req, res) => {
  console.log(req.body);
  try {
    const newAmount = Number(req.body.amount || 1);
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const result = await Expense.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(req?.body?.projectId),
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $toDouble: "$amount", // convert string to number if needed
            },
          },
        },
      },
    ]);

    console.log(result, "RESULT");

    const total = result[0]?.totalAmount || 0;
    const updateProject = await Project.findByIdAndUpdate(req.body.projectId, {
      total_expenses: Number(totalAmount),
    });
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ message: "Expense updated", expense: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
