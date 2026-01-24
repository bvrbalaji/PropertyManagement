# Login/Logout Verification Checklist ✅

## Overview
This document provides a comprehensive verification checklist for the login/logout flow implementation.

## Implementation Summary

### Components Modified:
1. **Header.tsx** - Enhanced authentication detection with event listeners
2. **login/page.tsx** - Added localStorage storage and custom event dispatch
3. **auth.ts** - Already properly configured

### Key Features Implemented:

#### 1. Header Component (`client/src/components/Navigation/Header.tsx`)
- ✅ Uses `mounted` state to prevent hydration mismatch
- ✅ Implements `useCallback` for `checkAuth` function
- ✅ Listens for `userLoggedIn` custom event
- ✅ Listens for `storage` events for cross-tab synchronization
- ✅ Console logging for debugging auth state
- ✅ Displays Login button when not authenticated
- ✅ Displays Logout button + username when authenticated
- ✅ Properly clears all auth data on logout

#### 2. Login Page (`client/src/app/login/page.tsx`)
- ✅ Stores user data in localStorage with key `userData`
- ✅ Dispatches custom `userLoggedIn` event
- ✅ Adds 100ms delay before redirect to ensure cookies are set
- ✅ Redirects to appropriate dashboard based on role

#### 3. Authentication Service (`client/src/lib/auth.ts`)
- ✅ `login()` sets `accessToken`, `refreshToken`, and `userRole` cookies
- ✅ `getUserRole()` retrieves role from cookies
- ✅ `isAuthenticated()` checks for accessToken

---

## Verification Steps

### Step 1: Browser Console Check
**Expected Output:**
```
[Header] Checking auth - token: true role: ADMIN
[Header] User name set to: John Doe
[Header] Login event detected
```

### Step 2: Login Flow Test

#### 2.1 Open Login Page
- [ ] Navigate to `/login`
- [ ] Header should NOT display (auth pages hide header)
- [ ] Login form should be visible

#### 2.2 Submit Login Credentials
- [ ] Enter valid email/phone and password
- [ ] Click "Login" button
- [ ] Toast notification: "Login successful!" should appear
- [ ] Browser console should show:
  - `[Header] Login event detected`
  - `[Header] Checking auth - token: true role: ADMIN`
  - `[Header] User name set to: <Full Name>`

#### 2.3 Verify Redirect
- [ ] Page redirects to appropriate dashboard (e.g., `/dashboard/admin`)
- [ ] URL changes to dashboard route
- [ ] No errors in console

#### 2.4 Check Header After Login
- [ ] Header becomes visible
- [ ] "Welcome, [User Name]" displays on desktop
- [ ] Red "Logout" button appears
- [ ] Navigation links show (Dashboard, Reports, Notifications)

### Step 3: Cookie Verification

Open Browser DevTools → Application → Cookies:

#### Expected Cookies:
```
✅ accessToken    : [JWT Token] (expires in 15 minutes)
✅ refreshToken   : [JWT Token] (expires in 7 days)  
✅ userRole       : ADMIN (or FLAT_OWNER, TENANT, etc.)
```

**Note:** Cookies are set with:
- `httpOnly: true` (secure from JavaScript)
- `sameSite: lax` (CSRF protection)
- `secure: true` (HTTPS only in production)

### Step 4: LocalStorage Verification

Open Browser DevTools → Application → LocalStorage:

#### Expected Item:
```
✅ userData: {
  "id": "user-id",
  "email": "user@example.com",
  "phone": "+1234567890",
  "fullName": "John Doe",
  "role": "ADMIN",
  "mfaEnabled": false
}
```

### Step 5: Navigation Links Test

After successful login, verify navigation:

#### Desktop Navigation:
- [ ] **Home** - Always visible
- [ ] **Dashboard** - Visible, links to role-specific dashboard
- [ ] **Reports** - Only visible for ADMIN and FLAT_OWNER
- [ ] **Notifications** - Always visible when logged in

#### Mobile Navigation:
- [ ] Menu icon visible on small screens
- [ ] Clicking menu toggle opens/closes navigation
- [ ] Same links available as desktop
- [ ] Clicking a link closes the menu

### Step 6: Logout Test

#### 6.1 Click Logout Button
- [ ] Logout button visible in header
- [ ] Click red "Logout" button
- [ ] Confirm action (if implemented)

#### 6.2 Verify Logout Process
- [ ] Page redirects to `/login`
- [ ] All cookies are removed:
  - `accessToken` ❌ deleted
  - `refreshToken` ❌ deleted
  - `userRole` ❌ deleted
- [ ] localStorage cleared:
  - `userData` ❌ deleted
- [ ] Header reverts to showing "Login" button

#### 6.3 Check Browser Console
- [ ] `[Header] Not authenticated - clearing state` message appears
- [ ] No error messages

### Step 7: Role-Based Authorization Test

#### 7.1 Admin User
- [ ] Login as admin user
- [ ] Dashboard shows `/dashboard/admin`
- [ ] Reports link visible
- [ ] All admin features accessible

#### 7.2 Flat Owner
- [ ] Login as flat owner
- [ ] Dashboard shows `/dashboard/flat-owner`
- [ ] Reports link visible
- [ ] Tenant/Admin-only features not accessible

#### 7.3 Tenant
- [ ] Login as tenant
- [ ] Dashboard shows `/dashboard/tenant`
- [ ] Reports link NOT visible
- [ ] Maintenance links not visible

#### 7.4 Maintenance Staff
- [ ] Login as maintenance staff
- [ ] Dashboard shows `/dashboard/maintenance`
- [ ] Reports link NOT visible
- [ ] Admin/Flat Owner features not accessible

### Step 8: Page Refresh Test

