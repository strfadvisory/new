# Permission System Update

## Overview
Updated the permission system to include only 4 required modules with enhanced permission controls including canEdit options and limit fields.

## Changes Made

### 1. Master Data Structure (server/master.json)
- Reduced from 7 modules to 4 required modules:
  - Simulator Management
  - Role Management  
  - User Management
  - Association Control
- Added `canEdit` and `limit` fields to each module and permission
- Updated permission IDs to maintain consistency

### 2. Database Schema (server/models/Role.js)
- Updated Role model to support new permission structure:
  ```javascript
  permissions: [{ 
    permissionId: { type: String },
    canEdit: { type: Boolean, default: true },
    limit: { type: String, default: '' }
  }]
  ```

### 3. Backend Controllers (server/controllers/roleController.js)
- Updated `updateRole` function to handle both old and new permission formats
- Updated `getUserPermissions` to extract permission IDs from new structure
- Backward compatibility maintained for existing data

### 4. Services (server/services/masterDataService.js)
- Updated navigation and permission filtering functions
- Added support for both old (string array) and new (object array) formats
- Maintained backward compatibility

### 5. Frontend Components
#### RoleManager.tsx
- Updated Role interface to support new permission structure
- Added helper functions for permission management:
  - `isPermissionSelected()`
  - `getPermissionSettings()`
  - `updatePermission()`
  - `togglePermission()`
- Enhanced UI to show canEdit toggles and limit textboxes for selected permissions
- Filtered to show only the 4 required modules

#### DashboardRoleManager.tsx
- Updated formData state to handle new permission structure
- Maintained compatibility with existing role management flows

### 6. Styling (client/src/pages/superadmin/RoleManager.css)
- Added styles for permission settings UI
- Enhanced visual hierarchy for permission controls
- Responsive design for mobile devices

### 7. Migration (server/migrations/updatePermissionStructure.js)
- Created migration script to convert existing roles from old to new format
- Maintains data integrity during transition
- Added npm script: `npm run migrate:permissions`

## Usage

### Running the Migration
```bash
cd server
npm run migrate:permissions
```

### New Permission Structure
Each permission now includes:
- `permissionId`: The permission identifier
- `canEdit`: Boolean flag for edit permissions
- `limit`: Text field for setting limits/constraints

### UI Features
- Toggle permissions on/off
- Set canEdit permissions for each enabled permission
- Add custom limits/constraints via text input
- Collapsible module sections
- Real-time change tracking

## Backward Compatibility
The system maintains backward compatibility with existing roles that use the old string array format. The migration script and service layer handle both formats seamlessly.

## Required Modules
1. **Simulator Management** - Access and manage simulation tools
2. **Role Management** - Create and manage user roles
3. **User Management** - Manage system users and members
4. **Association Control** - Manage associations and related entities

## API Changes
- Role update endpoints now accept both old and new permission formats
- Permission retrieval maintains existing API structure
- No breaking changes to existing integrations