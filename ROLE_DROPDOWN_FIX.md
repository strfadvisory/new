# Role Dropdown Fix - User-Specific SubRoles Only

## Issue Summary
The role dropdown in the "Add New Member" modal was not showing any data because:

1. **Frontend Issue**: The component was trying to get subRoles from sessionStorage instead of making an API call
2. **Backend Issue**: No API endpoint existed to fetch the current user's role subRoles
3. **Data Issue**: Super admin user had no roleId assigned, so no subRoles were available
4. **Business Logic**: Should only show subRoles from the logged-in user's specific role, not all roles

## Solution Implemented

### 1. Backend Changes

#### New API Endpoint
- **Route**: `GET /api/roles/user-subroles`
- **Controller**: `getUserSubRoles` in `roleController.js`
- **Features**:
  - Fetches current user's role and its subRoles ONLY
  - Returns only subRoles from the user's assigned role
  - Comprehensive debug logging
  - Proper error handling

#### Enhanced Role Controller
- Added `getUserSubRoles` function with debug logging
- Returns subRoles only from the logged-in user's specific role
- No cross-role access - users can only invite members with subRoles from their own role

### 2. Frontend Changes

#### Updated InviteMemberModal Component
- **API Integration**: Now uses `rolesApi.getUserSubRoles()` instead of sessionStorage
- **Loading States**: Added loading indicator while fetching roles
- **Error Handling**: Better error messages and user feedback
- **Debug Mode**: Shows debug information in development environment
- **TypeScript**: Proper interfaces for type safety

#### Enhanced API Service
- Added `getUserSubRoles` function to `rolesApi.ts`
- Updated interfaces to handle response structure
- Added API endpoint configuration

### 3. Database Setup Scripts

#### Role Assignment Script
Updated `assignRoleToSuperAdmin.js` to assign a specific role with subRoles to the super admin.

## Setup Instructions

### Step 1: Ensure Database is Seeded

```bash
# 1. Create super admin (if not already done)
cd server
node seedSuperAdmin.js

# 2. Seed default roles with subRoles
node seedDefaultRoles.js

# 3. Assign a specific role to super admin
node assignRoleToSuperAdmin.js
```

### Step 2: Test the API

```bash
# Start the server
npm run dev

# Test the endpoint (replace TOKEN with actual JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/roles/user-subroles
```

### Step 3: Test Frontend

1. Login to the application
2. Go to Super Admin Dashboard
3. Click "Add New Members"
4. Check the "Select Role" dropdown - it should show only subRoles from your assigned role
5. Open browser console to see debug information

## Business Logic: User-Specific SubRoles

### How It Works:
1. **User Login**: User has a specific `roleId` assigned (e.g., "Management Company")
2. **API Call**: When opening "Add New Member", system fetches subRoles from user's role only
3. **Dropdown Population**: Shows only subRoles from that specific role
4. **Member Invitation**: New members can only be assigned subRoles from the inviter's role

### Example Scenarios:

#### Scenario 1: Management Company User
- **User Role**: Management Company
- **Available SubRoles**: 
  - Property Manager (EDITOR)
  - Vice President (VIEWER)
  - Director (VIEWER)
  - Viewer (VIEWER)
  - Administrator (ADMIN)

#### Scenario 2: Board Members User
- **User Role**: Board Members
- **Available SubRoles**:
  - President (VIEWER)
  - Vice President (VIEWER)
  - Secretary (VIEWER)
  - Director (VIEWER)
  - Board Member (VIEWER)
  - Property Manager (EDITOR)
  - Administrator (ADMIN)

#### Scenario 3: Bank Office User
- **User Role**: Bank Office
- **Available SubRoles**:
  - Relationship Manager (EDITOR)
  - Branch Manager (VIEWER)
  - Viewer (VIEWER)
  - Administrator (ADMIN)

## Troubleshooting

### Issue: Dropdown shows "No sub-roles available"

**Solution 1**: Check if user has a role assigned
```bash
cd server
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your-database')
  .then(() => User.findOne({ email: 'admin@reservefundadvisory.com' }).populate('roleId')
    .then(user => {
      console.log('User role:', user.roleId?.name || 'No role assigned');
      console.log('SubRoles count:', user.roleId?.subRoles?.length || 0);
      if (user.roleId?.subRoles) {
        user.roleId.subRoles.forEach(sr => console.log(\`- \${sr.role} (\${sr.permissionLevel})\`));
      }
      process.exit(0);
    }));
"
```

**Solution 2**: Assign role to current user
```bash
cd server
node assignRoleToSuperAdmin.js
```

**Solution 3**: Check API response
- Open browser console
- Look for "SubRoles API Response" log
- Check debug information

### Issue: User sees wrong subRoles

**This should not happen** - users can only see subRoles from their own assigned role. If this occurs:
1. Check user's `roleId` in database
2. Verify the role has correct subRoles
3. Check API logs for debugging info

## API Response Examples

### Successful Response (Management Company User)
```json
{
  "subRoles": [
    {
      "_id": "MC_001",
      "name": "Property Manager",
      "permissionLevel": "EDITOR"
    },
    {
      "_id": "MC_005",
      "name": "Administrator", 
      "permissionLevel": "ADMIN"
    }
  ],
  "debug": {
    "message": "SubRoles found from user specific role",
    "roleName": "Management Company",
    "roleType": "Master",
    "subRolesCount": 5
  }
}
```

### No Role Assigned Response
```json
{
  "subRoles": [],
  "debug": {
    "message": "No role assigned to user",
    "suggestion": "User needs to be assigned a role with subRoles"
  }
}
```

### No SubRoles in Role Response
```json
{
  "subRoles": [],
  "debug": {
    "message": "No subRoles found in user role",
    "roleName": "Custom Role",
    "roleType": "User",
    "suggestion": "Contact administrator to configure subRoles for this role"
  }
}
```

## Security & Business Benefits

### 1. **Role Isolation**
- Users can only invite members within their own role hierarchy
- Prevents cross-role access and maintains organizational boundaries

### 2. **Permission Control**
- Each role has specific subRoles with defined permission levels
- Maintains proper access control and hierarchy

### 3. **Data Integrity**
- Ensures invited members have appropriate permissions
- Prevents privilege escalation across different role types

## Files Modified

### Backend
- `server/controllers/roleController.js` - Updated getUserSubRoles function
- `server/routes/roleRoutes.js` - Added user-subroles route
- `server/assignRoleToSuperAdmin.js` - Enhanced utility script

### Frontend  
- `client/src/components/InviteMemberModal.tsx` - Updated to use API
- `client/src/api/services/rolesApi.ts` - Added getUserSubRoles function
- `client/src/api/config.ts` - Added USER_SUBROLES endpoint

## Testing Checklist

- [ ] User with Management Company role sees only Management Company subRoles
- [ ] User with Board Members role sees only Board Members subRoles
- [ ] User with Bank Office role sees only Bank Office subRoles
- [ ] Users without roles see appropriate "no role assigned" message
- [ ] Loading states work correctly
- [ ] Error handling works for API failures
- [ ] Debug information appears in development mode
- [ ] Invitation submission works with selected subRole
- [ ] No cross-role access (users cannot see subRoles from other role types)