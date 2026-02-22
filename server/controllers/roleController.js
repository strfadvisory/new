const Role = require('../models/Role');

const createRole = async (req, res) => {
  try {
    const { name, type, description, icon, status } = req.body;
    
    const role = await Role.create({
      name,
      type,
      description,
      icon,
      status,
      createdBy: req.user._id
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, icon, status } = req.body;
    
    const role = await Role.findByIdAndUpdate(
      id,
      { name, type, description, icon, status },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createRole, getAllRoles, updateRole, deleteRole };
