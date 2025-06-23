import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    about: { type: String },
    location: { type: String },
    type: { type: String },     // e.g., startup, enterprise, NGO, etc.
    status: { type: String },   // e.g., active, inactive
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);
export default Company;
