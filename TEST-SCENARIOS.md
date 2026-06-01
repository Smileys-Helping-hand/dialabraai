# Test Scenarios for User Roles & Permissions

## Test Environment Setup

Before running tests, ensure:
- ✅ Dev server is running (`npm run dev`)
- ✅ Database is connected (check `.env.local`)
- ✅ Firebase is configured (check `NEXT_PUBLIC_FIREBASE_*` env vars)
- ✅ Test accounts are created (see ROLE-PERMISSIONS-GUIDE.md)

---

## Test Case 1: Customer (End User) Flow

### Preconditions
- Browser cookies/localStorage cleared
- No user logged in
- At least one shop exists in database

### Test Steps

#### 1.1 - Access Public Marketplace
```
Action: Navigate to http://localhost:3000/
Expected: 
  ✅ Marketplace loads with shop list
  ✅ Can scroll through shops
  ✅ Can filter by category (Braai, Burgers, Pizza, etc.)
  ✅ "Sign In" button visible in top right
  ✅ New user can see "Create Account" option
```

#### 1.2 - Create Customer Account
```
Action: Click "Create Account" or "Sign In" → "New here? Create an account"
Fill in:
  - Email: customer@test.com
  - Password: TestPass123!
Expected:
  ✅ Account created
  ✅ User redirected to marketplace
  ✅ Account button shows in top right with user email
```

#### 1.3 - Browse Shop Menu
```
Action: Click on a shop card from marketplace
Expected:
  ✅ Shop details load (logo, name, description)
  ✅ Menu items display with images, prices, categories
  ✅ Can see "Add to Cart" buttons
  ✅ Can see shop contact info (WhatsApp, phone, email)
  ✅ Shop owner cannot see this shop owner's admin panel
```

#### 1.4 - Add Items to Cart
```
Action: Click "Add to Cart" on menu items (add 2-3 items)
Expected:
  ✅ Floating cart button appears (bottom right)
  ✅ Cart shows item count
  ✅ Cart notification confirms item addition
  ✅ Items are grouped by shop
```

#### 1.5 - View & Modify Cart
```
Action: Click floating cart button
Expected:
  ✅ Cart opens showing all items
  ✅ Can increase/decrease quantities
  ✅ Can remove items
  ✅ Total price calculates correctly
  ✅ "Proceed to Checkout" button visible
```

#### 1.6 - Create Order
```
Action: Click "Proceed to Checkout"
Fill in:
  - Customer name
  - Phone number
  - Delivery address (if applicable)
Expected:
  ✅ Order created successfully
  ✅ Redirected to order confirmation page
  ✅ Order shows unique ID
  ✅ Order shows status (e.g., "Pending")
  ✅ Option to share to WhatsApp
```

#### 1.7 - View Order History
```
Action: Click Account button → "My Orders"
Expected:
  ✅ Can see own past orders
  ✅ Orders show shop name, items, status, date
  ✅ Can click order to see full details
  ✅ Cannot see other customers' orders
  ✅ Can track status in real-time
```

#### 1.8 - Save Order Pack
```
Action: From marketplace, add items then click "Save Pack"
Fill in pack name: "My Favorite Combo"
Expected:
  ✅ Pack saved successfully
  ✅ Can access saved packs from account
  ✅ Can reload pack with one click (repopulate cart)
  ✅ Can delete saved pack
```

#### 1.9 - Cannot Access Admin
```
Action: Try to navigate to http://localhost:3000/admin
Expected:
  ❌ Access denied or redirected
  ✅ Customer cannot see admin dashboard
```

---

## Test Case 2: Shop Owner / Admin Flow

### Preconditions
- Clear cache/cookies
- Have own shop in database (e.g., slug: `test-shop-1`)
- Email associated as shop owner in database

### Test Steps

#### 2.1 - Shop Owner Login
```
Action: Click Account → "Sign In" → Login
Fill in:
  - Email: owner1@test.com
  - Password: TestPass123!
Expected:
  ✅ Owner logged in
  ✅ Account button shows owner email
  ✅ "Admin Dashboard" button visible in account menu
  ✅ Different UI than customer account
```

#### 2.2 - Access Admin Dashboard
```
Action: Click Account → "Admin Dashboard"
Expected:
  ✅ Redirected to /admin
  ✅ Dashboard shows own shop name
  ✅ Cannot access dashboard from other shops
  ✅ Shows today's orders, revenue, stats
```

#### 2.3 - View Own Orders
```
Action: In admin, click "Orders"
Expected:
  ✅ Can see only own shop's orders
  ✅ Orders show customer name, items, status
  ✅ Orders show timestamps
  ✅ Can filter by status (pending, ready, completed)
  ✅ Cannot see orders from other shops
```

