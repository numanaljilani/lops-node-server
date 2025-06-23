import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectPayment',
      required: true,
    },
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
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
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
