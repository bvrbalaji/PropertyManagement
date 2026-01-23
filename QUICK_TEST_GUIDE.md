# Quick Test Guide: Frontend Landing Page & Navigation

## 🚀 Quick Start

### Server Status
- ✅ Backend: Running on port 5000
- ✅ Frontend: Running on port 3000
- ✅ Database: Initialized and migrated

### Access the Application
```
http://localhost:3000
```

---

## 🧪 Test Scenarios

### Scenario 1: View Landing Page (Unauthenticated)
**Expected**: Hero section with Login/Register buttons

```
1. Open http://localhost:3000 (without login)
2. Should see:
   ✓ "🏢 Property Management System" title
   ✓ "Complete solution for managing properties..." subtitle
   ✓ Blue "Login" button
   ✓ White "Register" button
   ✓ Feature cards (Multi-Role Support, Secure Auth, etc.)
```

### Scenario 2: Register as ADMIN
**Expected**: Admin dashboard with admin features

```
1. Click "Register" button
2. Fill form:
   - Email: admin@test.com
   - Password: Admin123!
   - Full Name: Admin User
   - Role: Select "ADMIN"
   - Phone: 9876543210
3. Click Register
4. Should redirect to login
5. Login with credentials
6. Should see dashboard with:
   ✓ Welcome message: "Welcome back! Admin User"
   ✓ Red "System Administrator" badge
   ✓ Admin feature cards:
     - 👥 User Management
     - 📊 Financial Reports
     - 🏢 Property Management
     - 🔧 Maintenance Requests
   ✓ Admin capabilities list (4 items)
```

### Scenario 3: Register as FLAT_OWNER
**Expected**: Owner dashboard with owner features

```
1. Register new user:
   - Email: owner@test.com
   - Password: Owner123!
   - Full Name: Property Owner
   - Role: Select "FLAT_OWNER"
   - Phone: 9876543211
2. Login
3. Should see dashboard with:
   ✓ Welcome message with owner name
   ✓ Blue "Flat/Property Owner" badge
   ✓ Owner feature cards:
     - 🏠 Owner Dashboard
     - 📊 Financial Reports
     - 📋 Tenant Onboarding
   ✓ Owner capabilities list (4 items)
```

### Scenario 4: Register as TENANT
**Expected**: Tenant dashboard with tenant features

```
1. Register new user:
   - Email: tenant@test.com
   - Password: Tenant123!
   - Full Name: John Tenant
   - Role: Select "TENANT"
   - Phone: 9876543212
2. Login
3. Should see dashboard with:
   ✓ Welcome message with tenant name
   ✓ Green "Tenant" badge
   ✓ Tenant feature cards:
     - 📄 Tenant Dashboard
     - 💰 Rent Payment
   ✓ Tenant capabilities list (4 items)
```

### Scenario 5: Register as MAINTENANCE_STAFF
**Expected**: Maintenance staff dashboard with staff features

```
1. Register new user:
   - Email: staff@test.com
   - Password: Staff123!
   - Full Name: Maintenance Staff
   - Role: Select "MAINTENANCE_STAFF"
   - Phone: 9876543213
2. Login
3. Should see dashboard with:
   ✓ Welcome message with staff name
   ✓ Yellow "Maintenance Staff" badge
   ✓ Maintenance feature cards:
     - 🛠️ Maintenance Dashboard
   ✓ Maintenance capabilities list (4 items)
```

### Scenario 6: Test Navigation Header
**Expected**: Header visible on all pages except auth pages

```
1. Login as any user
2. Go to home page (/)
3. Should see header with:
   ✓ 🏢 PropertyMgt logo on left
   ✓ Home link
   ✓ Dashboard link
   ✓ Reports link (if applicable)
   ✓ Notifications link
   ✓ Welcome message with username
   ✓ Red "Logout" button
4. Click other menu items - header should remain visible
5. Go to /login or /register - header should NOT be visible
```

### Scenario 7: Test Mobile Navigation
**Expected**: Hamburger menu appears on mobile

