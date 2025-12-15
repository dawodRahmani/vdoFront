# API Services Usage Examples

This document provides examples of how to use the API services in your React components.

## Setup

The API services are already configured with:
- Axios instance with Laravel backend integration
- CSRF token handling for Laravel Sanctum
- Bearer token authentication
- Request/Response interceptors
- Error handling

## Environment Configuration

Make sure your `.env` file has the correct Laravel backend URL:

```env
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

## Import Services

```javascript
// Import specific services
import { authService, userManagementService, hrService } from '../services/api';

// Or import axios directly for custom requests
import { axios } from '../services/api';
```

## Authentication Examples

### Login

```javascript
import { authService } from '../services/api';

const handleLogin = async (email, password) => {
  try {
    const data = await authService.login({ email, password });
    console.log('Login successful:', data);
    // Token is automatically stored in localStorage
    // Redirect user to dashboard
  } catch (error) {
    if (error.response?.status === 422) {
      // Validation errors
      console.error('Validation errors:', error.response.data.errors);
    } else if (error.response?.status === 401) {
      // Invalid credentials
      console.error('Invalid credentials');
    }
  }
};
```

### Register

```javascript
const handleRegister = async (userData) => {
  try {
    const data = await authService.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation,
    });
    console.log('Registration successful:', data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data);
  }
};
```

### Logout

```javascript
const handleLogout = async () => {
  try {
    await authService.logout();
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### Get Current User

```javascript
const fetchCurrentUser = async () => {
  try {
    const user = await authService.getUser();
    console.log('Current user:', user);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
};
```

## User Management Examples

### Get All Users

```javascript
import { userManagementService } from '../services/api';

const fetchUsers = async () => {
  try {
    const data = await userManagementService.getUsers({
      page: 1,
      per_page: 10,
      search: 'john',
    });
    console.log('Users:', data.data);
    console.log('Pagination:', data.meta);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};
```

### Create User

```javascript
const createNewUser = async () => {
  try {
    const newUser = await userManagementService.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role_id: 2,
    });
    console.log('User created:', newUser);
  } catch (error) {
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
};
```

### Update User

```javascript
const updateUser = async (userId) => {
  try {
    const updated = await userManagementService.updateUser(userId, {
      name: 'John Smith',
      email: 'john.smith@example.com',
    });
    console.log('User updated:', updated);
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};
```

### Delete User

```javascript
const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await userManagementService.deleteUser(userId);
      console.log('User deleted successfully');
      // Refresh user list
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }
};
```

### Get Roles

```javascript
const fetchRoles = async () => {
  try {
    const roles = await userManagementService.getRoles();
    console.log('Roles:', roles);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
  }
};
```

### Assign Permissions to Role

```javascript
const assignPermissions = async (roleId, permissionIds) => {
  try {
    await userManagementService.syncRolePermissions(roleId, permissionIds);
    console.log('Permissions assigned successfully');
  } catch (error) {
    console.error('Failed to assign permissions:', error);
  }
};
```

## HR Management Examples

### Get Employees

```javascript
import { hrService } from '../services/api';

const fetchEmployees = async () => {
  try {
    const data = await hrService.getEmployees({
      page: 1,
      department_id: 5,
      status: 'active',
    });
    console.log('Employees:', data);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
  }
};
```

### Create Employee

```javascript
const createEmployee = async () => {
  try {
    const employee = await hrService.createEmployee({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      department_id: 3,
      position_id: 5,
      hire_date: '2024-01-15',
    });
    console.log('Employee created:', employee);
  } catch (error) {
    console.error('Failed to create employee:', error);
  }
};
```

### Mark Attendance

```javascript
const markAttendance = async () => {
  try {
    await hrService.markAttendance({
      employee_id: 123,
      date: '2024-01-20',
      check_in: '09:00:00',
      check_out: '17:00:00',
    });
    console.log('Attendance marked');
  } catch (error) {
    console.error('Failed to mark attendance:', error);
  }
};
```

### Create Leave Request

```javascript
const createLeaveRequest = async () => {
  try {
    const leave = await hrService.createLeaveRequest({
      employee_id: 123,
      leave_type: 'annual',
      start_date: '2024-02-01',
      end_date: '2024-02-05',
      reason: 'Family vacation',
    });
    console.log('Leave request created:', leave);
  } catch (error) {
    console.error('Failed to create leave request:', error);
  }
};
```

## Using in React Components

### Example: Login Component

```javascript
import { useState } from 'react';
import { authService } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, password });
      console.log('Login successful:', data);
      // Redirect to dashboard
      window.location.href = '/';
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginPage;
```

### Example: Users List Component

```javascript
import { useState, useEffect } from 'react';
import { userManagementService } from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userManagementService.getUsers();
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure?')) return;

    try {
      await userManagementService.deleteUser(userId);
      // Remove from local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
```

## Error Handling

The axios instance automatically handles common errors:

- **401 Unauthorized**: Clears token and redirects to login
- **403 Forbidden**: Logs permission error
- **404 Not Found**: Logs not found error
- **422 Validation Error**: Returns validation errors
- **429 Too Many Requests**: Logs rate limit error
- **500 Server Error**: Logs server error

You can access error details in your catch blocks:

```javascript
try {
  await userManagementService.createUser(userData);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.log('Status:', error.response.status);
    console.log('Data:', error.response.data);
    console.log('Headers:', error.response.headers);
  } else if (error.request) {
    // Request made but no response
    console.log('Request:', error.request);
  } else {
    // Something else happened
    console.log('Error:', error.message);
  }
}
```

## Custom Axios Requests

If you need to make a custom API request:

```javascript
import { axios } from '../services/api';

const customRequest = async () => {
  try {
    const response = await axios.get('/custom-endpoint', {
      params: { custom: 'param' }
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

## Notes

- All tokens are automatically stored in localStorage
- CSRF tokens are automatically handled for Laravel Sanctum
- Bearer tokens are automatically added to request headers
- Requests automatically include `withCredentials: true` for cookies
