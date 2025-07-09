import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    client_name: { type: String, required: true, trim: true },
    contact_info: { type: String },
    contact_person: { type: String },
    contact_number: { type: String },
    aob: { type: String }, // area of business
    company_name: { type: String },
    type: { type: String }, // e.g., vendor, customer, partner
    status: { type: Boolean, default: true },
    about: { type: String },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  {
    timestamps: true
  }
);

const Client = mongoose.model('Client', clientSchema);
export default Client;
