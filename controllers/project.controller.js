import Project from "../models/projectModel.js";
import RFQ from "../models/rfqModel.js";

// Create Project
export const createProject = async (req, res) => {
  console.log(req.body)
  try {
    const rfq = await  RFQ.findById(req.body.rfq);
    console.log(rfq ,"RFQ")

    const project = new Project({...req.body , companyId : rfq?.company , company : rfq?.company});
    await project.save();
    res.status(201).json({ message: "Project created", project });
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all projects with pagination
export const getAllProjects = async (req, res) => {
  try {
    /*-------------------------------------------------
     * Pagination basics
     *------------------------------------------------*/
    const page  = +req.query.page  || 1;
    const limit = +req.query.limit || 10;
    const skip  = (page - 1) * limit;

    /*-------------------------------------------------
     * Build search filter
     *------------------------------------------------*/
    const filter = {};
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(escaped, 'i');           // case-insensitive

      /* 1️⃣  Find RFQs whose rfqId OR quotationNo matches */
      const rfqIds  = await RFQ.find(
        { $or: [{ rfqId: regex }, { quotationNo: regex }] },
        { _id: 1 }
      ).lean();

      /* 2️⃣  Build project filter:
             projectId matches  OR  rfq is in the matching RFQs          */
      filter.$or = [
        { projectId: regex },
        { rfq: { $in: rfqIds.map(r => r._id) } }
      ];
    }

    /*-------------------------------------------------
     * Query with filter + pagination
     *------------------------------------------------*/
    const total = await Project.countDocuments(filter);

    const data  = await Project.find(filter)
      .populate([
        {
          path: 'rfq',
          populate: {
            path: 'client',
            select: 'client_name contact_info'
          }
        },
        { path: 'company'   },
        { path: 'approvedBy'}
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data
    });
  } catch (err) {
    console.error('Fetch Projects Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "rfq company approvedBy"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (err) {
    console.error("Get Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update project (only fields sent in req.body)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        project[key] = value;
      }
    });

    await project.save();
    res.status(200).json({ message: "Project updated", project });
  } catch (err) {
    console.error("Update Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
