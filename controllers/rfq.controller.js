import RFQ from "../models/rfqModel.js";

// Create RFQ
export const createRFQ = async (req, res) => {
  try {
    const {
      project_type,
      scope_of_work,
      quotation_amount,
      status,
      remarks,
      client,
      company,
      approvedBy,
    } = req.body;

    const rfq = new RFQ({
      project_type,
      scope_of_work,
      quotation_amount,
      status,
      remarks,
      client,
      company: company || "6850144a18d7f8eeea750c20",
      approvedBy : req.user.userId,
    });

    await rfq.save();
    res.status(201).json({ message: "RFQ created", rfq });
  } catch (err) {
    console.error("Create RFQ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all RFQs with pagination
export const getAllRFQs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const companyId = req.query.companyId;
    const status = req.query.status;
    console.log(companyId, "companyId ");

    /*--------------------------------------------------------*
     | Build a dynamic filter                                 |
     *--------------------------------------------------------*/
    const filter = {};
    if (companyId) {
      filter.company = companyId;
    }

    if (status == "pending") {
      filter.projectId = null;
    } else if (status == "approved") {
      filter.projectId = { $ne: null };
    }else{
      
    }

    if (req.query.search) {
      // Escape RegExp meta-chars so a search like "A.*B" isn’t treated as regex
      const escaped = req.query?.search?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { rfqId: { $regex: escaped, $options: "i" } }, // i = case-insensitive
        { quotationNo: { $regex: escaped, $options: "i" } },
      ];
    }

    /*--------------------------------------------------------*
     | Query + pagination                                     |
     *--------------------------------------------------------*/
    const total = await RFQ.countDocuments(filter);

    const data = await RFQ.find(filter)
      .populate("client company approvedBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("Get RFQs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get one RFQ
export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id).populate(
      "client company approvedBy"
    );
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }
    res.status(200).json(rfq);
  } catch (err) {
    console.error("Get RFQ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update RFQ
export const updateRFQ = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rfq = await RFQ.findById(id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    const updatableFields = [
      "project_type",
      "scope_of_work",
      "quotation_amount",
      "status",
      "remarks",
      "client",
      "company",
      "approvedBy",
    ];

    updatableFields.forEach((field) => {
      if (updates[field] !== undefined) {
        rfq[field] = updates[field];
      }
    });

    await rfq.save();

    res.status(200).json({ message: "RFQ updated", rfq });
  } catch (err) {
    console.error("Update RFQ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete RFQ
export const deleteRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndDelete(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }
    res.status(200).json({ message: "RFQ deleted" });
  } catch (err) {
    console.error("Delete RFQ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
