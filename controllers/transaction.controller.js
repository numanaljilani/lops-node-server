import TransactionHistory from "../models/transactionModel.js"; // adjust path if needed

export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Get total count
    const total = await TransactionHistory.countDocuments();

    // Fetch paginated results
    const transactions = await TransactionHistory.find()
      .sort({ createdAt: -1 }) // optional: sort by newest first
      .skip(skip)
      .limit(limit)
      .populate([{path : 'projectId' , populate : {path : 'company' , select : ''}}]);

    res.status(200).json({
    
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: transactions,
 
    });
  } catch (err) {
    console.error("Get Transactions Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
