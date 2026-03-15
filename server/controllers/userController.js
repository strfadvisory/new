const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { sendMemberInvitationEmail } = require('../services/emailService.jsx');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('roleId', 'name type')
      .select('-password')
      .sort({ createdAt: -1 });
    
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      company: user.companyProfile?.companyName || user.companyType || 'N/A',
      role: user.roleId?.name || user.role || 'No Role',
      status: user.status || 'Active',
      createdAt: user.createdAt
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate('roleId', 'name type')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, roleId, status, companyProfile } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (roleId) updateData.roleId = roleId;
    if (status) updateData.status = status;
    if (companyProfile) updateData.companyProfile = companyProfile;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('roleId', 'name type').select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      return res.status(404).json({ message: 'Admin role not found' });
    }

    const adminUsers = await User.find({ roleId: adminRole._id })
      .populate('roleId', 'name type')
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Return the full user objects instead of formatted ones
    res.json(adminUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    // Find users with role 'ADMIN' or roleId pointing to ADMIN role
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    
    let companies = [];
    
    if (adminRole) {
      // Get users by roleId (new structure)
      const usersByRoleId = await User.find({ roleId: adminRole._id })
        .populate('roleId', 'name type permissions')
        .populate('createdBy', 'firstName lastName email')
        .select('-password')
        .sort({ createdAt: -1 });
      
      companies = [...companies, ...usersByRoleId];
    }
    
    // Also get users with role field set to 'ADMIN' (legacy structure)
    const usersByRoleField = await User.find({ role: 'ADMIN' })
      .populate('roleId', 'name type permissions')
      .populate('createdBy', 'firstName lastName email')
      .select('-password')
      .sort({ createdAt: -1 });
    
    companies = [...companies, ...usersByRoleField];
    
    // Remove duplicates based on _id
    const uniqueCompanies = companies.filter((company, index, self) => 
      index === self.findIndex(c => c._id.toString() === company._id.toString())
    );
    
    res.json(uniqueCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: error.message });
  }
};

const createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create default company profile if it doesn't exist
    if (!user.companyProfile || !user.companyProfile.companyName) {
      const defaultCompanyProfile = {
        companyName: `${user.firstName} ${user.lastName} Company`,
        description: 'Default company profile',
        contactPerson: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || '',
        zipCode: user.address?.zipCode || '',
        state: user.address?.state || '',
        city: user.address?.city || '',
        address1: user.address?.address1 || '',
        address2: user.address?.address2 || ''
      };

      user.companyProfile = defaultCompanyProfile;
      await user.save();
    }

    res.json({ 
      message: 'Company profile created successfully', 
      companyProfile: user.companyProfile 
    });
  } catch (error) {
    console.error('Error creating company profile:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserCompanies = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with populated memberfor companies and roleId for subRoles lookup
    const user = await User.findById(userId)
      .populate({
        path: 'memberfor.company',
        select: 'companyProfile firstName lastName _id'
      })
      .populate('roleId', 'name subRoles')
      .select('memberfor companyProfile firstName lastName roleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all roles to lookup subRole names
    const allRoles = await Role.find({}, 'name subRoles').lean();
    
    // Helper function to find role name from any role's subRoles
    const findRoleNameById = (roleId) => {
      for (const role of allRoles) {
        if (role.subRoles && role.subRoles.length > 0) {
          const subRole = role.subRoles.find(sr => sr.id === roleId);
          if (subRole && subRole.role) {
            return subRole.role;
          }
        }
      }
      return null;
    };

    let companies = [];
    let currentCompanyId = null;
    
    // Get current company ID from memberfor[0] (first entry is current)
    if (user.memberfor && user.memberfor.length > 0) {
      currentCompanyId = user.memberfor[0].company?._id?.toString();
    }
    
    // Add user's own company if they have one (this should be memberfor[0] typically)
    if (user.companyProfile && user.companyProfile.companyName) {
      // Check if user's own company is in memberfor
      const ownCompanyInMemberFor = user.memberfor?.find(member => 
        member.company && member.company._id.toString() === user._id.toString()
      );
      
      if (ownCompanyInMemberFor) {
        // Get role name from all roles' subRoles
        let roleName = findRoleNameById(ownCompanyInMemberFor.role);
        if (!roleName) {
          roleName = 'Administrator'; // Default for own company
        }
        
        companies.push({
          _id: user._id,
          companyProfile: {
            ...user.companyProfile,
            logoId: user.companyProfile.logoId
          },
          firstName: user.firstName,
          lastName: user.lastName,
          isOwn: true,
          role: roleName,
          roleId: ownCompanyInMemberFor.role,
          isSelected: currentCompanyId === user._id.toString() // Mark as selected if it's current
        });
      }
    }
    
    // Add all companies from memberfor array
    if (user.memberfor && user.memberfor.length > 0) {
      const memberCompanies = user.memberfor
        .filter(member => {
          // Filter out invalid company references and avoid duplicating own company
          return member.company && 
                 member.company._id.toString() !== user._id.toString();
        })
        .map(member => {
          // Get role name from all roles' subRoles
          let roleName = findRoleNameById(member.role);
          if (!roleName) {
            roleName = 'User'; // Default for member companies
          }
          
          return {
            _id: member.company._id,
            companyProfile: {
              ...(member.company.companyProfile || {
                companyName: `${member.company.firstName} ${member.company.lastName}`,
                description: 'Personal Company'
              }),
              logoId: member.company.companyProfile?.logoId
            },
            firstName: member.company.firstName,
            lastName: member.company.lastName,
            isOwn: false,
            role: roleName,
            roleId: member.role,
            isSelected: currentCompanyId === member.company._id.toString() // Mark as selected if it's current
          };
        });
      
      companies = [...companies, ...memberCompanies];
    }
    
    // If no companies found, add user as their own company (fallback)
    if (companies.length === 0) {
      companies.push({
        _id: user._id,
        companyProfile: {
          ...(user.companyProfile || {
            companyName: `${user.firstName} ${user.lastName}`,
            description: 'Personal Company'
          }),
          logoId: user.companyProfile?.logoId
        },
        firstName: user.firstName,
        lastName: user.lastName,
        isOwn: true,
        role: 'Administrator',
        roleId: 'Administrator',
        isSelected: true // Only company, so it's selected
      });
    }
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching user companies:', error);
    res.status(500).json({ message: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate({
        path: 'reqorg.orgId',
        select: 'companyProfile firstName lastName'
      })
      .populate({
        path: 'reqorg.requestedBy',
        select: 'firstName lastName email'
      })
      .select('reqorg');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter only pending requests
    const pendingRequests = user.reqorg.filter(req => req.status === 'pending');
    
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: error.message });
  }
};

const handleOrgRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    console.log('Handling org request:', { userId, requestId, action });
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be accept or reject' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User reqorg array:', user.reqorg);
    
    // Find the request in reqorg array
    const requestIndex = user.reqorg.findIndex(req => req._id.toString() === requestId);
    if (requestIndex === -1) {
      console.log('Request not found in reqorg array');
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const request = user.reqorg[requestIndex];
    console.log('Found request:', request);
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }
    
    if (action === 'accept') {
      // Add to memberfor array with the role from the request
      const existingMember = user.memberfor.find(member => 
        member.company && member.company.toString() === request.orgId.toString()
      );
      
      if (!existingMember) {
        // Use the exact role from the request without modification
        const roleInfo = request.role;
        
        user.memberfor.push({
          company: request.orgId, // Company ID from the request
          role: roleInfo // Use the exact role ID from the request
        });
        console.log('Added to memberfor array with role:', roleInfo);
      } else {
        console.log('User already member of this company');
      }
    }
    
    // Remove from reqorg array
    user.reqorg.splice(requestIndex, 1);
    console.log('Removed from reqorg array');
    
    await user.save();
    console.log('User saved successfully');
    
    res.json({ 
      message: `Request ${action}ed successfully`,
      action: action
    });
  } catch (error) {
    console.error('Error handling organization request:', error);
    res.status(500).json({ message: error.message });
  }
};

