import mongoose from 'mongoose';

const projectPaymentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    projectPercentage: {
      type: Number,
      required: true,
      default : 0
    },
    completionPercentage: {
      type: Number,
      required: true,
      default : 0
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    },
    verification_status: {
      type: String,
      enum: ['unverified', 'invoiced', 'paid'],
      default: 'unverified'
    },
    invoice_number: {
      type: String,
      default: null
    },
    notes: {
      type: String
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  { timestamps: true }
);

const ProjectPayment = mongoose.model('ProjectPayment', projectPaymentSchema);
export default ProjectPayment;
