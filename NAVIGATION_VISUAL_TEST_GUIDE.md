# 🗺️ Navigation System - Visual Testing Guide

## Quick Visual Inspection Checklist

### Header Appearance Check

**When NOT Logged In**:
```
❌ Header should NOT be visible on:
   - /login
   - /register
   - /forgot-password
   - /verify-otp
```

**When Logged In (ADMIN)**:
```
✅ Header should show:
   ┌──────────────────────────────────────────────┐
   │ 🏢 PropertyMgt │ Home Dashboard Reports │ Admin [Logout] │
   └──────────────────────────────────────────────┘
```

**When Logged In (TENANT)**:
```
✅ Header should show:
   ┌──────────────────────────────────────────────┐
   │ 🏢 PropertyMgt │ Home Dashboard Notifications │ User [Logout] │
   └──────────────────────────────────────────────┘
   
   Note: "Reports" menu item NOT VISIBLE
```

---

## Dashboard Visual Checks

### Admin Dashboard (/dashboard/admin)

**Should Display**:
```
┌─────────────────────────────────────────┐
│ Admin Dashboard                         │
├─────────────────────────────────────────┤
│ Stats Cards:                            │
│ ┌──────────────┬──────────────┐         │
│ │ Total Users  │  Properties  │         │
│ │     N        │      N       │         │
│ └──────────────┴──────────────┘         │
│                                         │
│ Quick Actions:                          │
│ ┌──────────────┬──────────────┐         │
│ │ 👥 User Mgmt │ 🏢 Properties│         │
│ └──────────────┴──────────────┘         │
│ ┌──────────────┐                        │
│ │ 📊 Reports   │                        │
│ └──────────────┘                        │
└─────────────────────────────────────────┘
```

✅ **What to Check**:
- [ ] Three quick action buttons visible
- [ ] "User Management" button doesn't give 404
- [ ] "Financial Reports" button navigates to /reports
- [ ] Stats cards show numbers

---

### Owner Dashboard (/dashboard/flat-owner)

**Should Display**:
```
┌──────────────────────────────────────────┐
│ Owner Dashboard                          │
├──────────────────────────────────────────┤
│ Tabs:                                    │
│ [Overview] [Properties] [Financial] [Profile] │
├──────────────────────────────────────────┤
│ Overview Tab Content:                    │
│ ├─ Owner Profile Info                    │
│ ├─ Properties List                       │
│ └─ Financial Summary                     │
└──────────────────────────────────────────┘
```

✅ **What to Check**:
- [ ] Tabs visible (Overview, Properties, Financial, Profile)
- [ ] Content changes when clicking tabs
- [ ] Header shows "Dashboard" link works
- [ ] Logout button works

---

### Tenant Dashboard (/dashboard/tenant)

**Should Display**:
```
┌──────────────────────────────────────────┐
│ Tenant Dashboard                         │
├──────────────────────────────────────────┤
│ My Apartment:                            │
│ ┌──────────────────────────────────────┐ │
│ │ Unit Number: [UnitNum]               │ │
│ │ Property: [PropertyName]              │ │
│ │ Owner: [OwnerName]                    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Quick Actions:                           │
│ ┌─────────────────┬─────────────────┐    │
│ │ 🔧 Maintenance  │ 💰 Pay Rent     │    │
│ └─────────────────┴─────────────────┘    │
└──────────────────────────────────────────┘
```

✅ **What to Check**:
- [ ] Apartment info displays
- [ ] Two action buttons visible
- [ ] Header shows "Dashboard" (no "Reports")
- [ ] Notifications visible in header

---

### Maintenance Dashboard (/dashboard/maintenance)

**Should Display**:
```
┌──────────────────────────────────────────┐
│ Maintenance Staff Dashboard              │
├──────────────────────────────────────────┤
│ Pending Requests:                        │
│ ┌──────────────────────────────────────┐ │
│ │ Request Title                        │ │
│ │ Description...                       │ │
│ │ Requested by: [TenantName]           │ │
│ │ Priority: [HIGH/NORMAL]              │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [View All Requests Button]               │
└──────────────────────────────────────────┘
```

✅ **What to Check**:
- [ ] Pending requests display
- [ ] Request cards show info
- [ ] Priority badges visible
- [ ] "View All Requests" button visible
- [ ] Header shows correct role

---

## Landing Page Visual Checks

### Unauthenticated View

**Should Display**:
```
┌────────────────────────────────────────┐
│ 🏢 Property Management System           │
│ Complete solution for managing...      │
│                                        │
│ [Login Button]  [Register Button]      │
│                                        │
│ Feature Cards:                         │
│ ┌──────────┬──────────┬──────────┬──┐  │
│ │ 👥 Roles │ 🔐 Auth  │ 📊 Reports   │  │
│ │ Multi    │ JWT & MFA│ Financial    │  │
│ └──────────┴──────────┴──────────┴──┘  │
│ ┌──────────┐                          │
│ │ 🔔 Notif │                          │
│ │ Multi    │                          │
│ └──────────┘                          │
└────────────────────────────────────────┘
```

