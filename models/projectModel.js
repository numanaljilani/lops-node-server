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

  const year = moment().format('YYYY');
  const month = moment().format('MM');
  let sequence = 1;
  let unique = false;
  let generatedId;

  while (!unique) {
    const padded = String(sequence).padStart(3, '0');
    generatedId = `JN-${year}-${month}-${padded}`;

    const existing = await mongoose.model('Project').findOne({ projectId: generatedId });
    if (!existing) {
      unique = true;
    } else {
      sequence++;
    }
  }

  this.projectId = generatedId;
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
