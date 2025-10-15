# Authentication System

This project implements a complete authentication system using **RTK Query**, **Redux Toolkit**, **React Router**, and **Redux Persist** with automatic JWT token management and fresh user data fetching.

## 🏗️ Architecture Overview

### **Authentication State Management**
- **Redux Slice**: `src/redux/slices/auth.ts` - Manages authentication state
- **Persistence**: Only JWT tokens are persisted (accessToken, refreshToken)
- **User Data**: Fetched fresh from API on app startup for better security
- **Storage**: localStorage for tokens only, user data in memory cache
- **Token Refresh**: Automatic token renewal on 401 responses

### **Custom Hooks**
- **`useAuth`**: Provides authentication state, fetches user data, and logout functionality
- **`useLogin`**: Handles login form logic and API integration
- **`useSignup`**: Handles signup form logic and API integration

### **Components**
- **`AppHeader`**: Shows authentication status and login/logout buttons
- **`ProtectedRoute`**: Guards routes that require authentication
- **`LoadingFallback`**: Shown while Redux Persist restores tokens

## 🔧 Usage

### **Authentication State**

```typescript
const { user, accessToken, refreshToken, isAuthenticated, logout } = useAuth();

if (isAuthenticated) {
  console.log(`Welcome ${user?.name}!`);
  // User data is fetched fresh when tokens are available
}
```

### **Protected Routes**

```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 🔄 Authentication Flow

### **Login Process**
1. User submits login form
2. API call to `/api/users/login` endpoint
3. Tokens and user data stored in Redux state
4. Only tokens persisted to localStorage
5. User redirected to intended destination

### **App Startup Process**
1. App loads with `PersistGate` component
2. Redux Persist restores only tokens from localStorage
3. `useAuth` hook detects tokens without user data
4. User data fetched fresh from API using current tokens
5. User remains authenticated with fresh data

### **Token Refresh Process**
1. API call receives 401 (Unauthorized) response
2. Automatic token refresh using stored refresh token
3. New tokens stored and original request retried
4. If refresh fails, user automatically logged out

## 🛡️ Security Features

### **Token-Only Persistence**
- **Minimal Storage**: Only tokens persisted, not sensitive user data
- **Fresh Data**: User information fetched fresh on each app start
- **Reduced Attack Surface**: Less user data in localStorage
- **Cache-First**: User data stored only in memory during session

### **Dual Token System**
- **Access Token**: Short-lived JWT for API requests
- **Refresh Token**: Long-lived token for obtaining new access tokens
- **Automatic Refresh**: Seamless token renewal without user interruption

### **User Data Management**
- **JWT Decoding**: User ID extracted from access token payload
- **API Fetching**: User data fetched using RTK Query
- **Error Handling**: Automatic logout on user data fetch failure

## 📝 Redux State Structure

```typescript
interface AuthState {
  user: User | null;           // In memory only (not persisted)
  accessToken: string | null;  // Persisted
  refreshToken: string | null; // Persisted
  isAuthenticated: boolean;    // Computed from tokens
}
```

## 🔧 API Integration

### **Login Endpoint**
- **URL**: `POST /api/users/login`
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user: User, accessToken: string, refreshToken: string }`

### **User Data Endpoint**
- **URL**: `GET /api/users/{userId}`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response**: `User`

### **Token Refresh Endpoint**
- **URL**: `POST /api/users/refresh-token`
- **Body**: `{ refreshToken: string }`
- **Response**: `{ user: User, accessToken: string, refreshToken: string }`

## 🚀 Benefits

- ✅ **Enhanced Security** - Only tokens stored locally, user data fetched fresh
- ✅ **Minimal Persistence** - Reduced localStorage footprint
- ✅ **Fresh Data** - User information always up-to-date on app start
- ✅ **Automatic Fetching** - User data loaded transparently by useAuth hook
- ✅ **Token Management** - Seamless token refresh and validation
- ✅ **Type Safety** - Full TypeScript support throughout
- ✅ **Clean Architecture** - Separated token persistence from user data

This authentication system provides a secure, efficient foundation with minimal data persistence! 🔐 