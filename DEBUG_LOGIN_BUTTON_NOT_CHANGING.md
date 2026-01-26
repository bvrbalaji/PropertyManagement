# 🔧 Debug Guide: Login Button Not Changing to Logout

## Quick Diagnosis

If the login button is NOT changing to logout button after login, follow these steps:

---

## Step 1: Open Browser DevTools

Press `F12` and go to the **Console** tab

---

## Step 2: Login and Watch Console

1. Go to `http://localhost:3000/login`
2. Enter valid credentials
3. Click Login
4. **DO NOT CLOSE DEVTOOLS** - watch the console output
5. Expected console logs:
   ```
   [Login] Login successful, user: john@example.com
   [Login] userData stored in localStorage
   [Login] userLoggedIn event dispatched
   [Login] Redirecting to dashboard: ADMIN
   
   [Header] Mount: Token found immediately, setting logged in
   [Header] User name set to: John Doe
   [Header] Mount: User name set to: John Doe
   [Header] Checking auth - token: true role: ADMIN
   [Header] userData detected in localStorage, syncing...
   ```

---

## Step 3: Check Each Part

### Part A: Cookies
```
F12 → Application → Cookies → Look for:
✓ accessToken  (should have value)
✓ refreshToken (should have value)
✓ userRole     (should have value like "ADMIN")

If ANY are missing:
→ Problem is in login API or auth service
→ Check network tab for /auth/login response
```

### Part B: localStorage
```
F12 → Application → Local Storage → http://localhost:3000
Look for key: "userData"

If missing:
→ Problem is in login page
→ Check console for [Login] logs
→ Verify response.data.data.user exists
```

### Part C: Console Logs
```
F12 → Console

Look for [Header] prefix logs starting with "Mount:"

If NOT appearing:
→ Header component not mounting
→ Check for JavaScript errors
→ Refresh page and try again
```

---

## Step 4: Manual Check

In browser console, run these commands:

```javascript
// Check cookies
console.log('Cookies:', document.cookie)

// Check localStorage
console.log('userData:', localStorage.getItem('userData'))

// Check auth
console.log('Token:', Cookies.get('accessToken'))
console.log('Role:', Cookies.get('userRole'))
```

---

## Common Issues & Fixes

### Issue 1: No [Header] logs in console
**Problem:** Header component not mounting or not running checkAuth

**Solution:**
1. Refresh page: `Ctrl+F5`
2. Clear cache: `Ctrl+Shift+Delete`
3. Check for JavaScript errors (red text in console)

---

### Issue 2: Cookies exist but logout button doesn't show
**Problem:** checkAuth() is not being called or not updating state

**Solution:**
1. Try these in console:
```javascript
// Force check auth manually
window.location.reload()
```

2. If still doesn't work:
   - Check Application tab → Cookies
   - Verify accessToken has a value
   - Look for errors in console

---

### Issue 3: localStorage.userData exists but header still shows login
**Problem:** checkAuth() is not reading localStorage correctly

**Solution:**
1. In console, run:
```javascript
const userData = localStorage.getItem('userData')
console.log('userData:', userData)
if (userData) {
  console.log('Parsed:', JSON.parse(userData))
}
```

2. If userData is there:
   - Problem is in checkAuth() function
   - Try refreshing page

---

### Issue 4: All data looks correct but button still shows login
**Problem:** React state not updating

**Solution:**
1. Try hard refresh: `Ctrl+Shift+F5`
2. Close tab and reopen
3. Clear browser cache completely

---

## Advanced Debugging

### Check Request/Response
```
F12 → Network → Filter: "login"
Click on /auth/login request
Check "Response" tab

Should see:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "fullName": "...",
      "role": "ADMIN"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Add Temporary Debug Code
In Header.tsx, after line 20, add:
```typescript
useEffect(() => {
  console.log('[Header] STATE CHANGE:', {
    mounted,
    isLoggedIn,
    userName,
    userRole
  });
}, [mounted, isLoggedIn, userName, userRole]);
```

This will show state changes in console

---

## What Should Happen

### Timeline:
```
0s    User at /login
      ├─ Submits form
      └─ [Login] Login successful message appears

1s    Redirected to /dashboard/admin
      ├─ Page starts loading
      └─ Header component mounts

2s    Header checks auth
      ├─ [Header] Mount: Token found immediately
      ├─ [Header] User name set to: John Doe
      ├─ Cookies checked: ✓ accessToken found
      ├─ localStorage checked: ✓ userData found
      └─ State updated: isLoggedIn = true

3s    Component re-renders
      ├─ Checks condition: isLoggedIn = true?
      ├─ YES → Show logout button
      └─ LOGOUT BUTTON APPEARS ✓
```

---

## Expected Final State

After successful login, you should see:

**Browser:**
- URL: `http://localhost:3000/dashboard/admin` (or appropriate role)
- Header shows: `Welcome, John Doe` + `[Logout]` button
- Navigation menu visible

**DevTools Console:**
- Multiple `[Header]` log messages
- `[Login]` log messages from login page
- No red error messages

**DevTools Application:**
- Cookies: accessToken, refreshToken, userRole present
- Local Storage: userData key present with user object

**DevTools Network:**
- /auth/login request: 200 status
- Response includes user data and tokens

---

## Still Not Working?

1. **Check error messages:**
   - Are there red errors in console?
   - Screenshot them

2. **Try these steps:**
   - Clear all cookies: `Cookies.remove('accessToken')`
   - Clear localStorage: `localStorage.clear()`
   - Restart server: Stop `npm run dev` and restart
   - Hard refresh: `Ctrl+Shift+F5`

3. **Check API response:**
   - Go to Network tab
   - Click /auth/login
   - Check Response tab
   - Make sure it includes `user` object with `fullName`

4. **Check permissions:**
   - Are you using correct credentials?
   - Is account active in database?
   - Does user have a role assigned?

---

## Verification Checklist

- [ ] Login console shows `[Login]` messages
- [ ] Cookies appear in DevTools (accessToken, userRole)
- [ ] localStorage has userData key
- [ ] Header console shows `[Header]` Mount messages
- [ ] isLoggedIn state changes to true
- [ ] Logout button appears on page
- [ ] Dashboard content loads
- [ ] No red errors in console

---

## If Everything Fails

**Nuclear Option:**
1. Stop dev server
2. Delete node_modules: `rm -r node_modules`
3. Clear npm cache: `npm cache clean --force`
4. Reinstall: `npm install`
5. Restart: `npm run dev`
6. Try login again

---

## Still Stuck?

Check these files are modified correctly:

1. **Header.tsx:**
   - Has multiple useEffect hooks
   - Has checkAuth() function with useCallback
   - Condition `{isLoggedIn && ...}` for logout button
   - Condition `{!isLoggedIn && ...}` for login button

2. **login/page.tsx:**
   - Has `localStorage.setItem('userData', ...)`
   - Has `window.dispatchEvent(new Event('userLoggedIn'))`
   - Has 200ms delay before redirect

3. **auth.ts:**
   - login() function sets cookies
   - Cookies.set('accessToken', ...) called

---

**Debug Status: Ready to Investigate** 🔍

Follow these steps and you'll find the exact issue!
