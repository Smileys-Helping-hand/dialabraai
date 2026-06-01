# Testing Quick Start Guide

## What's New

Three comprehensive documents have been created to help you test and validate the application:

1. **ROLE-PERMISSIONS-GUIDE.md** - Complete permission levels and access controls
2. **TEST-SCENARIOS.md** - Step-by-step test cases for all user types
3. **TESTING-QUICK-START.md** - This guide

---

## 30-Second Overview

Your app now has **4 distinct user types** with different permission levels:

| User Type | Can Access | Cannot Access |
|-----------|-----------|----------------|
| **Customer** | Marketplace, browse, order, track | Admin panels |
| **Shop Owner** | Own shop management, menu, orders, stats | Other shops' data |
| **Superadmin** | Everything across platform | Modify individual shop data directly |
| **Anonymous** | Public marketplace only | Orders, accounts, admin |

---

## Getting Started with Testing

### Step 1: Start the Dev Server
```bash
npm run dev
```
App will be available at `http://localhost:3000`

### Step 2: Create Test Accounts

You'll need accounts to test all roles:

**Customer Account:**
- Email: customer@test.com
- Password: TestPass123!
- Can: Browse marketplace, create orders

**Shop Owner #1:**
- Email: owner1@test.com
- Password: TestPass123!
- Shop: test-shop-1
- Can: Manage own shop, view own orders

**Shop Owner #2:**
- Email: owner2@test.com
- Password: TestPass123!
- Shop: test-shop-2
- Can: Manage own shop (isolated from owner1)

**Superadmin:**
- User: admin@dialabraai.local
- Password: (set in .env.local: `NEXT_PUBLIC_SUPERADMIN_PASSWORD`)
- Can: View all shops, orders, analytics, manage API keys

### Step 3: Run Through Key Test Scenarios

Open **TEST-SCENARIOS.md** and follow test cases:

- **Test Case 1** - Customer (browse, order, track) - 15 min
- **Test Case 2** - Shop Owner (manage shop, orders, menu) - 20 min
- **Test Case 3** - Superadmin (platform overview) - 10 min
- **Test Case 4** - Permission boundaries (isolation tests) - 10 min
- **Test Case 5** - Visual & functionality checks - 10 min
- **Test Case 6** - Edge cases - 10 min

**Total Time: ~75 minutes**

---

## What to Check

### ✅ Functionality
- [ ] Customers can create orders
- [ ] Shop owners can manage their orders
- [ ] Orders display correct shop information
- [ ] Inventory toggles work
- [ ] Price calculations are accurate
- [ ] Status updates persist

### ✅ Permissions (Security)
- [ ] Customer cannot access `/admin`
- [ ] Owner1 cannot see Owner2's data
- [ ] Owner cannot access `/superadmin`
- [ ] API calls without auth are rejected
- [ ] Each user sees only their data

### ✅ Visual
- [ ] Dark theme applied consistently
- [ ] Glass morphism effects visible
- [ ] No broken layouts on mobile
- [ ] All images load
- [ ] Animations smooth
- [ ] No console errors

---

## Key Files to Review

### Permission Logic
- `app/admin/layout.js` - Admin access control
- `app/superadmin/layout.js` - Superadmin access control
- `lib/firebase.js` - Auth setup
- API routes in `app/api/` - Authorization checks

### UI Components
- `components/ShopCard.jsx` - Marketplace display
- `components/AdminOrderCard.jsx` - Order management
- `components/MenuItemCard.jsx` - Menu display
- `app/home/page.js` - Main marketplace

### Database Models
- `shops` table - `owner_email` field stores ownership
- `orders` table - `shop_slug` links to shop
- `menu_items` table - `shop_slug` isolates data
- `registered_apps` - `owner_email` field for app owners

---

## Common Test Scenarios

### Scenario A: "I want to verify owner isolation works"
1. Log in as owner1@test.com
2. Go to `/admin`
3. Try to navigate to another shop's orders
4. ✅ Expected: Cannot access other shop data

**Location**: Test Case 4.2 in TEST-SCENARIOS.md

### Scenario B: "I want to check customer ordering flow"
1. Logout
2. Create account as customer
3. Browse marketplace
4. Add items to cart
5. Create order
6. Track order status
7. ✅ Expected: End-to-end order works

**Location**: Test Case 1 in TEST-SCENARIOS.md

### Scenario C: "I want to verify shop owner dashboard"
1. Log in as owner1@test.com
2. Go to admin dashboard
3. Check stats (revenue, orders)
4. Update an order status
5. View menu management
6. ✅ Expected: All admin features work

**Location**: Test Case 2 in TEST-SCENARIOS.md

### Scenario D: "I want to check API authentication"
1. Open dev tools (F12)
2. Go to Network tab
3. Create an order
4. Check requests to `/api/orders/create`
5. ✅ Expected: Should have auth headers

**Location**: Test Case 4.3 in TEST-SCENARIOS.md

---

## Troubleshooting

### Issue: "Can't log in as shop owner"
- Check if account exists in Firebase
- Verify email matches shop `owner_email` in database
- Check if shop exists in database

### Issue: "Customer can see admin panel"
- Clear browser cache/cookies
- Check `app/admin/layout.js` access control
- Verify Firebase auth is returning correct user

### Issue: "Owner can see other owner's data"
- This is a security issue! File a bug
- Check API authorization in `app/api/` routes
- Verify `shop_slug` filtering is implemented

### Issue: "Visual changes not showing"
- Clear `.next` build cache: `rm -r .next`
- Restart dev server
- Hard refresh browser (Ctrl+Shift+R)

---

## Success Criteria

Your app is **properly tested** when:

- ✅ All users can access only their own data
- ✅ Customers can complete a full order flow
- ✅ Shop owners can manage their shop
- ✅ Visual styling is consistent
- ✅ No console errors
- ✅ No permission bypasses found
- ✅ All test scenarios pass

---

## Next Steps

1. **Print this guide** - Share with QA team
2. **Review ROLE-PERMISSIONS-GUIDE.md** - Understand the architecture
3. **Run TEST-SCENARIOS.md** - Execute all test cases
4. **Document findings** - Note any issues or edge cases
5. **Review with team** - Discuss results and next iterations

---

## Questions?

Refer to:
- **Architecture Questions** → ROLE-PERMISSIONS-GUIDE.md
- **Test Steps** → TEST-SCENARIOS.md  
- **Code Questions** → Check relevant files mentioned above

Good luck with testing! 🚀