const switchCompany = async (req, res) => {
  try {
    const userId = req.user._id;
    const { companyId } = req.body;
    
    // Verify user has access to this company and update memberfor order
    const user = await User.findById(userId)
      .populate({
        path: 'memberfor.company',
        select: 'companyProfile firstName lastName _id'
      })
      .populate('roleId', 'name type subRoles permissions');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let permissionLevel = 'ADMIN'; // Default for own company
    let isOwnCompany = false;
    let selectedMemberEntry = null;
    
    // Check if it's user's own company
    if (user._id.toString() === companyId) {
      isOwnCompany = true;
      permissionLevel = 'ADMIN';
      
      // Find user's own company in memberfor
      selectedMemberEntry = user.memberfor.find(member => 
        member.company && member.company._id.toString() === companyId
      );
    } else {
      // Check if user is a member of this company
      selectedMemberEntry = user.memberfor.find(member => 
        member.company && member.company._id.toString() === companyId
      );
      
      if (!selectedMemberEntry) {
        return res.status(403).json({ message: 'Access denied to this company' });
      }
      
      // Set permission level based on role
      if (user.roleId && user.roleId.subRoles && selectedMemberEntry.role) {
        const subRole = user.roleId.subRoles.find(sr => sr.id === selectedMemberEntry.role);
        if (subRole) {
          permissionLevel = subRole.permissionLevel || 'VIEWER';
        }
      }
    }
    
    // Reorder memberfor array to put selected company first
    if (selectedMemberEntry) {
      // Remove the selected entry from its current position
      user.memberfor = user.memberfor.filter(member => 
        !(member.company && member.company._id.toString() === companyId)
      );
      
      // Add it to the beginning
      user.memberfor.unshift(selectedMemberEntry);
      
      // Save the updated user
      await user.save();
      console.log(`Switched company order - ${companyId} is now first in memberfor array`);
    }
    
    // Get company information
    const company = await User.findById(companyId)
      .select('companyProfile firstName lastName')
      .lean();
    
    // Get role name for response
    let roleName = selectedMemberEntry?.role || 'User';
    if (user.roleId && user.roleId.subRoles && selectedMemberEntry?.role) {
      const subRole = user.roleId.subRoles.find(sr => sr.id === selectedMemberEntry.role);
      if (subRole) {
        roleName = subRole.role;
      }
    }
    
    res.json({ 
      message: 'Company switched successfully',
      currentCompany: companyId,
      permissionLevel,
      isOwnCompany,
      companyInfo: {
        name: company?.companyProfile?.companyName || `${company?.firstName} ${company?.lastName}`,
        _id: companyId
      },
      roleInfo: {
        roleName,
        roleId: selectedMemberEntry?.role
      }
    });
  } catch (error) {
    console.error('Error switching company:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user permission level for a company
const getUserPermissionLevel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { companyId } = req.params;
    
    const user = await User.findById(userId)
      .populate('roleId', 'name type subRoles permissions');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let permissionLevel = 'VIEWER'; // Default
    let isOwnCompany = false;
    
    // Check if it's user's own company
    if (user._id.toString() === companyId) {
      isOwnCompany = true;
      permissionLevel = 'ADMIN';
    } else {
      // Find permission level from reqorg
      const orgRequest = user.reqorg.find(req => 
        req.orgId.toString() === companyId && req.status === 'accepted'
      );
      
      if (orgRequest && orgRequest.role) {
        const role = await Role.findById(orgRequest.role);
        if (role && role.subRoles && role.subRoles.length > 0) {
          const subRole = role.subRoles.find(sr => sr.id === userId.toString());
          if (subRole && subRole.permissionLevel) {
            permissionLevel = subRole.permissionLevel;
          }
        }
      }
    }
    
    res.json({
      permissionLevel,
      isOwnCompany,
      companyId
    });
  } catch (error) {
    console.error('Error getting user permission level:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user member information for header display
const getUserMemberInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate('roleId', 'name type subRoles')
      .populate({
        path: 'memberfor.company',
        select: 'companyProfile firstName lastName _id'
      })
      .select('companyProfile firstName lastName role roleId memberfor');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all roles to lookup subRole names
    const allRoles = await Role.find({}, 'name subRoles').lean();
    
    // Helper function to find role name from any role's subRoles
    const findRoleNameById = (roleId) => {
      for (const role of allRoles) {
        if (role.subRoles && role.subRoles.length > 0) {
          const subRole = role.subRoles.find(sr => sr.id === roleId);
          if (subRole && subRole.role) {
            return subRole.role;
          }
        }
      }
      return null;
    };

    // Get company name from memberfor[0] (default selected company)
    let companyName = 'Company name';
    let userRole = 'User';
    let currentCompanyId = null;
    let roleId = null;
    
    // Check if user has memberfor entries
    if (user.memberfor && user.memberfor.length > 0) {
      const firstMember = user.memberfor[0];
      currentCompanyId = firstMember.company?._id;
      roleId = firstMember.role;
      
      // Get company name from the company's profile
      if (firstMember.company && firstMember.company.companyProfile) {
        companyName = firstMember.company.companyProfile.companyName;
      } else if (firstMember.company) {
        // Fallback to user's name if no company profile
        companyName = `${firstMember.company.firstName} ${firstMember.company.lastName}`;
      }
      
      // Get role name from roles table subRoles
      if (roleId) {
        const roleName = findRoleNameById(roleId);
        if (roleName) {
          userRole = roleName;
        } else {
          userRole = roleId; // Use the ID as fallback
        }
      }
    } else if (user.companyProfile && user.companyProfile.companyName) {
      // Fallback to user's own company if no memberfor entries
      companyName = user.companyProfile.companyName;
      currentCompanyId = user._id;
      
      // Get role from user's roleId
      if (user.roleId && user.roleId.name) {
        userRole = user.roleId.name;
      } else if (user.role) {
        userRole = user.role;
      }
    }
    
    res.json({
      companyName,
      userRole,
      currentCompanyId,
      roleId
    });
  } catch (error) {
    console.error('Error fetching user member info:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to add user to associations and reserve studies
const addUserToResources = async (userId, associationIds = [], reserveStudyIds = []) => {
  const Association = require('../models/Association');
  const ReserveStudy = require('../models/ReserveStudy');

  try {
    // Add user to associations
    if (associationIds && associationIds.length > 0) {
      await Association.updateMany(
        { _id: { $in: associationIds } },
        { $addToSet: { allowUser: userId } }
      );
      console.log(`Added user ${userId} to ${associationIds.length} associations`);
    }

    // Add user to reserve studies
    if (reserveStudyIds && reserveStudyIds.length > 0) {
      await ReserveStudy.updateMany(
        { _id: { $in: reserveStudyIds } },
        { $addToSet: { allowUser: userId } }
      );
      console.log(`Added user ${userId} to ${reserveStudyIds.length} reserve studies`);
    }
  } catch (error) {
    console.error('Error adding user to resources:', error);
    throw error;
  }
};

// Enhanced addMember with organization-specific role validation
const addMemberWithRoleValidation = async (req, res) => {
  try {
    const { firstName, lastName, email, selectedRole, designation, associationIds, reserveStudyIds, organizationId } = req.body;
    const loggedInUser = req.user;

    // Validation
    if (!firstName || !email || !selectedRole) {
      return res.status(400).json({ message: 'First name, email, and role are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Prevent self-invite
    if (email === loggedInUser.email) {
      return res.status(400).json({ message: 'Cannot invite yourself' });
    }

    // Get organization context (default to logged-in user's company)
    const targetOrganizationId = organizationId || loggedInUser._id;
    
    // Validate role exists in the target organization's role structure
    const organization = await User.findById(targetOrganizationId).populate('roleId');
    if (!organization || !organization.roleId || !organization.roleId.subRoles) {
      return res.status(400).json({ message: 'Invalid organization or role structure' });
    }
    
    const validRole = organization.roleId.subRoles.find(sr => sr.id === selectedRole);
    if (!validRole) {
      return res.status(400).json({ message: 'Invalid role for this organization' });
    }
    
    // Check if requesting user has permission to assign this role
    if (loggedInUser._id.toString() !== targetOrganizationId) {
      const memberEntry = loggedInUser.memberfor?.find(member => 
        member.company && member.company.toString() === targetOrganizationId
      );
      
      if (!memberEntry) {
        return res.status(403).json({ message: 'No permission to invite members to this organization' });
      }
      
      // Check permission level
      const userRole = organization.roleId.subRoles.find(sr => sr.id === memberEntry.role);
      if (userRole && userRole.permissionLevel !== 'ADMIN' && validRole.permissionLevel !== 'VIEWER') {
        return res.status(403).json({ message: 'Insufficient permissions to assign this role' });
      }
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Case A: Email does not exist - create new user
      const tempPassword = Math.random().toString(36).slice(-8);
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const verificationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        designation: designation || validRole.role,
        phone: '',
        password: tempPassword,
        status: 'pending',
        parentcompany: targetOrganizationId,
        memberfor: [{
          company: targetOrganizationId,
          role: selectedRole
        }],
        verificationToken,
        verificationTokenExpiry,
        isVerified: false,
        createdBy: loggedInUser._id
      });

      // Add user to associations and reserve studies
      await addUserToResources(newUser._id, associationIds, reserveStudyIds);

      const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-member/${verificationToken}`;
      
      try {
        await sendMemberInvitationEmail(
          email, 
          verificationLink, 
          `${firstName} ${lastName}`.trim(),
          organization.companyProfile?.companyName || `${organization.firstName} ${organization.lastName}`,
          `${loggedInUser.firstName} ${loggedInUser.lastName}`
        );
      } catch (emailError) {
        console.log('Email send failed. Link:', verificationLink);
      }

      res.status(201).json({ 
        message: 'Member invitation sent successfully', 
        userId: newUser._id,
        userExists: false,
        organizationId: targetOrganizationId,
        roleName: validRole.role
      });
    } else {
      // Case B: Email already exists - add organization request
      
      // Check if request already exists
      const existingRequest = existingUser.reqorg.find(
        req => req.orgId.toString() === targetOrganizationId.toString()
      );
      
      if (existingRequest) {
        return res.status(400).json({ 
          message: 'Organization request already exists',
          status: existingRequest.status
        });
      }

      existingUser.reqorg.push({
        orgId: targetOrganizationId,
        role: selectedRole,
        requestedBy: loggedInUser._id,
        status: 'pending'
      });

      await existingUser.save();

      // Add user to associations and reserve studies
      await addUserToResources(existingUser._id, associationIds, reserveStudyIds);

      res.json({ 
        message: 'User already exists. Organization request sent.',
        userExists: true,
        userId: existingUser._id,
        organizationId: targetOrganizationId,
        roleName: validRole.role
      });
    }
  } catch (error) {
    console.error('Add member error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getUserById,
  updateUser,
  getAdminUsers,
  getCompanies,
  createCompanyProfile,
  deleteAccount,
  getUserCompanies,
  getPendingRequests,
  handleOrgRequest,
  switchCompany,
  getUserPermissionLevel,
  getUserMemberInfo,
  addMemberWithRoleValidation
};