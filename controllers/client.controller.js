import Client from "../models/clientModel.js";

// Create
export const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json({ message: 'Client created successfully', client });
  } catch (error) {
    console.error('Create Client Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All with pagination
export const getAllClients = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = {};
    if(req.query.companyId){
      filter.companyId = req.query.companyId
    }

    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(escaped, 'i'); // Case-insensitive search

      filter.$or = [
        { client_name:    { $regex: regex } },
        { contact_person: { $regex: regex } },
        { contact_number: { $regex: regex } },
        { company_name:   { $regex: regex } },
      ];
    }

    const total = await Client.countDocuments(filter);

    const data = await Client.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error('Get Clients Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get single client
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Get Client Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const updatableFields = [
      'client_name',
      'contact_info',
      'contact_person',
      'contact_number',
      'aob',
      'company_name',
      'type',
      'status',
      'about'
    ];

    updatableFields.forEach(field => {
      if (updates[field] !== undefined) {
        client[field] = updates[field];
      }
    });

    await client.save();

    res.status(200).json({ message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Update Client Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
