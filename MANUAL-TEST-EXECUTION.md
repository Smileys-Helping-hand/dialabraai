# Manual Test Execution Guide

## Prerequisites Checklist

Before running tests, verify:

- [ ] Dev server running: `npm run dev` from project root
- [ ] Server accessible at `http://localhost:3000`
- [ ] Test accounts created in Firebase
- [ ] Database is connected
- [ ] All env vars properly set in `.env.local`

---

## Quick Smoke Tests (5 minutes)

Run these first to ensure basic functionality:

### Smoke Test 1: Home Page Loads
```
Action: Navigate to http://localhost:3000
Expected Results:
  ✅ Page loads in < 2 seconds
  ✅ Dark theme visible
  ✅ Shop cards are visible
  ✅ No console errors (F12 → Console)
  ✅ Logo and branding visible
  ✅ Search/filter controls visible
```

### Smoke Test 2: API Endpoints Respond
```
Action: Open developer tools → Network tab
Action: Refresh page
Expected Results:
  ✅ /api/shops/list responds with 200
  ✅ Response contains JSON array
  ✅ No network errors (red X on requests)
  ✅ CSS/JS assets load (200 status)
```

### Smoke Test 3: Navigation Works
```
Action: Click on a shop card
Expected Results:
  ✅ Shop detail page loads
  ✅ Shop name displays
  ✅ Menu items show
  ✅ "Add to Cart" buttons visible
  ✅ Can go back to marketplace
```

---

## Full Test Scenarios (60 minutes total)

### Test Scenario 1: Customer Complete Flow (20 minutes)

**Setup:**
- Clear browser cookies/localStorage
- Have test shop available with menu items

**Test Steps:**

1. **Marketplace Access**
   - [ ] Can view home page without login
   - [ ] Can see multiple shops
   - [ ] Can filter by category
   - [ ] Can search for shops
   - [ ] Visual changes visible (dark theme, animations)

2. **Create Account**
   - [ ] Click "Sign In" or account button
   - [ ] Click "New here? Create an account"
   - [ ] Enter email: `customer1@test.com`
   - [ ] Enter password: `TestPass123!`
   - [ ] Account created successfully
   - [ ] Logged in automatically

3. **Browse & Order**
   - [ ] Click on a shop
   - [ ] View menu items
   - [ ] Add 2-3 items to cart
   - [ ] Cart notification appears
   - [ ] Click cart button (bottom right)
   - [ ] Cart shows all items
   - [ ] Can modify quantities
   - [ ] Total price calculates correctly

4. **Checkout**
   - [ ] Click "Proceed to Checkout"
   - [ ] Fill customer name
   - [ ] Fill phone number
   - [ ] View order summary
   - [ ] Create order successfully
   - [ ] Redirected to success/confirmation page
   - [ ] Order has unique ID
   - [ ] Status shows as "Pending"

5. **Order Tracking**
   - [ ] Click account → "My Orders"
   - [ ] See the order just created
   - [ ] Can click order to see details
   - [ ] Shows correct items and total
   - [ ] Cannot see other customers' orders

6. **Visual Verification**
   - [ ] Dark theme applied throughout
   - [ ] Glass morphism effects visible on cards
   - [ ] Animations smooth (add to cart, modals)
   - [ ] Mobile responsive (test with device toolbar)
   - [ ] All text readable
   - [ ] Images load properly

**Pass Criteria:** All checkboxes checked = ✅ PASS

---

### Test Scenario 2: Shop Owner Dashboard (20 minutes)

**Setup:**
- Have shop in database: `test-shop-1` with `owner1@test.com`
- Have orders in system for this shop

**Test Steps:**

1. **Login**
   - [ ] Click account → "Sign In"
   - [ ] Enter email: `owner1@test.com`
   - [ ] Enter password: `TestPass123!`
   - [ ] Logged in successfully
   - [ ] Account shows owner email

2. **Access Dashboard**
   - [ ] Click account → "Admin Dashboard"
   - [ ] See shop name in header
   - [ ] Dashboard loads (takes < 2s)
   - [ ] Shows today's revenue
   - [ ] Shows order count
   - [ ] Shows best-selling items

3. **View Orders**
   - [ ] Click "Orders" or similar menu
   - [ ] See list of orders for own shop
   - [ ] Cannot see orders from other shops
   - [ ] Orders show customer name, items, status
   - [ ] Can filter by status

4. **Update Order**
   - [ ] Click on an order
   - [ ] Change status to "Ready"
   - [ ] Status updates immediately
   - [ ] Order list reflects change
   - [ ] Changes persist on page reload

5. **Manage Menu**
   - [ ] Click "Menu" or "Menu Management"
   - [ ] See existing menu items
   - [ ] Can add new item (name, price, category, image)
   - [ ] New item appears in list
   - [ ] Can edit item (change price, description)
   - [ ] Can delete item
   - [ ] Cannot see/edit other shops' menus

