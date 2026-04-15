# 🔐 Authentication Code Patterns & Examples

## Quick Reference Guide

---

## Pattern 1: Using Auth Context in ANY Component

```javascript
import { useAuth } from "../context/AuthContext";

export const MyComponent = () => {
  const { user, token, role, isAuthenticated, login, logout } = useAuth();

  // Check if user is logged in
  if (!isAuthenticated) {
    return <div>Please login first</div>;
  }

  // Check user role
  if (role !== "candidate") {
    return <div>Only candidates can access this</div>;
  }

  // Display user info
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  );
};
```

---

## Pattern 2: Protected Route Component

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuth();

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role doesn't match
  if (requiredRole && !Array.isArray(requiredRole)) {
    if (role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Multiple roles allowed
  if (Array.isArray(requiredRole)) {
    if (!requiredRole.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Usage:
<Routes>
  <Route 
    path="/candidate/dashboard" 
    element={
      <ProtectedRoute requiredRole="candidate">
        <CandidateDashboard />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute requiredRole={["recruiter", "admin"]}>
        <RecruiterDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

---

## Pattern 3: Login Handler

```javascript
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (res.data.success) {
        // Update auth context
        login({
          token: res.data.token,
          user: res.data.user
        });

        // Redirect based on role
        const role = res.data.user.role;
        const redirectPath = 
          role === "recruiter" || role === "admin" 
            ? "/dashboard" 
            : "/candidate/dashboard";

        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

---

## Pattern 4: Logout Handler

```javascript
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/api";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      // Call backend logout for audit trail
      await logoutUser();
    } catch (error) {
      console.warn("Backend logout failed:", error.message);
      // Continue with client-side logout anyway
    }

    // Clear auth state
    logout();

    // Redirect home
    navigate("/", { replace: true });

    setLoading(false);
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
};
```

---

## Pattern 5: Conditional Rendering Based on Auth

```javascript
import { useAuth } from "../context/AuthContext";
import { UserCircle2, LogOut } from "lucide-react";

export const ProfileMenu = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <a href="/login">Login</a>
        <a href="/register">Sign Up</a>
      </div>
    );
  }

  // Logged in
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
        <UserCircle2 size={24} />
        <span>{user?.name}</span>
        <span className="text-xs bg-blue-500 px-2 py-1 rounded">
          {role?.toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
          <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">
            Profile
          </a>
          <a href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
            Dashboard
          </a>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Pattern 6: API Call with Auto Auth

```javascript
import { useAuth } from "../context/AuthContext";

export const MyComponent = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) return; // Skip if not authenticated

    const fetchData = async () => {
      try {
        const response = await fetch("/api/protected-endpoint", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
    };

    fetchData();
  }, [token]);

  return <div>{data && JSON.stringify(data)}</div>;
};
```

---

## Pattern 7: Auth-Protected Button

```javascript
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const ApplyJobButton = ({ jobId }) => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleClick = () => {
    // Must be logged in
    if (!isAuthenticated) {
      navigate("/login?redirect=/jobs/" + jobId);
      return;
    }

    // Only candidates can apply
    if (role !== "candidate") {
      alert("Only candidates can apply to jobs");
      return;
    }

    // Proceed with application
    navigate(`/apply/${jobId}`);
  };

  return (
    <button onClick={handleClick} className="btn-primary">
      {isAuthenticated ? "Apply Now" : "Login to Apply"}
    </button>
  );
};
```

---

## Pattern 8: User Info Display

```javascript
import { useAuth } from "../context/AuthContext";

export const UserProfile = () => {
  const { user, role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Not logged in</p>;
  }

  return (
    <div className="profile-card">
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <div className="badge">
        Role: {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </div>
      <small>ID: {user?._id}</small>
    </div>
  );
};
```

---

## Pattern 9: Admin-Only Component

```javascript
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const AdminPanel = () => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role !== "admin") {
    return (
      <div className="error-container">
        <h1>Access Denied</h1>
        <p>Only admins can access this page</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Admin content */}
    </div>
  );
};
```

---

## Pattern 10: Role-Based Navigation

```javascript
import { useAuth } from "../context/AuthContext";

export const Navigation = () => {
  const { isAuthenticated, role } = useAuth();

  const navItems = [];

  // Common items
  navItems.push({ label: "Home", path: "/" });
  navItems.push({ label: "Jobs", path: "/jobs" });

  // Authenticated items
  if (isAuthenticated) {
    if (role === "candidate") {
      navItems.push({ label: "My Applications", path: "/applications" });
      navItems.push({ label: "Saved Jobs", path: "/saved-jobs" });
      navItems.push({ label: "Dashboard", path: "/candidate/dashboard" });
    } else if (role === "recruiter") {
      navItems.push({ label: "Post Job", path: "/jobs/create" });
      navItems.push({ label: "Dashboard", path: "/dashboard" });
    } else if (role === "admin") {
      navItems.push({ label: "Admin Panel", path: "/admin" });
      navItems.push({ label: "Dashboard", path: "/dashboard" });
    }
  }

  return (
    <nav>
      {navItems.map((item) => (
        <a key={item.path} href={item.path}>
          {item.label}
        </a>
      ))}
    </nav>
  );
};
```

---

## Pattern 11: Session Timeout Warning

```javascript
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const SESSION_TIMEOUT = 1800000; // 30 minutes
const WARNING_TIME = 1680000;    // 28 minutes

export const SessionManager = () => {
  const { token, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!token) return;

    const warningTimer = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_TIME);

    const logoutTimer = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, [token, logout]);

  if (!showWarning) return null;

  return (
    <div className="warning-banner">
      <p>Your session will expire in 2 minutes</p>
      <button onClick={() => setShowWarning(false)}>Continue</button>
    </div>
  );
};
```

---

## Pattern 12: Social Login Integration

```javascript
import { useAuth } from "../context/AuthContext";

export const GoogleLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleResponse = async (credentialResponse) => {
    try {
      // Send token to backend
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await res.json();

      if (data.success) {
        // Update auth context
        login({
          token: data.token,
          user: data.user
        });

        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleResponse}
      onError={() => console.log("Login Failed")}
    />
  );
};
```

---

## localStorage States

### **Before Login**
```javascript
localStorage = {}
```

### **After Login**
```javascript
localStorage = {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": "{\"_id\":\"507f1f77bcf86cd799439011\",\"name\":\"Raj\",\"email\":\"raj@example.com\",\"role\":\"candidate\"}",
  "role": "candidate"
}
```

### **After Logout**
```javascript
localStorage = {}
```

---

## API Request Flow

```
User Action
  ↓
Component calls useAuth()
  ↓
Get token from context
  ↓
Include in API header: Authorization: Bearer {token}
  ↓
Backend validates JWT
  ↓
If valid → Process request
If invalid → Return 401
  ↓
API interceptor catches 401
  ↓
Clear auth state
  ↓
Redirect to login
```

---

## Debugging Checklist

- [ ] Check localStorage has token
- [ ] Check AuthContext is imported with useAuth
- [ ] Verify AuthProvider wraps entire App
- [ ] Check role value matches backend (candidate/recruiter/admin)
- [ ] Verify API headers include Authorization
- [ ] Check backend returns JWT in login response
- [ ] Verify localStorage key names match exactly
- [ ] Check isAuthenticated computed correctly (Boolean(token))

---

## Environment Variables Needed

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_EXPIRY=7d
REACT_APP_SESSION_TIMEOUT=1800000
```

---

## Testing Scenarios

### **Test 1: Login Flow**
1. Open app, see Login + Get Started
2. Click Login, enter credentials
3. Auth context updates
4. Navbar shows profile + logout
5. localStorage has token/user/role

### **Test 2: Refresh After Login**
1. Login successfully
2. Hard refresh (Ctrl+F5)
3. Auth context rebuilds from localStorage
4. Still shows profile + logout (auto-login!)

### **Test 3: Logout Flow**
1. Click Logout button
2. Backend endpoint called
3. localStorage cleared
4. Navbar shows Login + Get Started
5. Redirected to home

### **Test 4: Protected Route**
1. Not logged in, try /dashboard
2. Redirected to /login
3. Login, try /dashboard again
4. Access granted!

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Auth context undefined | AuthProvider not wrapping app | Add `<AuthProvider>` in App.js |
| Token lost on refresh | localStorage key mismatch | Check key names: "token", "user", "role" |
| Login state changes but UI doesn't | Component not re-rendering | Add `useAuth()` hook to component |
| Logout doesn't work | logout() not called | Call `logout()` from useAuth |
| Backend rejects requests | No Authorization header | Verify API interceptor adding Bearer token |
| Role doesn't update | User object missing role field | Ensure backend returns role in login response |

---

## Complete Working Example

See your actual implementation:
- **AuthContext:** `src/context/AuthContext.js`
- **Navbar:** `src/components/Navbar.js`
- **Login Page:** `src/pages/Login.js`
- **API Service:** `src/services/api.js`

All patterns above are already implemented in your codebase! ✅
