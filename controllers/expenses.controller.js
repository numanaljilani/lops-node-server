import mongoose from "mongoose";
import Expense from "../models/expensesModel.js";
import Project from "../models/projectModel.js";
// Create Expense
export const createExpense = async (req, res) => {
  try {
    console.log(req.body);
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (projectId) {
      filter.projectId = projectId;
    }

    const expenses = await Expense.find(filter)
      .populate("projectId verifiedBy")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      data: expenses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
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
