# React Query API Architecture

## 🚀 Quick Start

Your MERN application has been refactored to use React Query for all API operations. Here's how to use it:

### Basic Usage

```jsx
import { useAssociations, useCreateAssociation } from '../hooks/queries';

function MyComponent() {
  // GET request - automatic loading, error handling, caching
  const { data: associations = [], isLoading, error } = useAssociations();
  
  // POST/PUT/DELETE - mutations with auto-refresh
  const createMutation = useCreateAssociation();
  
  const handleCreate = async (formData) => {
    try {
      await createMutation.mutateAsync(formData);
      // Success - data automatically refreshes
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {associations.map(item => <div key={item._id}>{item.name}</div>)}
      <button onClick={() => handleCreate({name: 'New Item'})}>
        {createMutation.isLoading ? 'Creating...' : 'Create'}
      </button>
    </div>
  );
}
```

## 📁 Architecture

```
src/
├── api/
│   ├── config.js          # Endpoints & query keys
│   ├── client.js          # Axios with auth interceptors
│   └── services/          # API functions
├── hooks/
│   ├── QueryProvider.js   # React Query setup
│   └── queries/           # Custom hooks
└── components/
    └── AssociationsExample.tsx  # Complete example
```

## 🔧 Available Hooks

### Auth
- `useProfile()` - Get user profile
- `useLogin()` - Login mutation
- `useRegister()` - Register mutation

### Users
- `useUsers()` - Get all users
- `useUser(id)` - Get user by ID
- `useUpdateUserStatus()` - Update status

### Roles
- `useRoles()` - Get all roles
- `useCreateRole()` - Create role
- `useUpdateRole()` - Update role

### Associations
- `useAssociations()` - Get all associations
- `useCreateAssociation()` - Create association
- `useUpdateAssociation()` - Update association

### Reserve Studies
- `useReserveStudies()` - Get all studies
- `useReserveStudiesByAssociation(name)` - Filter by association
- `useCreateReserveStudy()` - Create with file upload

## ✅ Benefits

- **Automatic caching** - No duplicate requests
- **Background updates** - Data stays fresh
- **Loading states** - Built-in loading/error handling
- **Optimistic updates** - Instant UI feedback
- **Auto-retry** - Network error recovery
- **DevTools** - Debug queries in browser

## 🔄 Migration

**Before:**
```jsx
// ❌ Old way
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/users').then(res => res.json()).then(setData);
}, []);
```

**After:**
```jsx
// ✅ New way
const { data = [], isLoading } = useUsers();
```

## 📖 Example

See `components/AssociationsExample.tsx` for a complete CRUD example with:
- Data fetching with loading/error states
- Create, update, delete operations
- Form handling
- Automatic cache updates

The QueryProvider is already set up in App.tsx. All components can now use the query hooks directly!