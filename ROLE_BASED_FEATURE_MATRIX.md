# Role-Based Feature Matrix & Navigation Map

## 🗺️ Complete Navigation Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE (/)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Unauthenticated Users              Authenticated Users             │
│  ┌─────────────────────┐             ┌──────────────────────┐       │
│  │ • Hero Section      │             │ • Welcome Message    │       │
│  │ • Features Overview │    ────→    │ • Quick Access Cards │       │
│  │ • Login/Register    │             │ • Role Capabilities  │       │
│  │   CTA Buttons       │             │ • Role Badge Display │       │
│  └─────────────────────┘             └──────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ↓               ↓               ↓
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ ADMIN ROLE   │  │ OWNER ROLE   │  │ STAFF ROLE   │
            └──────────────┘  └──────────────┘  └──────────────┘
                    │               │               │
                    ↓               ↓               ↓
            [Admin Dashboard] [Owner Dashboard] [Maintenance Dashboard]
```

---

## 📊 Feature Matrix by Role

### ADMIN (System Administrator)
```
┌──────────────────────────────────────────────────────────┐
│                   ADMIN DASHBOARD                        │
│                 /dashboard/admin                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Quick Access Features:                                 │
│  ┌─────────────────┬─────────────────┬─────────────────┐│
│  │ 👥 User Mgmt    │ 📊 Reports      │ 🏢 Properties   ││
│  │ View, create,   │ Financial data, │ Manage units,   ││
│  │ manage all      │ analytics       │ occupancy       ││
│  │ users & roles   │                 │                 ││
│  └─────────────────┴─────────────────┴─────────────────┘│
│  ┌─────────────────┐                                    │
│  │ 🔧 Maintenance  │                                    │
│  │ View & manage   │                                    │
│  │ all requests    │                                    │
│  └─────────────────┘                                    │
│                                                          │
│  Additional Access:                                     │
│  • Financial Reports (/reports)                         │
│  • Notifications (/notifications)                       │
│  • All system dashboards & analytics                    │
│                                                          │
│  Capabilities:                                          │
│  ✓ Manage all users and roles                           │
│  ✓ Access comprehensive reports                         │
│  ✓ Monitor all properties and tenants                   │
│  ✓ View financial analytics                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### FLAT_OWNER (Property Owner)
```
┌──────────────────────────────────────────────────────────┐
│                 OWNER DASHBOARD                          │
│              /dashboard/flat-owner                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Quick Access Features:                                 │
│  ┌─────────────────┬─────────────────┬─────────────────┐│
│  │ 🏠 Owner Dash   │ 📊 Reports      │ 📋 Onboarding  ││
│  │ Manage your     │ View income,    │ Handle tenant   ││
│  │ properties &    │ expenses,       │ onboarding &    ││
│  │ financials      │ analytics       │ offboarding     ││
│  └─────────────────┴─────────────────┴─────────────────┘│
│                                                          │
│  Additional Access:                                     │
│  • Financial Reports (/reports)                         │
│  • Notifications (/notifications)                       │
│  • Property details & tenant info                       │
│                                                          │
│  Capabilities:                                          │
│  ✓ Manage your properties                               │
│  ✓ Handle tenant onboarding                             │
│  ✓ View financial reports                               │
│  ✓ Track rental income                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### TENANT (Renter)
```
┌──────────────────────────────────────────────────────────┐
│                 TENANT DASHBOARD                         │
│                /dashboard/tenant                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Quick Access Features:                                 │
│  ┌─────────────────┬─────────────────┐                  │
│  │ 📄 My Dashboard │ 💰 Rent Payment ││                  │
│  │ View lease info,│ Pay rent,       ││                  │
│  │ property info   │ track payments  ││                  │
│  └─────────────────┴─────────────────┘                  │
│                                                          │
│  Additional Access:                                     │
│  • Maintenance Requests (from dashboard)                │
│  • Notifications (/notifications)                       │
│  • Payment history & receipts                           │
│                                                          │
│  Capabilities:                                          │
│  ✓ View your lease information                          │
│  ✓ Pay rent online                                      │
│  ✓ Submit maintenance requests                          │
│  ✓ Track request status                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### MAINTENANCE_STAFF (Support Staff)
```
┌──────────────────────────────────────────────────────────┐
│            MAINTENANCE DASHBOARD                         │
│              /dashboard/maintenance                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Quick Access Features:                                 │
│  ┌─────────────────────────────────────┐                │
│  │ 🛠️ Maintenance Dashboard            │                │
│  │ View assigned tasks, update status, │                │
│  │ add notes & photos                  │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  Additional Access:                                     │
│  • Notifications (/notifications)                       │
│  • Task details & history                               │
│  • Property information                                 │
│                                                          │
│  Capabilities:                                          │
│  ✓ View assigned maintenance tasks                      │
│  ✓ Update request status                                │
│  ✓ Add work notes and photos                            │
│  ✓ Track task completion                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔗 Navigation Routes

### Public Routes (No Authentication Required)
```
/                      → Landing Page (unauthenticated view)
/login                 → User Login
/register              → User Registration
/forgot-password       → Password Reset Request
/verify-otp            → OTP Verification
```

### Protected Routes (Requires Authentication)
```
/                      → Landing Page (authenticated view, role-based)
/dashboard/admin       → Admin Dashboard (ADMIN only)
/dashboard/flat-owner  → Owner Dashboard (FLAT_OWNER only)
/dashboard/tenant      → Tenant Dashboard (TENANT only)
/dashboard/maintenance → Maintenance Dashboard (MAINTENANCE_STAFF only)
/reports              → Financial Reports (ADMIN, FLAT_OWNER)
/notifications        → Notification Center (All authenticated users)
```

---

## 🎯 Feature Availability Matrix

```
┌──────────────────────┬────────┬──────────┬────────┬───────────┐
│ Feature              │ Admin  │  Owner   │ Tenant │   Staff   │
├──────────────────────┼────────┼──────────┼────────┼───────────┤
│ User Management      │   ✅   │    ❌    │   ❌   │    ❌     │
│ Financial Reports    │   ✅   │    ✅    │   ❌   │    ❌     │
│ Property Management  │   ✅   │    ✅    │   ❌   │    ❌     │
│ Maintenance Requests │   ✅   │    ❌    │   ❌   │    ✅     │
│ Tenant Onboarding    │   ✅   │    ✅    │   ❌   │    ❌     │
│ Rent Payment         │   ✅   │    ❌    │   ✅   │    ❌     │
│ Notifications        │   ✅   │    ✅    │   ✅   │    ✅     │
│ Dashboard Access     │   ✅   │    ✅    │   ✅   │    ✅     │
└──────────────────────┴────────┴──────────┴────────┴───────────┘
```

---

## 🔀 Navigation Flow Diagram

```
START (User Opens App)
    │
    ├─ Has Valid Token? ──NO──→ Unauthenticated Landing Page
    │                           ├─ Click Register
    │                           │  └─ Go to /register
    │                           ├─ Click Login
    │                           │  └─ Go to /login
    │                           └─ Head Navigation Hidden
    │
    └─ YES ──→ Check User Role
                   │
        ┌──────────┼──────────┬──────────┬──────────┐
        │          │          │          │          │
        ↓          ↓          ↓          ↓          ↓
      ADMIN      OWNER      TENANT     STAFF    (Invalid)
        │          │          │          │          │
        ↓          ↓          ↓          ↓          ↓
    Authenticated Landing Page
    (Role-Based Features Displayed)
        │
        ├─ Admin Dashboard ──→ /dashboard/admin
        ├─ Owner Dashboard ──→ /dashboard/flat-owner
        ├─ Tenant Dashboard ──→ /dashboard/tenant
        ├─ Staff Dashboard ──→ /dashboard/maintenance
        ├─ Reports ──→ /reports
        └─ Notifications ──→ /notifications
        
    Header Shows:
    • Role Badge (Color-Coded)
    • User Welcome Message
    • Navigation Menu (Role-Based)
    • Logout Button
    
    Logout Action:
    • Remove all tokens
    • Redirect to /login
    • Clear localStorage
