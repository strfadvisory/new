# MemberFor System Fix - Complete Implementation

## Overview
Fixed the signup and member update flow to properly save company ID, role ID, and role information in the `memberfor` array structure.

## Key Issues Fixed

### 1. **Signup Flow (authController.js - register function)**
- **Problem**: `memberfor` was using `selectedRole._id` as company instead of user's own ID
- **Fix**: After user creation, add self to `memberfor` with proper structure:
  ```javascript
  user.memberfor.push({
    company: user._id, // User's own company ID
    role: administratorRoleId // Proper role ID like "BO_004" from subRoles
  });
  ```

### 2. **Role ID Resolution**
- **Problem**: Role IDs were not properly resolved from Role table's `subRoles` array
- **Fix**: Search in Role table's `subRoles` array for matching IDs like "BO_004":
  ```javascript
  const adminSubRole = selectedRole.subRoles.find(subRole => 
    subRole.role && subRole.role.toLowerCase().includes('administrator')
  );
  if (adminSubRole) {
    administratorRoleId = adminSubRole.id; // Use ID like "BO_004"
  }
  ```

### 3. **Company Name Resolution (getUserMemberInfo)**
- **Problem**: Company name was not properly fetched from `memberfor[0].company`
- **Fix**: Get company name from User table's `companyProfile.companyName`:
  ```javascript
  // Get company name from memberfor[0] (default selected company)
  if (user.memberfor && user.memberfor.length > 0) {
    const firstMember = user.memberfor[0];
    if (firstMember.company && firstMember.company.companyProfile) {
      companyName = firstMember.company.companyProfile.companyName;
    }
  }
  ```

### 4. **Role Name Resolution**
- **Problem**: Role names were not properly resolved from subRoles
- **Fix**: Search in Role table's `subRoles` array to get role name:
  ```javascript
  if (user.roleId && user.roleId.subRoles && roleId) {
    const subRole = user.roleId.subRoles.find(sr => sr.id === roleId);
    if (subRole) {
      userRole = subRole.role; // Get role name like "Administrator"
    }
  }
  ```

### 5. **Change Company Modal Data Population**
- **Problem**: Modal was not populated with data from user's `memberfor` array
- **Fix**: Updated `getUserCompanies` to return companies from `memberfor` with role information:
  ```javascript
  const memberCompanies = user.memberfor
    .filter(member => member.company)
    .map(member => {
      // Get role name from subRoles
      let roleName = member.role;
      if (user.roleId && user.roleId.subRoles && member.role) {
        const subRole = user.roleId.subRoles.find(sr => sr.id === member.role);
        if (subRole) {
          roleName = subRole.role;
        }
      }
      return {
        _id: member.company._id,
        companyProfile: member.company.companyProfile,
        role: roleName,
        roleId: member.role
      };
    });
  ```

### 6. **Member Request Handling**
- **Problem**: When accepting organization requests, proper role IDs were not saved
- **Fix**: Updated `handleOrgRequest` to save proper role IDs from requesting user's subRoles

### 7. **Company Profile Creation**
- **Problem**: Users without `memberfor` entries were not getting proper company association
- **Fix**: Ensure users have proper `memberfor` entry for their own company during profile creation

## Database Structure

### User Model - memberfor Array
```javascript
memberfor: [{
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Company ID
  role: String // Role ID like "BO_004" or role name
}]
```

### Role Model - subRoles Array
```javascript
subRoles: [{
  id: String,        // "BO_004"
  role: String,      // "Administrator"
  permissionLevel: String // "ADMIN"
}]
```

## API Endpoints Updated

### 1. `/api/users/member-info` (getUserMemberInfo)
Returns:
```json
{
  "companyName": "Company Name from memberfor[0].company.companyProfile.companyName",
  "userRole": "Role name from Role.subRoles where id matches memberfor[0].role",
  "currentCompanyId": "memberfor[0].company._id",
  "roleId": "memberfor[0].role"
}
```

### 2. `/api/users/user-companies` (getUserCompanies)
Returns companies from user's `memberfor` array with role information:
```json
[{
  "_id": "company_id",
  "companyProfile": { "companyName": "Company Name" },
  "role": "Administrator", // Resolved from subRoles
  "roleId": "BO_004",     // Original role ID
  "isOwn": true
}]
```

## Frontend Updates

### 1. DashboardHeader Component
- Updated to store complete company information in sessionStorage
- Properly displays company name and role from `memberfor[0]`

### 2. ChangeCompanyModal Component
- Updated to display role information for each company
- Shows "Administrator" instead of "Contact Person"
- Stores role information when switching companies

## Migration Script

Created `fixEmptyMemberFor.js` to fix existing users:
- Finds users with empty `memberfor` arrays
- Adds proper `memberfor` entry with user's own company ID
- Resolves role IDs from user's Role subRoles

## Test Script

Created `testMemberForStructure.js` to verify:
- Role structure and subRoles mapping
- Users with proper `memberfor` entries
- Role ID resolution logic
- Potential data issues

## Running the Fixes

### 1. Run Migration
```bash
cd server
npm run migrate:memberfor
```

### 2. Test Structure
```bash
npm run test:memberfor
```

### 3. Verify in Application
1. Login to application
2. Check company name in header (should show from `memberfor[0]`)
3. Check role name in header (should resolve from subRoles)
4. Open Change Company modal (should show companies from `memberfor`)
5. Test company switching functionality

## Key Benefits

1. **Proper Data Structure**: `memberfor` array now contains correct company IDs and role IDs
2. **Role Resolution**: Role names are properly resolved from Role table's subRoles
3. **Company Display**: Company names are fetched from correct User table entries
4. **Consistent UI**: Header and modals show consistent company and role information
5. **Scalable**: System can handle multiple company memberships with different roles

## Data Flow

1. **Signup**: User → Role selection → `memberfor` with own company ID + role ID from subRoles
2. **Login**: User → `getUserMemberInfo` → Company name from `memberfor[0].company.companyProfile` + Role name from subRoles
3. **Company Modal**: User → `getUserCompanies` → All companies from `memberfor` with resolved role names
4. **Company Switch**: User → Select company → Update sessionStorage → Reload with new context

This implementation ensures that company ID, role ID, and role information are properly saved and retrieved throughout the application.