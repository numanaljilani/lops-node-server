import Company from "../models/companyModel.js";

// Create
export const createCompany = async (req, res) => {
  try {
    const { name, about, location, type, status } = req.body;
    const company = new Company({ name, about, location, type, status });
    await company.save();
    res.status(201).json({ message: 'Company created', company });
  } catch (err) {
    console.error('Create Company Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All with pagination
export const getAllCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Company.countDocuments();
    const data = await Company.find().skip(skip).limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error('Get All Companies Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// company details
export const companyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id , "companyDetails")
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company found', company });
  } catch (err) {
    console.error('Company details Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Update
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Company.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company updated', company: updated });
  } catch (err) {
    console.error('Update Company Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Company.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company deleted' });
  } catch (err) {
    console.error('Delete Company Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