✅ **What to Check**:
- [ ] Login button visible and clickable
- [ ] Register button visible and clickable
- [ ] Feature cards display 4 items
- [ ] No role badge shown
- [ ] No logout button visible
- [ ] Header NOT visible

---

### Authenticated View (Logged In)

**Should Display**:
```
┌────────────────────────────────────────────┐
│ Welcome back! [UserName]         [🔴 ADMIN] │
├────────────────────────────────────────────┤
│ Quick Access:                              │
│ ┌──────────┬──────────┬──────────┐         │
│ │ 👥 User  │ 📊 Report│ 🏢 Props │         │
│ │ Mgmt     │ Financial│ Mgmt     │         │
│ └──────────┴──────────┴──────────┘         │
│ ┌──────────┬──────────┐                   │
│ │ 🔧 Maint │ 📋 Onboa │                   │
│ │ Requests │ rding    │                   │
│ └──────────┴──────────┘                   │
│                                            │
│ Your Role: System Administrator            │
│ ✓ Manage all users and roles              │
│ ✓ Access comprehensive reports            │
│ ✓ Monitor all properties and tenants      │
│ ✓ View financial analytics                │
└────────────────────────────────────────────┘
```

✅ **What to Check**:
- [ ] Welcome message shows name
- [ ] Role badge displays correctly (color-coded)
- [ ] Feature cards show (role-based)
- [ ] Feature description shows capabilities
- [ ] Header visible with Home, Dashboard, Reports, Notifications
- [ ] Header shows logout button (NOT in content)

---

## Role Badge Color Verification

**Visual Color Check**:
```
ADMIN:                  🔴 Red Background
┌──────────────────────┐
│ System Administrator │
└──────────────────────┘

FLAT_OWNER:             🔵 Blue Background
┌──────────────────────┐
│ Flat/Property Owner  │
└──────────────────────┘

TENANT:                 🟢 Green Background
┌──────────────────────┐
│ Tenant               │
└──────────────────────┘

MAINTENANCE_STAFF:      🟡 Yellow Background
┌──────────────────────┐
│ Maintenance Staff    │
└──────────────────────┘
```

✅ **What to Check**:
- [ ] Login as ADMIN → Red badge
- [ ] Login as OWNER → Blue badge
- [ ] Login as TENANT → Green badge
- [ ] Login as STAFF → Yellow badge

---

## Navigation Flow Visual Test

### Flow 1: Login → Admin Dashboard → Logout

```
Start
  ↓
[http://localhost:3000/login]
  ↓
Enter credentials, click Login
  ↓
✅ Redirect to /dashboard/admin (FIXED)
  ↓
Admin Dashboard displays
  ├─ Header shows: Home, Dashboard, Reports, Notifications
  ├─ Stats cards visible
  └─ Quick action buttons visible
  ↓
Click "Financial Reports" button
  ↓
✅ Navigate to /reports (FIXED)
  ↓
Reports page displays
  ↓
Click "Home" in header
  ↓
✅ Go to / (landing page)
  ↓
Landing page displays (authenticated view)
  ├─ Role badge shows
  ├─ Feature cards show
  └─ Only ONE logout button (in header) ✅ (FIXED)
  ↓
Click "Logout" button in header
  ↓
✅ Redirect to /login (FIXED)
✅ All cookies cleared (FIXED)
  ↓
Login page displays
```

---

### Flow 2: Login → Owner Dashboard → Reports → Logout

```
Login as OWNER
  ↓
✅ Redirect to /dashboard/flat-owner
  ↓
Owner Dashboard displays
  ├─ Role badge: Blue (FLAT_OWNER)
  └─ Tabs: Overview, Properties, Financial, Profile
  ↓
Click "Reports" in header
  ↓
✅ Navigate to /reports
  ↓
Reports page displays
  ├─ Reports Hub shows
  └─ Header shows: Home, Dashboard, Reports, Notifications
  ↓
Click "Dashboard" in header
  ↓
✅ Go back to /dashboard/flat-owner
  ↓
Click "Logout"
  ↓
✅ Redirect to /login
✅ All tokens cleared
```

---

## Mobile View Visual Checks

### Mobile Header (< 768px width)

**Should Show**:
```
┌──────────────────┐
│ 🏢 Prop ☰ │ User [Logout] │
└──────────────────┘
```

**When Hamburger Clicked**:
```
┌──────────────────┐
│ 🏢 Prop ☰ │ User [Logout] │
├──────────────────┤
│ Home             │
│ Dashboard        │
│ Reports          │ (if applicable)
│ Notifications    │
└──────────────────┘
```

✅ **What to Check**:
- [ ] Hamburger menu icon visible on mobile
- [ ] Click hamburger → menu slides in
- [ ] Click menu item → navigates correctly
- [ ] Menu closes after navigation
- [ ] All menu items accessible
- [ ] Logout works on mobile

---

## Feature Card Navigation Visual Check

### All Feature Cards (Role-Based)

