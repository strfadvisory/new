# Role Permissions Update - Implementation Summary

## Overview
Updated the role management system to use a flat permission structure with default permissions set to `false` for all permission keys when creating a new role.

## Permission Structure Format
```json
{
  "SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR": false,
  "SIMULATOR_MANAGEMENT.UPLOAD_MODEL": false,
  "SIMULATOR_MANAGEMENT.CREATE_VERSION": false,
  "INVITATION_ONBOARDING.INVITE_MEMBERS": false,
  "COMPANY_CONTROL.CREATE_COMPANY": false,
  "ASSOCIATION_CONTROL.CREATE_SINGLE_ASSOCIATION": false,
  "USER_ROLE_MANAGEMENT.ADD_MEMBER_ROLE": false,
  "BANKING_SERVICES.MANAGE_CD_PLANS": false,
  ...
}
```

## Backend Changes

### 1. Updated `server/controllers/roleController.js`
- **Modified `initializeDefaultPermissions()`**: Changed from nested structure to flat structure using `MODULE.PERMISSION_CODE` format
- **Added `getDefaultPermissions()`**: New endpoint to provide default permissions structure to frontend
- **Exported new function**: Added `getDefaultPermissions` to module exports

### 2. Updated `server/routes/roleRoutes.js`
- **Added new route**: `GET /api/roles/default-permissions` - Returns default permission structure with all values set to false

## Frontend Changes

### 1. Updated `client/src/pages/superadmin/RoleManager.tsx`
- **Modified permission loading**: Updated `useEffect` to work with flat permission structure
- **Updated `handleEdit()`**: Changed to save permissions in flat format (`MODULE.PERMISSION_CODE: boolean`)

### 2. Updated `client/src/SuperAdminLayout.tsx`
- **Modified `handleAddNew()`**: Now fetches default permissions from backend API before opening the create form
- **Type safety**: Added proper TypeScript typing for permissions object

## API Endpoints

### Get Default Permissions
```
GET /api/roles/default-permissions
Authorization: Bearer <token>
Response: { "MODULE.PERMISSION": false, ... }
```

### Create Role
```
POST /api/roles
Authorization: Bearer <token>
Body: {
  "name": "Role Name",
  "type": "Primary|Secondary|Members",
  "description": "Role description",
  "icon": "base64_string",
  "status": true,
  "permissions": { "MODULE.PERMISSION": false, ... }
}
```

### Update Role
```
PUT /api/roles/:id
Authorization: Bearer <token>
Body: Same as Create Role
```

## How It Works

1. **Creating a New Role**:
   - User clicks "Add New" button
   - Frontend fetches default permissions from `/api/roles/default-permissions`
   - All permissions are initialized to `false`
   - User fills in role details and saves
   - Backend creates role with default permissions

2. **Editing a Role**:
   - User selects a role and clicks "Edit"
   - Frontend loads existing permissions in flat format
   - User can toggle individual permissions
   - On save, permissions are sent in flat format to backend

3. **Permission Structure**:
   - Format: `"MODULE_NAME.PERMISSION_CODE": boolean`
   - Example: `"SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR": true`
   - All permissions default to `false` for new roles

## Testing

To test the implementation:

1. Start the backend server: `cd server && npm start`
2. Start the frontend: `cd client && npm start`
3. Login as Super Admin (admin@reservefundadvisory.com / Admin@123)
4. Navigate to Role Manager
5. Click "Add New" - verify default permissions are loaded
6. Create a new role and verify it saves with all permissions set to false
7. Edit the role and toggle some permissions
8. Save and verify permissions are persisted correctly

## Database Schema

The Role model stores permissions as:
```javascript
permissions: { 
  type: Object, 
  default: {} 
}
```

Example stored document:
```json
{
  "_id": "...",
  "name": "Custom Role",
  "type": "Primary",
  "description": "Custom role description",
  "permissions": {
    "SIMULATOR_MANAGEMENT.ACCESS_SIMULATOR": false,
    "SIMULATOR_MANAGEMENT.UPLOAD_MODEL": false,
    ...
  }
}
```
