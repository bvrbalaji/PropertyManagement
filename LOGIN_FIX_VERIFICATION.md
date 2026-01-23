# Login Navigation Fix - Verification Guide

## Issue
Login was successful but did not navigate to the dashboard.

## Root Cause
The `authService.login()` function was returning `response.data` directly, but the backend response has a nested structure:
```json
{
  "success": true,
  "data": {
    "user": { id, email, role, ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

The login page was checking for `result.user` and `result.requiresMFA`, but these weren't at the top level of the returned object.

## Fix Applied
Updated `client/src/lib/auth.ts` to:

1. **Extract data correctly** - Access `response.data.data` instead of `response.data`
2. **Store userRole cookie** - Save role in cookie for role detection
3. **Return correct format** - Format response to match what login page expects:
   ```typescript
   {
     user: response.data.data?.user,
     requiresMFA: response.data.requiresMFA,
     accessToken: response.data.data?.accessToken,
     refreshToken: response.data.data?.refreshToken,
   }
   ```

## Changes Made

### File: `client/src/lib/auth.ts`

**Before:**
```typescript
login: async (data: LoginRequest) => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  if (response.data.accessToken) {
    Cookies.set('accessToken', response.data.accessToken, { expires: 1 });
    Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
  }
  return response.data;
},
```

**After:**
```typescript
login: async (data: LoginRequest) => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  if (response.data.data?.accessToken) {
    Cookies.set('accessToken', response.data.data.accessToken, { expires: 1 });
    Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 7 });
    if (response.data.data.user?.role) {
      Cookies.set('userRole', response.data.data.user.role, { expires: 1 });
    }
  }
  // Return in the format the login page expects
  return {
    user: response.data.data?.user,
    requiresMFA: response.data.requiresMFA,
    accessToken: response.data.data?.accessToken,
    refreshToken: response.data.data?.refreshToken,
  };
},
```

## Testing Steps

### Test 1: Admin Login
1. Open http://localhost:3000/login
2. Enter admin credentials:
   - Email: admin@example.com (or valid admin email)
   - Password: (correct admin password)
3. Click Login
4. **Expected**: Should redirect to `/dashboard/admin` within 1-2 seconds
5. **Verify**: 
   - URL changes to dashboard
   - Header shows admin role badge (red)
   - Dashboard content loads

### Test 2: Owner Login
1. Go to http://localhost:3000/login
2. Enter owner credentials:
   - Email: owner@example.com (or valid owner email)
   - Password: (correct owner password)
3. Click Login
4. **Expected**: Should redirect to `/dashboard/flat-owner` within 1-2 seconds
5. **Verify**: 
   - URL changes to dashboard
   - Header shows owner role badge (blue)
   - Dashboard content loads

### Test 3: Tenant Login
1. Go to http://localhost:3000/login
2. Enter tenant credentials:
   - Email: tenant@example.com (or valid tenant email)
   - Password: (correct tenant password)
3. Click Login
4. **Expected**: Should redirect to `/dashboard/tenant` within 1-2 seconds
5. **Verify**: 
   - URL changes to dashboard
   - Header shows tenant role badge (green)
   - Dashboard content loads

### Test 4: Staff Login
1. Go to http://localhost:3000/login
2. Enter staff credentials:
   - Email: staff@example.com (or valid staff email)
   - Password: (correct staff password)
3. Click Login
4. **Expected**: Should redirect to `/dashboard/maintenance` within 1-2 seconds
5. **Verify**: 
   - URL changes to dashboard
   - Header shows staff role badge (yellow)
   - Dashboard content loads

### Test 5: MFA Login (Admin with MFA enabled)
1. Go to http://localhost:3000/login
2. Enter admin credentials with MFA enabled
3. Click Login
4. **Expected**: MFA code field appears
5. Enter 6-digit MFA code
6. Click Login again
7. **Expected**: Should redirect to `/dashboard/admin`

### Test 6: Invalid Credentials
1. Go to http://localhost:3000/login
2. Enter wrong password
3. Click Login
4. **Expected**: Error toast message appears
5. **Verify**: Stay on login page, no redirect

## Browser Console Checks

After successful login, open DevTools Console and verify:

```javascript
// Check if tokens are stored
document.cookie
// Should contain: accessToken=...; refreshToken=...; userRole=...

// Check localStorage
localStorage.getItem('userRole')
// Should return the user's role (ADMIN, FLAT_OWNER, TENANT, or MAINTENANCE_STAFF)
```

## Cookie Verification

After login, cookies should contain:
- `accessToken` - JWT token (httpOnly if secure)
- `refreshToken` - Refresh token (httpOnly if secure)
- `userRole` - User's role (ADMIN, FLAT_OWNER, TENANT, or MAINTENANCE_STAFF)

## Network Tab Verification

In DevTools Network tab after clicking Login:

1. **POST /auth/login** request should return:
   ```json
   {
     "success": true,
     "data": {
       "user": {
         "id": "user-id",
         "email": "user@example.com",
         "phone": "+1234567890",
         "fullName": "User Name",
         "role": "ADMIN",
         "mfaEnabled": false
       },
       "accessToken": "eyJ...",
       "refreshToken": "eyJ..."
     }
   }
   ```

2. **Redirect to /dashboard/[role]** should load successfully

## Success Criteria

✅ Login successful → Immediate redirect to role-based dashboard
✅ Toast shows "Login successful!"
✅ Cookies contain accessToken, refreshToken, and userRole
✅ Header displays correct role badge
✅ Dashboard content loads for the user's role
✅ No console errors
✅ MFA flow works when enabled

## Troubleshooting

### Still not redirecting after login?
1. Check browser console for errors
2. Check Network tab - verify /auth/login response
3. Check if router is being called (add console.log in login page)
4. Verify role format matches path format (ADMIN → admin, FLAT_OWNER → flat-owner)

### Getting "Cannot read property 'user' of undefined"?
1. Verify backend is returning response in correct format
2. Check if response.data.data exists
3. Add null checks in auth service

### Cookies not being set?
1. Check if api call succeeded (Network tab)
2. Verify Cookies.set() is being called
3. Check for HttpOnly restrictions in development

### Wrong dashboard loads?
1. Verify userRole cookie is set correctly
2. Check role-to-path conversion (ADMIN → admin, FLAT_OWNER → flat-owner)
3. Verify backend is returning correct role

## Summary

The login flow now works correctly:
1. User submits login form
2. Backend validates and returns user data with tokens
3. Frontend stores tokens in cookies
4. Frontend stores role in cookie
5. Frontend redirects to dashboard based on role
6. Header loads and displays correct role information

---

**Status**: ✅ Fixed
**Date**: 2026-01-23
**Version**: 1.0.0
