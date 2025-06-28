import mongoose from "mongoose";
import ProjectPayment from "../models/paymentballModel.js";
import TransactionHistory from "../models/transactionModel.js";
import Company from "../models/companyModel.js";

// Create Payment
export const createPayment = async (req, res) => {
  console.log(req.body);
  try {
    const project = project.findById(req.body.projectId)
    if(project?.companyId){
      req.body.companyId =  project?.companyId
    }
    const payment = await ProjectPayment.create(req.body);

    res.status(201).json({ message: "Payment created", payment });
  } catch (err) {
    console.error("Payment Creation Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Payments
export const getAllAccountsBalls = async (req, res) => {
  console.log("Insdei accounts");
  try {
    let payments;
    let projectId;
    if (projectId) {
      payments = await ProjectPayment.find({ completionPercentage: 100 })
        .populate("projectId receivedBy")
        .sort({ createdAt: -1 });
    } else {
      payments = await ProjectPayment.find({ completionPercentage: 100 })
        .populate("projectId receivedBy")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ data: payments });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Payment
export const updateAccountsPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

  
    // Find and update the payment
    const updatedPayment = await ProjectPayment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("projectId receivedBy");

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });

    }

    const company = await Company.findById(updatedPayment?.companyId); // Ensure payment has companyId
    if (!company || !company.name) {
      return res.status(400).json({ message: "Invalid company" });
    }

       // Step 3: Count existing payments for this company that already have invoice numbers
    const count = await ProjectPayment.countDocuments({
      companyId: company._id,
      invoiceNumber: { $exists: true },
    });

        const invoiceNumber = `${company?.name?.trim()?.toLowerCase()?.replace(/\s+/g, '-')}-INV-${1001 + count}`;

        console.log(req.body ,">>>>>" ,  invoiceNumber , "<<<<<")
    // Step 4: Update payment with the generated invoice number
    if(req?.body?.verification_status == 'invoiced' || req?.body?.verification_status == 'paid'){
      updatedPayment.invoice_number = invoiceNumber;

      await updatedPayment.save();
    }



    if (updateData.verification_status == "paid") {
      await TransactionHistory.create({
        type: "payment",
        amount: parseFloat(req.body.new_payment_amount),
        sourceId: updatedPayment._id,
        projectId: req.body.projectId,
        verifiedBy: req.user.userId,
        notes: req.body.notes,
      });
    }

    res.status(200).json({ data: updatedPayment });
  } catch (err) {
    console.error(err);
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

export const getPaymentBallDetailsById = async (req, res) => {
  try {
    const paymentBall = await ProjectPayment.findById(req.params.id).populate(
      "projectId"
    );
    if (!paymentBall) {
      return res.status(404).json({ message: "paymentBall not found" });
    }
    res.status(200).json({ data: paymentBall });
  } catch (err) {
    console.error("Get accounts paymentBall Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
