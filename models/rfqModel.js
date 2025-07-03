import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema(
  {
    project_type: { type: String, required: true },
    scope_of_work: { type: String },
    quotation_amount: { type: String },
    status: { type: String, default: 'pending' },
    remarks: { type: String },
    rfqId: { type: String, unique: true },
    quotationNo: { type: String, unique: true },
    
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate rfqId and quotationNo
rfqSchema.pre('save', async function (next) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  // Generate rfqId
  if (!this.rfqId) {
    const rfqPrefix = `LETS-${yy}${mm}`;
    const lastRFQ = await mongoose.model('RFQ').findOne({
      rfqId: { $regex: `^${rfqPrefix}` }
    }).sort({ createdAt: -1 });

    let rfqSeq = 1;
    if (lastRFQ && lastRFQ.rfqId) {
      const lastSeq = parseInt(lastRFQ.rfqId.slice(-3));
      rfqSeq = lastSeq + 1;
    }

    const rfqSeqStr = String(rfqSeq).padStart(3, '0');
    this.rfqId = `${rfqPrefix}${rfqSeqStr}`;
  }

  // Generate quotationNo
  if (!this.quotationNo) {
    const qnPrefix = `LETS-QN-${yy}${mm}`;
    const lastQN = await mongoose.model('RFQ').findOne({
      quotationNo: { $regex: `^${qnPrefix}` }
    }).sort({ createdAt: -1 });

    let qnSeq = 1;
    if (lastQN && lastQN.quotationNo) {
      const lastQNSeq = parseInt(lastQN.quotationNo.slice(-3));
      qnSeq = lastQNSeq + 1;
    }

    const qnSeqStr = String(qnSeq).padStart(3, '0');
    this.quotationNo = `${qnPrefix}${qnSeqStr}`;
  }

  next();
});

const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;