#### 2.4 - Update Order Status
```
Action: Click on an order → Update status to "Ready"
Expected:
  ✅ Status updates immediately
  ✅ Order list reflects change
  ✅ Order marked as "ready"
  ✅ Changes persist on page reload
```

#### 2.5 - Mark Order as Paid
```
Action: On an order → Click "Mark as Paid"
Expected:
  ✅ Order marked as paid
  ✅ Paid status visible
  ✅ Can toggle paid/unpaid
  ✅ Changes reflected in stats
```

#### 2.6 - Manage Menu Items
```
Action: Click "Menu Management"
Expected:
  ✅ Can see own shop's menu items
  ✅ Can add new menu items
  ✅ Can edit existing items (name, price, description, category)
  ✅ Can upload item images
  ✅ Can delete items
  ✅ Cannot see/edit other shops' menus
```

#### 2.7 - Manage Inventory
```
Action: Click "Inventory"
Expected:
  ✅ Can toggle item availability
  ✅ Can mark items as out of stock
  ✅ Changes appear immediately on marketplace
  ✅ Customers see unavailable items grayed out
```

#### 2.8 - View Sales Dashboard
```
Action: Click "Dashboard" or home of admin area
Expected:
  ✅ Shows revenue today/this week/this month
  ✅ Shows order count
  ✅ Shows best-selling items
  ✅ Shows average order value
  ✅ Shows graphs/charts of activity
  ✅ All data is own shop only
```

#### 2.9 - Manage Shop Settings
```
Action: Click "Shop Setup"
Fill in/update:
  - Shop name
  - Description
  - Contact phone
  - WhatsApp number
  - Operating hours
  - Colors (primary, accent, cream, charcoal)
Expected:
  ✅ Settings save successfully
  ✅ Changes appear on public shop page
  ✅ Cannot edit other shops' settings
  ✅ All fields validate correctly
```

#### 2.10 - Second Owner Isolation
```
Action: Logout, login as owner2@test.com, access /admin
Expected:
  ✅ See only test-shop-2 data
  ✅ Cannot access test-shop-1 data
  ✅ Cannot see owner1's orders/menu/stats
  ✅ Completely isolated view
```

#### 2.11 - Cannot Access Superadmin
```
Action: Try to navigate to http://localhost:3000/superadmin
Expected:
  ❌ Access denied or redirected
  ✅ Shop owner cannot see superadmin panel
```

---

## Test Case 3: Superadmin Flow

### Preconditions
- Superadmin credentials set in `.env.local`
- At least 2 shops with data in database

### Test Steps

#### 3.1 - Superadmin Login
```
Action: Navigate to http://localhost:3000/superadmin/login
Fill in:
  - User: admin@dialabraai.local (or configured user)
  - Password: (configured password)
Expected:
  ✅ Superadmin logged in
  ✅ Redirected to superadmin dashboard
  ✅ "Superadmin" badge visible
```

#### 3.2 - View All Shops
```
Action: Click "Shops" or similar menu item
Expected:
  ✅ Can see all shops in system
  ✅ Can see both test-shop-1 and test-shop-2
  ✅ Shows shop stats (owner, revenue, order count)
  ✅ Can search/filter shops
```

#### 3.3 - View All Orders
```
Action: Click "Orders" or "All Orders"
Expected:
  ✅ Can see orders from all shops
  ✅ Shows owner email and shop for each order
  ✅ Can filter by shop, status, date
  ✅ Cannot modify orders directly (read-only)
```

#### 3.4 - View Platform Analytics
```
Action: Click "Analytics" or "Dashboard"
Expected:
  ✅ Shows total platform revenue
  ✅ Shows order count across all shops
  ✅ Shows active shops count
  ✅ Shows graphs and trends
  ✅ Shows top shops/items
```

#### 3.5 - Manage API Keys
```
Action: Click "Developers" or "API Keys"
Expected:
  ✅ Can create new API keys
  ✅ Can revoke keys
  ✅ Can view key details (scopes, created date)
  ✅ Can see usage logs
```

#### 3.6 - Manage Registered Apps
```
Action: Click "Registered Apps" or "Applications"
Expected:
  ✅ Can see all registered apps
  ✅ Can view app details
  ✅ Can enable/disable apps
  ✅ Can view API logs for each app
```

---

## Test Case 4: Permission Boundary Tests

### Test 4.1 - Customer Cannot Access Admin
```
Scenario: Logged in as customer
Action 1: Try to navigate to /admin/orders
Expected: ❌ Access denied, redirected to home or login
Action 2: Try to access /admin/setup
Expected: ❌ Access denied, redirected
```