6. **Check Settings**
   - [ ] Click "Shop Setup" or "Settings"
   - [ ] See shop name, description
   - [ ] See colors (primary, accent, cream, charcoal)
   - [ ] Can update values
   - [ ] Changes save successfully
   - [ ] Changes reflect on public shop page

7. **Data Isolation**
   - [ ] Logout
   - [ ] Login as `owner2@test.com` for `test-shop-2`
   - [ ] See different shop data
   - [ ] Cannot access owner1's data
   - [ ] Completely separate dashboards

**Pass Criteria:** All checkboxes checked = ✅ PASS

---

### Test Scenario 3: Permission Boundary Tests (10 minutes)

**Test 1: Customer Cannot Access Admin**
```
Logged in as: customer@test.com
Action: Navigate to http://localhost:3000/admin
Expected: ❌ Access denied or redirected
Expected: Customer sees error/redirect, not admin panel
```

**Test 2: Owner Cannot See Other Owner's Data**
```
Logged in as: owner1@test.com (test-shop-1)
Action: View orders in admin
Expected: ✅ See only test-shop-1 orders
Action: Logout, login as owner2@test.com
Expected: ✅ See only test-shop-2 orders
Expected: Cannot access owner1's shop data
```

**Test 3: Logout & Re-Login**
```
Action: Click account → Logout
Expected: ✅ Logged out
Expected: Redirected to home
Expected: Cannot access admin
Action: Log back in
Expected: ✅ Can access account again
Expected: Credentials work correctly
```

**Pass Criteria:** All 3 tests pass = ✅ PASS

---

### Test Scenario 4: Visual & Functionality (10 minutes)

**Check Visual Design**
- [ ] Dark background (#09090b or similar dark)
- [ ] Glass morphism cards visible
- [ ] Gradient effects present
- [ ] Colors consistent (primary, accent, etc.)
- [ ] Animations smooth
- [ ] No layout breaks
- [ ] Mobile view works (viewport < 768px)
- [ ] Typography clean and readable

**Check No Breakage**
- [ ] No console errors (F12)
- [ ] No network errors (red status codes)
- [ ] Links work
- [ ] Forms submit
- [ ] Data persists
- [ ] No typos visible
- [ ] All images load
- [ ] No blank sections

**Check Performance**
- [ ] Home page load: < 2s
- [ ] Admin dashboard load: < 2s
- [ ] No lag when scrolling
- [ ] Add to cart instant
- [ ] Page transitions smooth

**Pass Criteria:** All checks pass = ✅ PASS

---

## Test Results Template

**Test Date:** ________________
**Tester Name:** ________________
**Device/Browser:** ________________

### Summary
- **Total Test Scenarios:** 4
- **Passed:** ____
- **Failed:** ____
- **Issues Found:** ____

### Scenario Results

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Customer Flow | ✅/❌ | |
| 2. Shop Owner | ✅/❌ | |
| 3. Permissions | ✅/❌ | |
| 4. Visual/Functionality | ✅/❌ | |

### Issues Found

#### Issue #1
- **Title:** [Brief title]
- **Severity:** [Critical/High/Medium/Low]
- **Steps to Reproduce:**
  1. 
  2. 
  3. 
- **Expected:** 
- **Actual:** 
- **Screenshots:** [Attach if possible]

---

## Success Criteria

**All tests pass when:**
- ✅ Customer can complete full order flow
- ✅ Shop owner can manage their shop
- ✅ Permission isolation works (cannot see other shop data)
- ✅ Visual changes are consistent and functional
- ✅ No errors in console
- ✅ All features responsive

---

## Troubleshooting Common Issues

### Issue: "Cannot log in"
**Possible Causes:**
- Account doesn't exist in Firebase
- Wrong password
- Firebase not configured
- Network error

**Solution:**
- Create account first if new
- Check .env.local has Firebase vars
- Check Network tab for API errors
- Check browser console for errors

### Issue: "404 errors on API calls"
**Possible Causes:**
- Dev server not started from correct directory
- API routes not built
- Database not connected

**Solution:**
- Restart: `npm run dev` from project root (dialabraai)
- Check `.env.local` has database URL
- Check console for connection errors

### Issue: "Permission denied on admin"
**Possible Causes:**
- Auth check is working correctly (expected!)
- User doesn't have owner status

**Solution:**
- Verify you're logged in as owner email
- Check database has correct owner_email for shop
- Check `app/admin/layout.js` for auth logic

### Issue: "Visual changes not showing"
**Possible Causes:**
- CSS not compiled
- Cache issue
- Old build

**Solution:**
- Clear `.next` folder: `rm -r .next`
- Hard refresh: Ctrl+Shift+R
- Restart dev server

---

## Sign-Off

By running through all test scenarios and confirming they pass, you verify:

✅ App works functionally
✅ Permissions are properly enforced
✅ Visual changes don't break functionality
✅ No major bugs exist
✅ Ready for user testing/deployment

**Tester Sign-Off:** __________________ Date: __________________

---

## Next Steps

1. **Document any issues found** in the Issues Found section
2. **Report findings** to development team
3. **Re-test after fixes** are applied
4. **Get approval** before releasing to production

