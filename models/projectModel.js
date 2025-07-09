import mongoose from 'mongoose';
import moment from 'moment';
import Company from './companyModel.js';

const paymentTermSchema = new mongoose.Schema({
  description: { type: String, required: true },
  milestone: { type: String, required: true },
  percentage: { type: Number, required: true },
}, { _id: false });

const projectSchema = new mongoose.Schema(
  {
    projectId: { type: String, unique: true },
    project_name: { type: String },
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    completion_percentage : {type : Number , default : 0},
    project_expense : {type : Number , default : 0},
    profit : {type : Number , default : 0},
    total_expenses : {type : Number , default : 0},
    employee_cost : {type : Number , default : 0},
    totalHours : {type : Number , default : 0},
    final_amount: { type: String, required: true },
    delivery_timelines: { type: String },
    scope_of_work: { type: String },
    lpo_number: { type: String },
    status: { type: String, default: 'Pending' },
    payment_terms: { type: Map, of: paymentTermSchema }
  },
  { timestamps: true }
);

// Generate projectId before save
projectSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  // 1. Get Company Name
  const company = await Company.findById(this.company || this.companyId).select('name');
  if (!company || !company.name) {
    return next(new Error('Company not found or has no name'));
  }

  const companyName = company.name.replace(/\s+/g, '').toUpperCase(); // Sanitize company name

  // 2. Date formatting
  const datePrefix = moment().format('YYYYMM'); // yyyymm

  // 3. Prefix structure: CompanyName-JN-yyyymm
  const prefix = `${companyName}-JN-${datePrefix}`;

  // 4. Find the last projectId that matches this prefix
  const lastProject = await mongoose.model('Project').findOne({
    projectId: { $regex: `^${prefix}` },
    companyId : company._id

  }).sort({ createdAt: -1 });

  let sequence = 1001; // Starting number
  if (lastProject && lastProject.projectId) {
    const lastSeq = parseInt(lastProject.projectId.slice(-4)); // Get last 4 digits
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const projectId = `${prefix}${sequence}`;
  this.projectId = projectId;

  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
