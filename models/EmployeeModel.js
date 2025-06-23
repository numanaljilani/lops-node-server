import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    contact: { type: String, required: true, trim: true },
    costPerHour: { type: Number, trim: true },
    description: { type: String },
    location: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId , ref : "Company" },
    position: { type: String },
    salary: { type: String },
    currency: { type: String , default :'AED' },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
