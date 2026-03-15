# MemberFor Structure Fix and Company Switching Implementation

## Overview
This implementation fixes the empty memberFor array issue after signup and implements proper company switching functionality.

## Changes Made

### 1. Backend Changes

#### User Model Updates (`server/models/User.js`)
- Updated `memberfor` structure from simple ObjectId array to object array:
```javascript
// Old structure
memberfor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

// New structure  
memberfor: [{
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String
}]
```

#### Auth Controller Updates (`server/controllers/authController.js`)
- Fixed user registration to create proper memberFor structure:
```javascript
memberfor: [{
  company: selectedRole._id,  // Company ID from role selection
  role: administratorRoleId   // Administrator subrole ID from role.subRoles
}]
```
- Updated `addMember` function to use new memberFor structure

#### User Controller Updates (`server/controllers/userController.js`)
- Updated `getUserCompanies()` to handle new memberFor structure with population
- Fixed `handleOrgRequest()` to properly move accepted requests from reqorg to memberFor
- Updated `switchCompany()` to work with new structure
- Enhanced company switching logic with proper permission handling

### 2. Frontend Changes

#### Company Selection Component (`client/src/CompanySelection.tsx`)
- Updated `handleCompanySwitch()` to properly handle response and update localStorage
- Improved error handling and user feedback

#### Change Company Modal (`client/src/components/ChangeCompanyModal.tsx`)
- Already properly implemented to work with the new backend structure
- Handles both company switching and pending request management

### 3. Database Migration

#### Migration Script (`server/migrations/fixMemberForStructure.js`)
- Converts existing memberFor entries from old format to new format
- Handles multiple old structure variations:
  - Simple ObjectId references
  - Old companyId structure
  - Mixed formats

#### Test Script (`server/testMemberForStructure.js`)
- Validates memberFor structure after migration
- Tests company relationships and role assignments

## How It Works

### 1. User Registration Flow
1. User selects company type during signup
2. System finds Administrator subrole from selected role's subRoles
3. Creates memberFor entry with:
   - `company`: Selected company/role ID
   - `role`: Administrator subrole ID

### 2. Organization Request Flow
1. User receives invitation via reqorg array
2. When user accepts request:
   - System finds the role and gets Administrator subrole
   - Moves request to memberFor with proper structure
   - Removes from reqorg array

### 3. Company Switching Flow
1. User opens Change Company modal
2. System fetches user's companies from memberFor array
3. User selects company to switch to
4. System validates access and updates user context
5. Frontend updates localStorage and reloads

## API Endpoints

### User Companies
- `GET /api/users/user-companies` - Get user's accessible companies
- `GET /api/users/pending-requests` - Get pending organization requests
- `POST /api/users/switch-company` - Switch active company
- `PUT /api/users/org-request/:requestId` - Accept/reject organization request

## Running the Migration

### 1. Run Migration Script
```bash
cd server
npm run migrate:memberfor
```

### 2. Test Migration Results
```bash
npm run test:memberfor
```

### 3. Verify in Application
1. Login to application
2. Check that memberFor is no longer empty
3. Test company switching functionality
4. Verify pending requests work properly

## Troubleshooting

### Common Issues

1. **Empty memberFor after migration**
   - Check if users have valid roleId references
   - Verify role has subRoles with Administrator role

2. **Company switching not working**
   - Ensure user has proper memberFor entries
   - Check API endpoints are returning correct data
   - Verify localStorage is being updated

3. **Pending requests not showing**
   - Check reqorg array structure
   - Verify population is working for orgId references

### Debug Commands
```bash
# Test memberFor structure
npm run test:memberfor

# Check database directly
mongo
use strf
db.users.find({}, {email: 1, memberfor: 1, reqorg: 1}).pretty()
```

## Security Considerations

1. **Access Control**: Users can only switch to companies they're members of
2. **Permission Levels**: Role-based permissions are maintained during company switching
3. **Request Validation**: Organization requests are validated before acceptance

## Performance Notes

1. **Population**: memberFor.company is populated only when needed
2. **Caching**: User permissions are cached in localStorage
3. **Lazy Loading**: Company data is fetched only when Change Company modal opens

## Future Enhancements

1. **Real-time Updates**: WebSocket notifications for new organization requests
2. **Bulk Operations**: Accept/reject multiple requests at once
3. **Company Hierarchy**: Support for nested company structures
4. **Audit Trail**: Track company switching history