# Utility Functions

## Reserve Studies Dropdown Refresh

After making API calls to `http://localhost:5001/api/reserve-studies`, use this function to refresh the reserve studies dropdown:

```typescript
import { refreshReserveStudiesDropdown } from './eventEmitter';

// After successful API call to /api/reserve-studies
const createReserveStudy = async (data) => {
  try {
    const response = await fetch('http://localhost:5001/api/reserve-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      // Refresh the dropdown after successful API call
      refreshReserveStudiesDropdown();
    }
  } catch (error) {
    console.error('Error creating reserve study:', error);
  }
};
```

## Usage Examples

```typescript
// After creating a new reserve study
refreshReserveStudiesDropdown();

// After updating an existing reserve study  
refreshReserveStudiesDropdown();

// After deleting a reserve study
refreshReserveStudiesDropdown();
```

This will automatically update the reserve studies dropdown list without requiring a page refresh.