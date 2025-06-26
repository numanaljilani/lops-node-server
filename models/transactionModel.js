import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['payment', 'expense'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
  },
  { timestamps: true }
);

const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);
export default TransactionHistory;
