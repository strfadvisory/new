const Association = require('../models/Association');

const getAllAssociations = async (req, res) => {
  try {
    const associations = await Association.find()
      .sort({ createdAt: -1 });
    
    res.json(associations);
  } catch (error) {
    console.error('Error fetching associations:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAssociationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const association = await Association.findById(id);
    
    if (!association) {
      return res.status(404).json({ message: 'Association not found' });
    }
    
    res.json(association);
  } catch (error) {
    console.error('Error fetching association:', error);
    res.status(500).json({ message: error.message });
  }
};

const createAssociation = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      icon, 
      status, 
      permissions, 
      address, 
      contactPerson, 
      phone, 
      email, 
      linkedinUrl, 
      websiteUrl 
    } = req.body;
    
    const association = new Association({
      name,
      description,
      icon,
      status: status !== undefined ? status : true,
      permissions: permissions || [],
      address: address || {},
      contactPerson,
      phone,
      email,
      linkedinUrl,
      websiteUrl
    });
    
    await association.save();
    
    res.status(201).json({ 
      message: 'Association created successfully', 
      association 
    });
  } catch (error) {
    console.error('Error creating association:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      icon, 
      status, 
      permissions, 
      address, 
      contactPerson, 
      phone, 
      email, 
      linkedinUrl, 
      websiteUrl 
    } = req.body;
    
    const association = await Association.findByIdAndUpdate(
      id,
      { 
        name, 
        description, 
        icon, 
        status, 
        permissions, 
        address, 
        contactPerson, 
        phone, 
        email, 
        linkedinUrl, 
        websiteUrl 
      },
      { new: true }
    );
    
    if (!association) {
      return res.status(404).json({ message: 'Association not found' });
    }
    
    res.json({ 
      message: 'Association updated successfully', 
      association 
    });
  } catch (error) {
    console.error('Error updating association:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const association = await Association.findByIdAndDelete(id);
    
    if (!association) {
      return res.status(404).json({ message: 'Association not found' });
    }
    
    res.json({ message: 'Association deleted successfully' });
  } catch (error) {
    console.error('Error deleting association:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAssociations,
  getAssociationById,
  createAssociation,
  updateAssociation,
  deleteAssociation
};