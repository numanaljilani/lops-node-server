import mongoose from 'mongoose';

const timesheetSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },

    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hours_logged: {
      type:Number,
      default : 0
    },
    total_amount: {
      type:Number,
      default : 0
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const Timesheet = mongoose.model('Timesheet', timesheetSchema);
export default Timesheet;
