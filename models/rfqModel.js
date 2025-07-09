import mongoose from "mongoose";

const rfqSchema = new mongoose.Schema(
  {
    project_type: { type: String, required: true },
    scope_of_work: { type: String },
    quotation_amount: { type: String },
    status: { type: String, default: "pending" },
    remarks: { type: String },
    rfqId: { type: String, unique: true },
    // quotationNo: { type: String , default : '-', unique: false },
    // quotationNo: { type: String, default: "-", unique: false },

    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate rfqId
rfqSchema.pre("save", async function (next) {
  if (!this.rfqId) {
    // Step 1: Populate company name
    const Company = mongoose.model("Company");
    const company = await Company.findById(this.company).select("name");
    if (!company || !company.name) {
      return next(new Error("Company not found or has no name"));
    }

    const companyName = company.name.replace(/\s+/g, "").toUpperCase(); // Optional: sanitize name

    // Step 2: Date format
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const datePrefix = `${yyyy}${mm}`;

    // Step 3: Prefix like "ABC-QN-202507"
    const rfqPrefix = `${companyName}-QN-${datePrefix}`;

    // Step 4: Find last RFQ with this prefix
    const lastRFQ = await mongoose
      .model("RFQ")
      .findOne({
        rfqId: { $regex: `^${rfqPrefix}` },
        company: company._id,
      })
      .sort({ createdAt: -1 });

    let rfqSeq = 1001; // Starting from 1001
    if (lastRFQ && lastRFQ.rfqId) {
      const lastSeq = parseInt(lastRFQ.rfqId.slice(-4)); // Get last 4 digits
      if (!isNaN(lastSeq)) {
        rfqSeq = lastSeq + 1;
      }
    }

    // Step 5: Set rfqId
    this.rfqId = `${rfqPrefix}${rfqSeq}`;
  }

  next();
});

const RFQ = mongoose.model("RFQ", rfqSchema);
export default RFQ;
