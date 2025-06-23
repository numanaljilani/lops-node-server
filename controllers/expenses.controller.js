import Expense from '../models/expensesModel.js';

// Create Expense
export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ message: 'Expense created', expense });
  } catch (err) {
    console.error('Create Expense Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Expenses with Pagination
export const getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, projectId } = req.query;

    const filter = {};
    if (projectId) {
      filter.projectId = projectId;
    }

    const expenses = await Expense.find(filter)
      .populate('projectId verifiedBy')
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
    console.error('Get All Expenses Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Single Expense
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('projectId verifiedBy');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Expense (only provided fields)
export const updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json({ message: 'Expense updated', expense: updated });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
