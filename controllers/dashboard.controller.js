import moment from "moment";
import Client from "../models/clientModel.js";
import Project from "../models/projectModel.js";

export const getAdminDashboard = async (req, res) => {
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