### Test 4.2 - Owner Cannot See Other Owner's Data
```
Scenario: Logged in as owner1@test.com (test-shop-1)
Action 1: Navigate to /admin
Expected: ✅ See only test-shop-1 data
Action 2: Try to manually navigate to /admin?shop=test-shop-2
Expected: ❌ Cannot access test-shop-2 data
Action 3: Check API call /api/admin/stats?shop=test-shop-2
Expected: ❌ API returns 403 Forbidden
```

### Test 4.3 - API Authentication
```
Scenario: Call API endpoint without auth token
Action 1: curl http://localhost:3000/api/v1/orders -H "Authorization: Bearer invalid"
Expected: ❌ 401 Unauthorized
Action 2: curl http://localhost:3000/api/v1/orders (no header)
Expected: ❌ 401 Unauthorized
```

### Test 4.4 - Superadmin Cannot Spoof Token
```
Scenario: Logged in as shop owner
Action 1: Try to access /superadmin without proper credentials
Expected: ❌ Access denied
Action 2: Try to make API call with shop owner token to superadmin endpoint
Expected: ❌ 403 Forbidden
```

### Test 4.5 - Order Isolation
```
Scenario: Customer creates order at shop1
Action 1: Log in as shop1 owner → view order in dashboard
Expected: ✅ Can see and manage the order
Action 2: Log in as shop2 owner → try to view same order
Expected: ❌ Cannot see the order from shop1
Action 3: Try direct API call: /api/orders/get?id=ORDER_ID
Expected: If shop2 owner → ❌ 403 Forbidden
```

---

## Test Case 5: Visual & Functionality Tests

### Test 5.1 - Visual Changes Verification
```
On all pages, verify:
✅ Dark theme applies correctly
✅ Glass morphism effects visible
✅ Color scheme consistent
✅ Animations smooth (no jank)
✅ Responsive on mobile (test with device mode)
✅ Text readable with good contrast
✅ All images load properly
```

### Test 5.2 - No Functionality Breakage
```
Test each major feature:
✅ Marketplace search works
✅ Filters respond correctly
✅ Add to cart works
✅ Checkout completes
✅ Orders display correctly
✅ Admin stats calculate
✅ Menu management works
✅ No console errors
✅ No broken links
```

### Test 5.3 - Performance
```
✅ Home page loads in < 2s
✅ Admin dashboard loads in < 2s
✅ No memory leaks when navigating
✅ Smooth scrolling on shop list
```

---

## Test Case 6: Edge Cases

### Test 6.1 - Expired Sessions
```
Action: Log in, wait 24 hours (or clear cookies), try to access /admin
Expected: ✅ Redirected to login
Expected: ✅ Can log back in without issues
```

### Test 6.2 - Multiple Tabs
```
Action: Open admin in tab 1, marketplace in tab 2
Tab 1: Update order status
Tab 2: Refresh page
Expected: ✅ Tab 2 shows updated order status
Expected: ✅ Both tabs stay in sync
```

### Test 6.3 - Concurrent Orders
```
Action: Create 10 orders rapidly
Expected: ✅ All orders created
Expected: ✅ No data loss or duplication
Expected: ✅ All orders appear in admin
```

### Test 6.4 - Empty States
```
Action: Sign up as owner with no menu items
Expected: ✅ Admin shows "No items" gracefully
Action: View empty order list
Expected: ✅ Shows "No orders" with helpful message
```

---

## Test Execution Checklist

- [ ] **Customer Flow** - All 9 sub-tests pass
- [ ] **Shop Owner Flow** - All 11 sub-tests pass
- [ ] **Superadmin Flow** - All 6 sub-tests pass
- [ ] **Permission Boundaries** - All 5 sub-tests pass
- [ ] **Visual & Functionality** - All 3 sub-tests pass
- [ ] **Edge Cases** - All 4 sub-tests pass

## Test Report Template

**Test Date**: ____________________
**Tester**: ____________________
**Device**: ____________________
**Browser**: ____________________

### Summary
- Total Test Cases: 27
- Passed: ______
- Failed: ______
- Skipped: ______

### Failed Tests
| Test Case | Error | Severity | Notes |
|-----------|-------|----------|-------|
| | | | |

### Issues Found
1. [Issue title]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: 
   - Expected: 
   - Actual: 

---

## Automation Notes

For future CI/CD integration, these scenarios can be automated using:
- **Playwright** - For UI automation
- **Cypress** - For end-to-end tests
- **Jest** - For unit tests
- **API testing** - Postman/Insomnia collections