```
1. Open dev tools (F12)
2. Toggle device toolbar (mobile view)
3. Screen should show:
   ✓ Hamburger menu icon (☰)
   ✓ Logo on left
   ✓ Username and Logout on right
4. Click hamburger menu:
   ✓ Menu should expand
   ✓ Should show all navigation links
   ✓ Links should be clickable
5. Click on a link:
   ✓ Menu should collapse
   ✓ Navigation should work
```

### Scenario 8: Test Quick Access Navigation
**Expected**: Feature cards link to correct pages

```
1. Login as ADMIN
2. Click on "User Management" card
   - Should navigate to /dashboard/admin
3. Click on "Financial Reports" card
   - Should navigate to /reports
4. Click on "Property Management" card
   - Should navigate to /dashboard/admin
5. Click on "Notifications" card
   - Should navigate to /notifications
```

### Scenario 9: Test Logout
**Expected**: Logout removes auth and returns to login

```
1. Login as any user
2. Click "Logout" button
3. Should redirect to /login
4. Check browser console (F12 → Application → Cookies):
   ✓ accessToken should be removed
   ✓ refreshToken should be removed
   ✓ userRole should be removed
5. Go to home (/)
   - Should see unauthenticated landing page
```

### Scenario 10: Test Active Page Highlighting
**Expected**: Current page highlighted in navigation

```
1. Login and go to home page
2. Header should show "Home" link highlighted in blue
3. Click "Dashboard" link
4. "Dashboard" link should now be highlighted
5. Click "Notifications" link
6. "Notifications" link should now be highlighted
```

---

## 🎯 Expected Features by Role

### ADMIN Features
```
✓ User Management
✓ Financial Reports
✓ Property Management
✓ Maintenance Requests
✓ Notifications
```

### FLAT_OWNER Features
```
✓ Owner Dashboard
✓ Financial Reports
✓ Tenant Onboarding
✓ Notifications
```

### TENANT Features
```
✓ Tenant Dashboard
✓ Rent Payment
✓ Maintenance Requests (via dashboard)
✓ Notifications
```

### MAINTENANCE_STAFF Features
```
✓ Maintenance Dashboard
✓ Maintenance Requests
✓ Notifications
```

---

## 🔍 Debugging Tips

### If landing page doesn't show features:
```
1. Check browser console (F12) for errors
2. Verify token is stored: F12 → Application → Cookies
3. Clear cookies and login again
4. Check if getUserRole() is working
```

### If navigation header is missing:
```
1. Check that you're not on an auth page (/login, /register)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)
4. Check for JavaScript errors (F12 → Console)
```

### If role-based features don't show:
```
1. Verify role is set correctly in registration
2. Check localStorage (F12 → Application → Local Storage)
3. Verify user role matches feature roles array
4. Clear cache and re-login
```

### If links don't work:
```
1. Check that backend API is running (port 5000)
2. Verify endpoints exist in backend
3. Check API response in Network tab (F12)
4. Look for CORS errors in console
```

---

## 📊 Test Checklist

- [ ] Unauthenticated landing page displays correctly
- [ ] Register button works
- [ ] Register flow creates user with correct role
- [ ] Login redirects to authenticated dashboard
- [ ] Admin features display for admin role
- [ ] Owner features display for flat owner role
- [ ] Tenant features display for tenant role
- [ ] Staff features display for maintenance staff role
- [ ] Header displays on authenticated pages
- [ ] Header hidden on auth pages
- [ ] Navigation links work correctly
- [ ] Quick access cards navigate correctly
- [ ] Logout removes tokens and redirects
- [ ] Mobile hamburger menu works
- [ ] Active link highlighting works
- [ ] User name displays correctly
- [ ] Role badge displays with correct color
- [ ] All feature cards display with emojis
- [ ] Responsive design works on mobile
- [ ] No console errors

---

## 🎉 Success Criteria

All tests pass when:
- ✅ Each role sees only their features
- ✅ Navigation works smoothly between pages
- ✅ Features display correct information
- ✅ Mobile view is fully responsive
- ✅ No console errors appear
- ✅ Logout works correctly
- ✅ User information persists correctly
- ✅ Header shows/hides appropriately

---

**Last Updated**: 2026-01-23
**Version**: 1.0
**Status**: Ready for Testing ✅
