import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectPayment',
      required: true,
    },
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    task_brief: {
      type: String,
      required: true,
    },
    weightage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    due_date: {
      type: Date,
      required: true,
    },
    assigne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
      // companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    remarks: {
      type: String,
    },
    completion_percentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
