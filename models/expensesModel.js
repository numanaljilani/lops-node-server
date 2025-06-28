import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    expenseId: { type: String  },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    category_display: { type: String, required: true },
    expense_type: { type: String, required: true },
    net_amount: { type: Number, required: true },
    vat_percentage: { type: Number, default: 0 },
    vat_amount: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    payment_mode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque"],
      required: true,
    },
    payment_date: { type: Date },
    paid_amount: { type: Number, default: 0 },
    balance_amount: { type: Number, default: 0 },
    due_date: { type: Date },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },
    remarks: { type: String },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;


// Auto-generate expenseId
expenseSchema.pre("save", async function (next) {
  if (this.expenseId || !this.companyId) return next();

  try {
    const company = await mongoose.model("Company").findById(this.companyId);
    console.log(company , "DATABASE")
    if (!company || !company.name) {
      return next(new Error("Company not found or has no name"));
    }

    const count = await mongoose
      .model("Expense")
      .countDocuments({ companyId: this.companyId });

    // Pad number if needed (e.g. 0001)
    const expenseNumber = 1001 + count;

    // Sanitize company name (remove spaces, special chars if needed)
    const safeCompanyName = company.name.trim().toLowerCase().replace(/\s+/g, "-");

    this.expenseId = `${safeCompanyName}-exp-${expenseNumber}`;
    next();
  } catch (err) {
    next(err);
  }
});