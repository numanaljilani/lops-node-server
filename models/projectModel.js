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
  if (this.isNew) {
    const year = moment().format('YYYY');
    const month = moment().format('MM');

    const count = await Project.countDocuments({
      company: this.company,
      createdAt: {
        $gte: moment().startOf('month').toDate(),
        $lte: moment().endOf('month').toDate()
      }
    });

    const sequence = String(count + 1).padStart(3, '0');
    // this.projectId = `${companyName}-${year}-${month}-${sequence}`;
    this.projectId = `${"JN"}-${year}-${month}-${sequence}`;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