#### 8.1 After Login
- [ ] Login successfully
- [ ] Refresh the page (F5 or Ctrl+R)
- [ ] Header should immediately show logged-in state
- [ ] No flash of login button before switching to logout

#### 8.2 From Dashboard
- [ ] Refresh from dashboard page
- [ ] Header should maintain logged-in state
- [ ] User name should still display
- [ ] Cookies should still be valid

### Step 9: Session Persistence Test

#### 9.1 New Tab Test
- [ ] Login in one tab
- [ ] Open new tab to dashboard
- [ ] Header should show logged-in state
- [ ] No need to log in again

#### 9.2 Cross-Tab Logout Test
- [ ] Login in tab A
- [ ] Open dashboard in tab B
- [ ] Logout in tab A
- [ ] Refresh tab B
- [ ] Tab B should redirect to login
- [ ] Cookies should be cleared

### Step 10: Error Handling Test

#### 10.1 Invalid Credentials
- [ ] Enter wrong password
- [ ] Click Login
- [ ] Toast error: "Invalid credentials" appears
- [ ] Stay on login page
- [ ] No redirect

#### 10.2 Missing Fields
- [ ] Leave email/phone empty
- [ ] Form validation error appears
- [ ] Button remains disabled
- [ ] No API call made

#### 10.3 Network Error
- [ ] Disconnect internet
- [ ] Try to login
- [ ] Error message should display
- [ ] Form should allow retry

### Step 11: MFA Test (if enabled)

#### 11.1 MFA Required
- [ ] Login with user that has MFA enabled
- [ ] Receive: "MFA code required" message
- [ ] MFA code input field appears
- [ ] Enter 6-digit code
- [ ] Submit

#### 11.2 Invalid MFA
- [ ] Enter wrong MFA code
- [ ] Error message appears
- [ ] Stay on login page
- [ ] Can retry

---

## Expected Behavior Summary

### Authentication Flow:
```
User enters credentials
        ↓
Login API call
        ↓
Server validates & sets cookies
        ↓
Client stores userData in localStorage
        ↓
Custom event 'userLoggedIn' fired
        ↓
Header receives event & checks auth
        ↓
Header state updates (isLoggedIn=true)
        ↓
Logout button appears
        ↓
User name displays
        ↓
Redirect to dashboard
```

### State Management:
```
Cookies (Backend Set):
- accessToken (15 min expiry)
- refreshToken (7 day expiry)
- userRole

LocalStorage (Frontend):
- userData (user profile info)

Component State:
- isLoggedIn (boolean)
- userRole (ADMIN | FLAT_OWNER | TENANT | MAINTENANCE_STAFF)
- userName (string)
- mounted (boolean - prevents hydration mismatch)
```

### Logout Flow:
```
User clicks Logout
        ↓
All cookies removed
        ↓
All localStorage cleared
        ↓
Component state cleared
        ↓
Redirect to /login
        ↓
Header shows Login button
```

---

## Debugging Tips

### Enable Console Logging:
All auth operations log to browser console with `[Header]` prefix. Check:
```
F12 → Console tab
```

### Check Cookies:
```
F12 → Application → Cookies → http://localhost:3000
```

### Check LocalStorage:
```
F12 → Application → Local Storage → http://localhost:3000
```

### Network Requests:
```
F12 → Network tab → Filter by 'login'
```

---

## Common Issues & Fixes

### Issue: Login button not appearing after login
**Solutions:**
- [ ] Check if cookies are being set (F12 → Application → Cookies)
- [ ] Check localStorage has `userData` (F12 → Application → Local Storage)
- [ ] Clear cache and refresh (Ctrl+Shift+Delete)
- [ ] Check browser console for errors

### Issue: User name showing as "User"
**Solutions:**
- [ ] Verify `userData` is stored in localStorage
- [ ] Check if `fullName` or `email` fields exist in userData
- [ ] Check API response contains user info

### Issue: Logout not redirecting
**Solutions:**
- [ ] Check if cookies are removed (F12 → Cookies should be empty)
- [ ] Check if router push is executing
- [ ] Check for JavaScript errors in console

### Issue: Header flashing between states
**Solutions:**
- [ ] Ensure `mounted` state is being used (prevents hydration mismatch)
- [ ] Check that useEffect dependencies are correct
- [ ] Verify no multiple auth checks are triggering

---

## Performance Checklist

- [ ] No unnecessary re-renders (useCallback for checkAuth)
- [ ] Event listeners properly cleaned up
- [ ] No memory leaks from event listeners
- [ ] Proper error handling in all async operations
- [ ] No blocking operations in render path

---

## Security Checklist

- ✅ Tokens stored in httpOnly cookies (not accessible to JavaScript)
- ✅ CSRF protection with sameSite: 'lax'
- ✅ Secure flag enabled in production
- ✅ Logout clears all authentication data
- ✅ Invalid token redirects to login
- ✅ No sensitive data in localStorage (only non-sensitive user info)

---

## Test Checklist Summary

| Test | Status | Notes |
|------|--------|-------|
| Login Flow | ⏳ | Pending verification |
| Cookies Set | ⏳ | Pending verification |
| Header Display | ⏳ | Pending verification |
| Logout Function | ⏳ | Pending verification |
| Role-Based Access | ⏳ | Pending verification |
| Page Refresh | ⏳ | Pending verification |
| Error Handling | ⏳ | Pending verification |
| Navigation Links | ⏳ | Pending verification |
| Mobile Menu | ⏳ | Pending verification |
| Cross-Tab Sync | ⏳ | Pending verification |

---

## Next Steps

1. **Run the application:**
   ```bash
   cd client
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

3. **Follow verification steps above**

4. **Document results and any issues found**

---

**Last Updated:** January 24, 2026
**Implementation Status:** ✅ Complete
**Verification Status:** ⏳ Pending
