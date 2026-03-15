const Role = require('../models/Role');
const User = require('../models/User');
const Library = require('../models/Library');
const masterDataService = require('../services/masterDataService');

const createRole = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const type = req.user.role === 'SUPER_ADMIN' || req.user.isSuperAdmin ? 'Master' : 'User';
    
    const role = new Role({
      name,
      description,
      icon: icon || 'user',
      type,
      status: true,
      permissions: [],
      nextSteps: [],
      videos: [],
      createdBy: req.user._id
    });
    
    const savedRole = await role.save();
    res.status(201).json(savedRole);
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    
    // Ensure all roles have empty arrays if undefined
    const rolesWithDefaults = roles.map(role => ({
      ...role.toObject(),
      permissions: role.permissions || [],
      nextSteps: role.nextSteps || [],
      videos: role.videos || []
    }));
    
    res.json(rolesWithDefaults);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, description, icon, status, permissions, nextSteps, videos } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    if (name) role.name = name;
    if (description) role.description = description;
    if (icon) role.icon = icon;
    if (status !== undefined) role.status = status;
    if (permissions) {
      // Handle both old format (array of strings) and new format (array of objects)
      role.permissions = permissions.map(perm => {
        if (typeof perm === 'string') {
          return { permissionId: perm, canEdit: true, limit: '' };
        }
        return {
          permissionId: perm.permissionId || perm.id,
          canEdit: perm.canEdit !== undefined ? perm.canEdit : true,
          limit: perm.limit || ''
        };
      });
    }
    if (nextSteps) role.nextSteps = nextSteps;
    if (videos) role.videos = videos;
    
    const savedRole = await role.save();
    res.json(savedRole);
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMasterRoles = async (req, res) => {
  try {
    const roles = await Role.find({ status: true, type: 'Master' })
      .select('name icon description');
    res.json(roles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isSuperAdmin) {
      return res.json({
        permissions: ['SUPER_ADMIN'],
        navigation: [{ level: 'Super Admin', path: '/dashboard/admin' }],
        menu: [{ level: 'Super Admin', path: '/dashboard/admin' }]
      });
    }

    // Handle users with roleId (new structure)
    if (user.roleId) {
      const role = user.roleId;
      const permissions = role?.permissions || [];
      
      // Pass the full permissions array to getUserNavigation
      const navigation = masterDataService.getUserNavigation(permissions);
      
      return res.json({ 
        permissions: permissions,
        navigation,
        menu: navigation
      });
    }

    // Handle users with legacy role field (USER, ADMIN, etc.)
    if (user.role === 'ADMIN') {
      // ADMIN users get all modules
      const allModules = masterDataService.masterData.modules.map(module => ({
        level: module.displayName,
        path: `/dashboard/${module.key.toLowerCase().replace('_', '-')}`
      }));
      
      return res.json({
        permissions: ['ADMIN'],
        navigation: allModules,
        menu: allModules
      });
    }

    // USER role gets default navigation (same as ADMIN for now)
    if (user.role === 'USER') {
      const defaultModules = masterDataService.masterData.modules.map(module => ({
        level: module.displayName,
        path: `/dashboard/${module.key.toLowerCase().replace('_', '-')}`
      }));
      
      return res.json({
        permissions: ['USER'],
        navigation: defaultModules,
        menu: defaultModules
      });
    }

    // Fallback for any other role
    return res.json({
      permissions: [],
      navigation: [],
      menu: []
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserNextSteps = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = user.roleId;
    const nextSteps = role?.nextSteps?.map(id => masterDataService.getNextStepById(id)).filter(Boolean) || [];

    res.json({ nextSteps });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const role = user.roleId;
    if (!role || !role.videos || role.videos.length === 0) {
      return res.json({ videos: [] });
    }

    // Fetch videos from Library collection using the IDs stored in role.videos
    const videos = await Library.find({ 
      _id: { $in: role.videos },
      isActive: true 
    });

    res.json({ videos });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserSubRoles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('roleId')
      .populate({
        path: 'memberfor.company',
        select: 'companyProfile firstName lastName _id'
      });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('User found:', user.email);
    console.log('User isSuperAdmin:', user.isSuperAdmin);
    console.log('User roleId:', user.roleId);
    
    // Get current company context from memberfor[0] (current selected company)
    let currentCompanyId = user._id; // Default to own company
    let currentCompanyRole = null;
    
    if (user.memberfor && user.memberfor.length > 0) {
      const currentMember = user.memberfor[0];
      if (currentMember.company) {
        currentCompanyId = currentMember.company._id;
        currentCompanyRole = currentMember.role;
      }
    }
    
    console.log('Current company context:', currentCompanyId);
    console.log('Current company role:', currentCompanyRole);
    
    // Get the role structure for the current company context
    const role = user.roleId;
    if (!role) {
      console.log('No role found for user');
      return res.json({ 
        subRoles: [], 
        debug: { 
          message: 'No role assigned to user',
          suggestion: 'User needs to be assigned a role with subRoles',
          currentCompanyId
        } 
      });
    }

    console.log('Role found:', role.name);
    console.log('Role subRoles:', role.subRoles);
    
    if (!role.subRoles || role.subRoles.length === 0) {
      console.log('No subRoles found in role');
      return res.json({ 
        subRoles: [], 
        debug: { 
          message: 'No subRoles found in user role', 
          roleName: role.name,
          roleType: role.type,
          suggestion: 'Contact administrator to configure subRoles for this role',
          currentCompanyId
        } 
      });
    }

    // Get subRoles from the user's specific role and resolve role names
    // Filter subRoles based on current company context and user permissions
    const availableSubRoles = role.subRoles.filter(subRole => {
      // For own company, show all subRoles
      if (currentCompanyId.toString() === user._id.toString()) {
        return true;
      }
      
      // For member companies, show subRoles based on user's permission level
      if (currentCompanyRole) {
        const userSubRole = role.subRoles.find(sr => sr.id === currentCompanyRole);
        if (userSubRole && userSubRole.permissionLevel === 'ADMIN') {
          return true; // Admins can invite with any subRole
        }
        // Editors and Viewers can only invite with VIEWER level roles
        return subRole.permissionLevel === 'VIEWER';
      }
      
      return subRole.permissionLevel === 'VIEWER'; // Default to viewer level
    });
    
    const subRoles = availableSubRoles.map(subRole => {
      // Try to resolve the role name from master data
      let roleName = subRole.role;
      
      // If the role field contains an ID, try to resolve it
      if (subRole.role && subRole.role.includes('_')) {
        // Load master data to resolve role names
        const masterData = masterDataService.masterData;
        if (masterData && masterData.roles) {
          // Search through all role categories
          Object.keys(masterData.roles).forEach(roleCategory => {
            const categoryRoles = masterData.roles[roleCategory].subRoles || [];
            const foundRole = categoryRoles.find(r => r.id === subRole.role);
            if (foundRole) {
              roleName = foundRole.role;
            }
          });
        }
      }
      
      return {
        _id: subRole.id,
        name: roleName,
        permissionLevel: subRole.permissionLevel,
        organizationId: currentCompanyId // Include organization context
      };
    });

    console.log('Mapped subRoles with resolved names:', subRoles);

    res.json({ 
      subRoles,
      debug: {
        message: 'SubRoles found from user specific role with organization context',
        roleName: role.name,
        roleType: role.type,
        subRolesCount: subRoles.length,
        currentCompanyId,
        currentCompanyRole,
        isOwnCompany: currentCompanyId.toString() === user._id.toString()
      }
    });
  } catch (error) {
    console.error('Error in getUserSubRoles:', error);
    res.status(400).json({ message: error.message, debug: { error: error.toString() } });
  }
};

const getRoleSubRoles = async (req, res) => {
  try {
    const { id: roleId } = req.params;
    const { organizationId } = req.query; // Optional organization context
    
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Get organization-specific subRoles if organizationId is provided
    let availableSubRoles = role.subRoles || [];
    
    if (organizationId) {
      // Get requesting user's permission level for this organization
      const requestingUser = await User.findById(req.user._id);
      const memberEntry = requestingUser.memberfor?.find(member => 
        member.company && member.company.toString() === organizationId
      );
      
      if (memberEntry) {
        const userSubRole = role.subRoles?.find(sr => sr.id === memberEntry.role);
        if (userSubRole && userSubRole.permissionLevel !== 'ADMIN') {
          // Non-admin users can only see VIEWER level roles
          availableSubRoles = role.subRoles.filter(sr => sr.permissionLevel === 'VIEWER');
        }
      }
    }

    const subRoles = availableSubRoles.map(subRole => ({
      _id: subRole.id,
      name: subRole.role,
      permissionLevel: subRole.permissionLevel,
      organizationId: organizationId || null
    }));

    res.json({ 
      subRoles,
      roleName: role.name,
      roleType: role.type,
      organizationId: organizationId || null
    });
  } catch (error) {
    console.error('Error in getRoleSubRoles:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get organization-specific roles for member invitation
const getOrganizationRoles = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const requestingUser = await User.findById(req.user._id).populate('roleId');
    
    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get organization details
    const organization = await User.findById(organizationId)
      .populate('roleId')
      .select('companyProfile firstName lastName roleId');
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Check if requesting user has permission to invite members to this organization
    const hasPermission = requestingUser._id.toString() === organizationId || 
      requestingUser.memberfor?.some(member => 
        member.company && member.company.toString() === organizationId
      );
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'No permission to invite members to this organization' });
    }
    
    // Get available roles based on organization's role structure
    const orgRole = organization.roleId;
    if (!orgRole || !orgRole.subRoles || orgRole.subRoles.length === 0) {
      return res.json({ 
        roles: [],
        organizationName: organization.companyProfile?.companyName || `${organization.firstName} ${organization.lastName}`,
        message: 'No roles available for this organization'
      });
    }
    
    // Filter roles based on requesting user's permission level
    let availableRoles = orgRole.subRoles;
    
    if (requestingUser._id.toString() !== organizationId) {
      // For non-owner users, check their permission level
      const memberEntry = requestingUser.memberfor?.find(member => 
        member.company && member.company.toString() === organizationId
      );
      
      if (memberEntry) {
        const userSubRole = orgRole.subRoles.find(sr => sr.id === memberEntry.role);
        if (userSubRole && userSubRole.permissionLevel !== 'ADMIN') {
          // Non-admin users can only invite VIEWER level roles
          availableRoles = orgRole.subRoles.filter(sr => sr.permissionLevel === 'VIEWER');
        }
      }
    }
    
    const roles = availableRoles.map(subRole => ({
      _id: subRole.id,
      name: subRole.role,
      permissionLevel: subRole.permissionLevel,
      description: `${subRole.role} - ${subRole.permissionLevel} level access`
    }));
    
    res.json({
      roles,
      organizationName: organization.companyProfile?.companyName || `${organization.firstName} ${organization.lastName}`,
      organizationId,
      roleStructure: orgRole.name
    });
  } catch (error) {
    console.error('Error in getOrganizationRoles:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createRole, 
  getAllRoles, 
  getRoleById, 
  updateRole, 
  deleteRole,
  getMasterRoles,
  getUserPermissions,
  getUserNextSteps,
  getUserVideos,
  getUserSubRoles,
  getRoleSubRoles,
  getOrganizationRoles
};