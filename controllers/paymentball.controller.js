import Company from "../models/companyModel.js";
import ProjectPayment from "../models/paymentballModel.js";
import Project from "../models/projectModel.js";
import TransactionHistory from "../models/transactionModel.js";

// Create Payment
export const createPayment = async (req, res) => {
  console.log(req.body);
  try {
    const companyId = await Project.findById(req.body.projectId);
    if(companyId?.companyId){
      req.body.companyId = companyId.companyId;
    }
   const result = await ProjectPayment.aggregate([
      {
        $match: {
          projectId : companyId._id,
        },
      },
      {
        $group: {
          _id: null,
          totalWeightage: { $sum: "$projectPercentage" },
        },
      },
    ]);

        const totalWeightage = result[0]?.totalWeightage || 0;
    if(totalWeightage + Number(req.body.projectPercentage) > 100){
      return res.status(400).json({ message: `you can not create more payment ball. max limit is 100, this ball have remaing percentage is ${100 - totalWeightage}` });
    }


    const payment = await ProjectPayment.create(req.body);

    await TransactionHistory.create({
      type: "payment",
      amount: parseFloat(req.body.amount),
      sourceId: payment._id,
      projectId: req.body.projectId,
      verifiedBy: req.body.receivedBy,
      notes: req.body.notes,
      status: req.body.verification_status === "paid" ? "verified" : "pending",
    });

    res.status(201).json({ message: "Payment created", payment });
  } catch (err) {
    console.error("Payment Creation Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Payments
export const getAllPayments = async (req, res) => {
  const { projectId } = req?.query;
  console.log(projectId , "PROJECTID")
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  // console.log(req?.query?.projectId , "PAYMENT BALLS")
  try {
    let payments;
    if (projectId) {
      payments = await ProjectPayment.find({ projectId })
        .populate("projectId receivedBy")
        .sort({ createdAt: -1 });
    } else {
      payments = await ProjectPayment.find()
        .populate("projectId receivedBy")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ data: payments });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Payment
export const updatePayment = async (req, res) => {
  try {
    const payment = await ProjectPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });


    res.status(200).json({ message: "Payment updated", payment });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Payment
export const deletePayment = async (req, res) => {
  try {
    const payment = await ProjectPayment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    await TransactionHistory.deleteMany({ sourceId: payment._id });
    res.status(200).json({ message: "Payment and history deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
