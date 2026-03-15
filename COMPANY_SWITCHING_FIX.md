# Company Switching Fix - Complete Implementation

## Problem
The Change Company functionality was not properly reflecting in the header after switching companies. The header was still showing the old company name and role.

## Root Cause
The header was reading from `memberfor[0]` (first entry in the array), but the `switchCompany` function was not reordering the `memberfor` array to put the selected company first.

## Solution

### 1. Backend Fix - `switchCompany` Function

**File**: `server/controllers/userController.js`

**Key Changes**:
- Reorder the `memberfor` array to put selected company first
- Save the updated user to database
- Return complete role information in response

```javascript
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
}
```

**Response Format**:
```json
{
  "message": "Company switched successfully",
  "currentCompany": "company_id",
  "permissionLevel": "ADMIN",
  "isOwnCompany": true,
  "companyInfo": {
    "name": "Company Name",
    "_id": "company_id"
  },
  "roleInfo": {
    "roleName": "Administrator",
    "roleId": "BO_004"
  }
}
```

### 2. Frontend Fix - ChangeCompanyModal

**File**: `client/src/components/ChangeCompanyModal.tsx`

**Key Changes**:
- Use new response data with role information
- Dispatch custom event for immediate header update
- Update sessionStorage with complete company info

```javascript
// Dispatch custom event to notify header to refresh
window.dispatchEvent(new CustomEvent('companyChanged', {
  detail: {
    companyName: response.companyInfo.name,
    userRole: response.roleInfo?.roleName || selectedCompany?.role || 'User'
  }
}));
```

### 3. Frontend Fix - DashboardHeader

**File**: `client/src/components/DashboardHeader.tsx`

**Key Changes**:
- Listen for `companyChanged` events
- Immediately update header display
- Refresh from API for consistency

```javascript
// Listen for company change events
const handleCompanyChange = (event: CustomEvent) => {
  if (event.detail) {
    setCompanyName(event.detail.companyName || 'Company name');
    setUserRole(event.detail.userRole || 'User');
    
    // Also refresh from API to ensure consistency
    setTimeout(() => {
      refreshHeaderInfo();
    }, 500);
  }
};

window.addEventListener('companyChanged', handleCompanyChange as EventListener);
```

## How It Works

### 1. User Flow
1. User opens Change Company modal
2. Modal shows companies from user's `memberfor` array
3. User selects a different company
4. `switchCompany` API is called

### 2. Backend Process
1. Find the selected company in user's `memberfor` array
2. Remove it from current position
3. Add it to the beginning of the array (`memberfor[0]`)
4. Save user to database
5. Return company and role information

### 3. Frontend Process
1. Receive response with new company info
2. Update sessionStorage
3. Dispatch `companyChanged` event
4. Header immediately updates display
5. Optional page reload for complete context switch

### 4. Header Update
1. Header listens for `companyChanged` event
2. Immediately updates company name and role
3. Refreshes from API after 500ms for consistency
4. `getUserMemberInfo` now returns data from `memberfor[0]`

## Data Flow

```
User Selects Company
       ↓
switchCompany API
       ↓
Reorder memberfor array (selected company → memberfor[0])
       ↓
Save to database
       ↓
Return response with company/role info
       ↓
Frontend dispatches 'companyChanged' event
       ↓
Header listens and updates immediately
       ↓
API refresh for consistency
       ↓
Header shows new company/role
```

## Key Benefits

1. **Immediate Update**: Header updates instantly without page reload
2. **Data Consistency**: `memberfor[0]` always contains current company
3. **Persistent State**: Company selection persists across sessions
4. **Role Resolution**: Proper role names from subRoles array
5. **Fallback Support**: Graceful handling of missing data

## Testing

### Run Tests
```bash
# Test memberfor structure
npm run test:memberfor

# Test company switching logic
npm run test:company-switch
```

### Manual Testing
1. Login with user having multiple companies
2. Check header shows company from `memberfor[0]`
3. Open Change Company modal
4. Select different company
5. Verify header updates immediately
6. Refresh page - header should maintain new company

## Database Impact

The `switchCompany` operation modifies the user's `memberfor` array order:

**Before Switch**:
```javascript
memberfor: [
  { company: "company_A", role: "BO_004" },  // Current (memberfor[0])
  { company: "company_B", role: "MC_005" },
  { company: "company_C", role: "IA_004" }
]
```

**After Switch to company_B**:
```javascript
memberfor: [
  { company: "company_B", role: "MC_005" },  // New current (memberfor[0])
  { company: "company_A", role: "BO_004" },
  { company: "company_C", role: "IA_004" }
]
```

## API Endpoints

### Switch Company
- **Endpoint**: `POST /api/users/switch-company`
- **Body**: `{ "companyId": "company_id" }`
- **Response**: Company info + role info + permission level

### Get Member Info (Header)
- **Endpoint**: `GET /api/users/member-info`
- **Response**: Company name + role name from `memberfor[0]`

This implementation ensures that company switching properly reflects in the header immediately and persistently.