```

---

## 🎨 Color Coding

```
Role Badges:
┌──────────────────────┬──────────┐
│ ADMIN                │ 🔴 Red   │
│ FLAT_OWNER           │ 🔵 Blue  │
│ TENANT               │ 🟢 Green │
│ MAINTENANCE_STAFF    │ 🟡 Yellow│
└──────────────────────┴──────────┘
```

---

## 📱 Responsive Behavior

### Desktop (≥768px)
```
Header:
┌─────────────────────────────────────────────┐
│ 🏢 PropertyMgt │ Home Dashboard Reports │ User [Logout] │
└─────────────────────────────────────────────┘

Full navigation visible
All feature cards displayed in 3-column grid
Sidebar available for dashboards
```

### Tablet (768px - 1024px)
```
Header:
┌─────────────────────────────────────────┐
│ 🏢 Property │ Home Dashboard Reports │ User [Logout] │
└─────────────────────────────────────────┘

Navigation visible
Feature cards in 2-column grid
```

### Mobile (<768px)
```
Header:
┌─────────────────────────────┐
│ 🏢 Prop ☰ │ User [Logout]    │
├─────────────────────────────┤
│ Home                        │
│ Dashboard                   │
│ Reports (if applicable)     │
│ Notifications               │
└─────────────────────────────┘

