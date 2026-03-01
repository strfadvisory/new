const mongoose = require('mongoose');
const Role = require('../models/Role');
const PermissionInheritanceService = require('../services/permissionInheritanceService');

describe('Permission Inheritance System', () => {
  let parentRole, childRole, grandChildRole;

  beforeEach(async () => {
    // Create test roles
    parentRole = new Role({
      name: 'Parent Role',
      type: 'Primary',
      description: 'Test parent role',
      ownPermissions: {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': true,
        'ROLE_MANAGEMENT.CREATE_ROLE': true,
        'USER_MANAGEMENT.ADD_MEMBER_ROLE': true
      },
      level: 0
    });
    await parentRole.save();

    childRole = new Role({
      name: 'Child Role',
      type: 'Secondary',
      description: 'Test child role',
      parentRoleId: parentRole._id,
      level: 1,
      hierarchyPath: [parentRole._id],
      ownPermissions: {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': true,
        'USER_MANAGEMENT.ADD_MEMBER_ROLE': false
      }
    });
    await childRole.save();

    grandChildRole = new Role({
      name: 'GrandChild Role',
      type: 'Members',
      description: 'Test grandchild role',
      parentRoleId: childRole._id,
      level: 2,
      hierarchyPath: [parentRole._id, childRole._id],
      ownPermissions: {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': false
      }
    });
    await grandChildRole.save();
  });

  afterEach(async () => {
    await Role.deleteMany({});
  });

  describe('Permission Inheritance Calculation', () => {
    test('should calculate inherited permissions from parent', async () => {
      const inherited = await PermissionInheritanceService.calculateInheritedPermissions(childRole._id);
      
      expect(inherited['SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR']).toBe(true);
      expect(inherited['ROLE_MANAGEMENT.CREATE_ROLE']).toBe(true);
      expect(inherited['USER_MANAGEMENT.ADD_MEMBER_ROLE']).toBe(true);
    });

    test('should prevent child from having permissions parent lacks', async () => {
      const invalidPermissions = {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': true,
        'BANKING_SERVICES.MANAGE_CD_PLANS': true // Parent doesn't have this
      };

      await expect(
        PermissionInheritanceService.updateRolePermissions(childRole._id, invalidPermissions)
      ).rejects.toThrow('Permission BANKING_SERVICES.MANAGE_CD_PLANS not available from parent role');
    });
  });

  describe('Cascading Updates', () => {
    test('should cascade permission removal to children', async () => {
      // Remove permission from parent
      const updatedParentPermissions = {
        'ROLE_MANAGEMENT.CREATE_ROLE': true,
        'USER_MANAGEMENT.ADD_MEMBER_ROLE': true
        // Removed SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR
      };

      await PermissionInheritanceService.updateRolePermissions(parentRole._id, updatedParentPermissions);

      // Check child role was updated
      const updatedChild = await Role.findById(childRole._id);
      expect(updatedChild.ownPermissions['SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR']).toBe(false);

      // Check grandchild role was updated
      const updatedGrandChild = await Role.findById(grandChildRole._id);
      expect(updatedGrandChild.ownPermissions['SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR']).toBe(false);
    });

    test('should maintain valid permissions during cascade', async () => {
      const updatedPermissions = {
        'ROLE_MANAGEMENT.CREATE_ROLE': true,
        'USER_MANAGEMENT.ADD_MEMBER_ROLE': true,
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': true
      };

      await PermissionInheritanceService.updateRolePermissions(parentRole._id, updatedPermissions);

      const updatedChild = await Role.findById(childRole._id);
      expect(updatedChild.effectivePermissions['ROLE_MANAGEMENT.CREATE_ROLE']).toBe(true);
    });
  });

  describe('Hierarchy Management', () => {
    test('should setup role hierarchy correctly', async () => {
      const newChildRole = new Role({
        name: 'New Child',
        type: 'Secondary',
        description: 'New child role',
        ownPermissions: {}
      });
      await newChildRole.save();

      await PermissionInheritanceService.setupRoleHierarchy(newChildRole._id, parentRole._id);

      const updatedChild = await Role.findById(newChildRole._id);
      expect(updatedChild.parentRoleId.toString()).toBe(parentRole._id.toString());
      expect(updatedChild.level).toBe(1);
      expect(updatedChild.hierarchyPath).toContain(parentRole._id);
    });

    test('should handle role removal from hierarchy', async () => {
      await PermissionInheritanceService.removeFromHierarchy(childRole._id);

      const updatedChild = await Role.findById(childRole._id);
      expect(updatedChild.parentRoleId).toBeUndefined();
      expect(updatedChild.level).toBe(0);
      expect(updatedChild.hierarchyPath).toEqual([]);

      // Grandchild should move up one level
      const updatedGrandChild = await Role.findById(grandChildRole._id);
      expect(updatedGrandChild.parentRoleId.toString()).toBe(parentRole._id.toString());
      expect(updatedGrandChild.level).toBe(1);
    });
  });

  describe('Effective Permissions Virtual', () => {
    test('should combine inherited and own permissions correctly', async () => {
      const child = await Role.findById(childRole._id);
      child.inheritedPermissions = {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': true,
        'ROLE_MANAGEMENT.CREATE_ROLE': true
      };
      child.ownPermissions = {
        'SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR': true,
        'USER_MANAGEMENT.ADD_MEMBER_ROLE': true
      };

      const effective = child.effectivePermissions;
      expect(effective['SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR']).toBe(true);
      expect(effective['ROLE_MANAGEMENT.CREATE_ROLE']).toBe(true);
      expect(effective['USER_MANAGEMENT.ADD_MEMBER_ROLE']).toBe(true);
    });
  });
});

module.exports = {
  testPermissionInheritance: () => {
    console.log('Running permission inheritance tests...');
    // This would integrate with your test runner
  }
};