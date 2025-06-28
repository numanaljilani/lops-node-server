import mongoose from 'mongoose';

// Function to generate invoice number (INV-YYYYMMDD-XXXX)
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `INV-${year}${month}${day}-${randomNum}`;
};

const projectPaymentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
 
    },
    amount: {
      type: Number,
   
      min: [0, 'Amount must be positive'],
    },
    vat_percentage: {
      type: Number,
     
      min: [0, 'VAT percentage cannot be negative'],
      default: 5,
    },
    vat_amount: {
      type: Number,
      
      min: [0, 'VAT amount cannot be negative'],
      default: 0,
    },
    charity_percentage: {
      type: Number,
  
      min: [0, 'Charity percentage cannot be negative'],
      default: 2.5,
    },
    charity_amount: {
      type: Number,
 
      min: [0, 'Charity amount cannot be negative'],
      default: 0,
    },
    total_amount: {
      type: Number,
    
      min: [0, 'Total amount must be positive'],
      default: 0,
    },
    amount_after_charity: {
      type: Number,
   
      min: [0, 'Amount after charity cannot be negative'],
      default: 0,
    },
    payment_mode: {
      type: String,
      enum: ['Cash', 'Credit', 'Cheque', 'Bank Transfer'],
   
      default: 'Cash',
    },
    payment_date: {
      type: Date,
      default: null,
    },
    paid_amount: {
      type: Number,
      min: [0, 'Paid amount cannot be negative'],
      default: 0,
    },
    balance_amount: {
      type: Number,
      min: [0, 'Balance amount cannot be negative'],
      default: 0,
    },
    due_date: {
      type: Date,
      default: null,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    projectPercentage: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Project percentage cannot be negative'],
    },
    completionPercentage: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot be greater then 100'],
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Completed' , "In Progress"],
      default: 'Pending',
    },
    verification_status: {
      type: String,
      enum: ['unverified', 'invoiced', 'paid'],
      default: 'unverified',
    },
    invoice_number: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save middleware for calculations and invoice number generation
projectPaymentSchema.pre('save', async function (next) {
  // Perform calculations
  this.vat_amount = parseFloat(((this.amount * this.vat_percentage) / 100).toFixed(2));
  this.charity_amount = parseFloat(((this.amount * this.charity_percentage) / 100).toFixed(2));
  this.total_amount = parseFloat((this.amount + this.vat_amount).toFixed(2));
  this.amount_after_charity = parseFloat((this.amount - this.charity_amount).toFixed(2));
  this.balance_amount = parseFloat((this.total_amount - this.paid_amount).toFixed(2));

  // Generate invoice number if verification_status is changed to 'invoiced'
  if (this.isModified('verification_status') && this.verification_status === 'invoiced' && !this.invoice_number) {
    let invoiceExists = true;
    let newInvoiceNumber;

    // Ensure unique invoice number
    while (invoiceExists) {
      newInvoiceNumber = generateInvoiceNumber();
      invoiceExists = await mongoose.model('ProjectPayment').exists({ invoice_number: newInvoiceNumber });
    }

    this.invoice_number = newInvoiceNumber;
  }

  next();
});

const ProjectPayment = mongoose.model('ProjectPayment', projectPaymentSchema);
export default ProjectPayment;