Hamburger menu for navigation
Feature cards in 1-column grid
Stacked layout for dashboards
```

---

## 🔐 Access Control

### Authentication Layer
```
1. Check JWT Token (Cookies)
   ├─ Valid → Continue
   └─ Invalid → Redirect to /login

2. Check User Role (Cookies)
   ├─ Role exists → Proceed
   └─ Role missing → Redirect to /login

3. Filter Features by Role
   ├─ Frontend filtering (UX)
   └─ Backend validation (Security)

4. Display Role-Specific UI
   ├─ Navigation menu
   ├─ Feature cards
   └─ Capabilities description
```

---

## 📊 Data Flow

```
User Registration:
Role Selected → Stored in DB → Token Generated → Role in Cookie
                                                        ↓
                                            Page Renders Features
                                                        ↓
                                            filter(f => f.roles.includes(userRole))
                                                        ↓
                                            Display Role-Specific UI

User Login:
Email/Pass → Auth API → JWT Token → Stored in Cookie
                            ↓
                        Role Retrieved → Page Renders Features
```

---

## 🚀 Quick Navigation Links

### For ADMIN
- **Dashboard**: `/dashboard/admin`
- **Reports**: `/reports`
- **Notifications**: `/notifications`

### For FLAT_OWNER
- **Dashboard**: `/dashboard/flat-owner`
- **Reports**: `/reports`
- **Notifications**: `/notifications`

### For TENANT
- **Dashboard**: `/dashboard/tenant`
- **Notifications**: `/notifications`

### For MAINTENANCE_STAFF
- **Dashboard**: `/dashboard/maintenance`
- **Notifications**: `/notifications`

---

## ✅ Verification Checklist

- [x] All roles have dedicated dashboard
- [x] Features correctly filtered by role
- [x] Navigation menu shows role-based items
- [x] Quick access cards link correctly
- [x] Header hidden on auth pages
- [x] Logout functionality works
- [x] Mobile responsive design
- [x] Color-coded role badges
- [x] Welcome message displays
- [x] Active link highlighting works

---

## 🎯 Key Takeaways

1. **Single Landing Page** - Serves all users, adapts to role
2. **Dynamic Navigation** - Shows features relevant to user
3. **Role-Based Access** - Features filtered before display
4. **Responsive Design** - Works on all device sizes
5. **User-Friendly** - Clear role identification and capabilities
6. **Secure** - Token and role validation on every page
7. **Easy to Extend** - Simple to add new roles or features

---

**Created**: 2026-01-23
**Status**: Complete ✅
**Version**: 1.0.0