**Admin Should See**:
```
┌────────────┬────────────┬────────────┐
│ 👥 User    │ 📊 Financial│ 🏢 Property│
│ Management │ Reports    │ Management │
├────────────┼────────────┼────────────┤
│ 🔧 Maint.  │            │            │
│ Requests   │            │            │
└────────────┴────────────┴────────────┘

Action: Click each → Should navigate correctly
```

**Owner Should See**:
```
┌────────────┬────────────┬────────────┐
│ 📊 Financial│ 🏢 Property│ 🏠 Owner   │
│ Reports    │ Management │ Dashboard  │
├────────────┼────────────┼────────────┤
│ 📋 Tenant  │            │            │
│ Onboarding │            │            │
└────────────┴────────────┴────────────┘

Action: Click each → Should navigate correctly
```

**Tenant Should See**:
```
┌────────────┬────────────┐
│ 📄 My      │ 💰 Rent    │
│ Dashboard  │ Payment    │
└────────────┴────────────┘

Action: Click each → Should navigate correctly
```

**Staff Should See**:
```
┌────────────┐
│ 🛠️ Maint.  │
│ Dashboard  │
└────────────┘

Action: Click → Should navigate to /dashboard/maintenance
```

---

## Error State Visual Checks

### Login Error

**Should Display**:
```
┌──────────────────────────────────────┐
│ ❌ Invalid credentials               │
│ (Red toast notification)             │
└──────────────────────────────────────┘

And: Stay on /login page
```

### Logout Error (If API fails)

**Should Display**:
```
✅ Still logs out (graceful fallback)
✅ Clears cookies anyway
✅ Redirects to /login
✅ Error logged to console
```

### 404 Page (Invalid Route)

**Should NOT See**:
```
❌ /admin/users → 404 (OLD - FIXED)
❌ /admin/properties → 404 (OLD - FIXED)
❌ /admin/reports → 404 (OLD - FIXED)

These routes no longer exist - buttons fixed ✅
```

---

## Cookie Verification (DevTools)

### After Successful Login

**In DevTools → Application → Cookies**:
```
Cookie Name          Value                    Expires
──────────────────────────────────────────────────────
accessToken         eyJ0eXAiOiJKV1QiLCI... 1 day
refreshToken        eyJ0eXAiOiJKV1QiLCI... 7 days
userRole            ADMIN                  1 day
```

✅ **What to Check**:
- [ ] accessToken exists
- [ ] refreshToken exists
- [ ] userRole matches login role
- [ ] All have expiration times

### After Logout

**In DevTools → Application → Cookies**:
```
All three cookies should be GONE
✅ accessToken removed
✅ refreshToken removed
✅ userRole removed
```

---

## Console Verification (DevTools Console)

### Should See:
```
✅ No errors
✅ No warnings (except deprecation)
✅ Page loads cleanly
```

### Should NOT See:
```
❌ "Cannot read property 'user' of undefined"
❌ "404 Not Found"
❌ "Navigation failed"
❌ "Cannot dispatch on undefined router"
```

---

## Step-by-Step Visual Verification

### Test 1: Admin Quick Actions (2 minutes)
```
1. ☐ Login as admin
2. ☐ Go to /dashboard/admin
3. ☐ Find "Quick Actions" section
4. ☐ See 3 buttons (User Mgmt, Properties, Reports)
5. ☐ Click "User Management" 
   Expected: Button click works, stays on /dashboard/admin
6. ☐ Click "Properties"
   Expected: Button click works, stays on /dashboard/admin  
7. ☐ Click "Financial Reports"
   Expected: Navigate to /reports successfully
   
Result: ✅ PASS / ❌ FAIL
```

### Test 2: Logout Button (1 minute)
```
1. ☐ Scroll page
2. ☐ Count logout buttons
   Expected: Exactly 1 (in header only)
3. ☐ Click logout
   Expected: Redirect to /login, all cookies cleared
   
Result: ✅ PASS / ❌ FAIL
```

### Test 3: Mobile Navigation (2 minutes)
```
1. ☐ Resize browser to 375px width
2. ☐ See hamburger menu icon
3. ☐ Click hamburger
4. ☐ See menu items slide in
5. ☐ Click "Home"
   Expected: Navigate to /, menu closes
6. ☐ Click hamburger again
7. ☐ Click "Dashboard"
   Expected: Navigate to dashboard, menu closes
   
Result: ✅ PASS / ❌ FAIL
```

---

## Visual Summary Checklist

- [ ] Header appears on authenticated pages only
- [ ] Header hidden on login/register/forgot-password pages
- [ ] Navigation menu filters by role
- [ ] Feature cards show correct roles only
- [ ] Role badges show correct colors
- [ ] Only ONE logout button (in header)
- [ ] All navigation links work (no 404 errors)
- [ ] Mobile hamburger menu works
- [ ] Logout clears cookies and redirects
- [ ] Feature navigation works correctly
- [ ] Dashboard shows correct quick actions
- [ ] Admin quick actions all work (not 404)

---

**Test Status**: Ready to Verify ✅  
**Duration**: ~10-15 minutes for complete verification  
**Success Criteria**: All checks pass
