# Role & Permission Levels Guide

## User Types & Permission Levels

The Graze Marketplace platform supports the following user roles:

### 1. **Customer (End User)**
- **Access Level**: Public marketplace browsing
- **Permissions**:
  - ✅ View marketplace and all shops
  - ✅ View menu items and pricing
  - ✅ Create orders
  - ✅ View own order history
  - ✅ View own saved order packs
  - ✅ Contact shop via WhatsApp
  - ✅ Track order status in real-time
  - ❌ Cannot access admin features
  - ❌ Cannot manage other users' data

**Auth**: Firebase Auth (email/password or social login)
**Location**: `/app/account/`, `/app/order/`

---

### 2. **Shop Owner**
- **Access Level**: Own shop management
- **Permissions**:
  - ✅ Create and manage own shop profile
  - ✅ Upload menu items for own shop
  - ✅ View orders for own shop only
  - ✅ Update order status (pending → ready → completed)
  - ✅ Mark orders as paid/unpaid
  - ✅ View sales dashboard (own shop only)
  - ✅ Track best-selling items
  - ✅ Manage shop settings (colors, contact info, hours)
  - ✅ View inventory management
  - ❌ Cannot view other shops' data
  - ❌ Cannot access superadmin features
  - ❌ Cannot create/delete users

**Auth**: Firebase Auth + Shop ownership verification
**Location**: `/app/admin/` (shop owner dashboard)
**Database**: `shops` table with `owner_email` field

---

### 3. **Admin**
- **Access Level**: Own shop management (same as Shop Owner)
- **Permissions**: Same as Shop Owner
- **Note**: Created when a shop owner logs in for first time

**Auth**: Firebase Auth
**Location**: `/app/admin/`

---

### 4. **Superadmin** 
- **Access Level**: Platform-wide management
- **Permissions**:
  - ✅ View all shops
  - ✅ View all orders across platform
  - ✅ View platform analytics
  - ✅ Manage shop tiers/levels
  - ✅ Monitor API calls and webhooks
  - ✅ Access developer hub
  - ✅ Manage registered apps
  - ✅ Create/revoke API keys
  - ❌ Cannot modify individual shop data (unless necessary for support)

**Auth**: Token-based (X-Superadmin-Token header)
**Location**: `/app/superadmin/`
**Credentials**: `NEXT_PUBLIC_SUPERADMIN_USER` + `NEXT_PUBLIC_SUPERADMIN_PASSWORD` env vars

---

## Permission Verification Points

### API Routes that Check Authorization
- `/api/admin/*` - Requires shop owner authentication
- `/api/superadmin/*` - Requires superadmin token
- `/api/v1/*` - Requires API key with appropriate scopes
- `/api/orders/create` - Requires authenticated user (customer)
- `/api/menu/*` - Requires shop owner auth or API key

### Frontend Route Protection
- `/admin/*` - Redirects if not authenticated as shop owner
- `/superadmin/*` - Requires superadmin credentials
- `/account/*` - Requires user authentication (customer)
- `/` - Public marketplace (no auth required)

---

## Shop Ownership Hierarchy

```
┌─ Platform (Superadmin)
│  └─ Each Shop (Shop Owner/Admin)
│     └─ Shop's Orders (Customer data)
│     └─ Shop's Menu Items
│     └─ Shop's Settings
```

**Ownership Verification**:
- Shop owner email is stored in `shops.owner_email` field
- When customer creates order → order linked to `shop_slug`
- When shop owner logs in → can only see/edit own `shop_slug` data

---

## Testing Checklist

### Setup Test Accounts

1. **Customer Account**
   - Email: `customer@test.com`
   - Password: `TestPass123!`
   - Role: End user
   - Can: Browse, order, track orders

2. **Shop Owner Account #1**
   - Email: `owner1@test.com`
   - Password: `TestPass123!`
   - Shop Slug: `test-shop-1`
   - Can: Manage own shop, view own orders

3. **Shop Owner Account #2**
   - Email: `owner2@test.com`
   - Password: `TestPass123!`
   - Shop Slug: `test-shop-2`
   - Can: Manage own shop (different shop from owner1)

4. **Superadmin Account**
   - User: `admin@dialabraai.local`
   - Password: Set in env: `NEXT_PUBLIC_SUPERADMIN_PASSWORD`
   - Can: View all, manage platform

---

## Permission Enforcement Checklist

- [ ] Customer cannot access `/admin` route
- [ ] Customer cannot view other customers' order histories
- [ ] Shop owner cannot see orders from other shops
- [ ] Shop owner cannot edit menu items of other shops
- [ ] Shop owner cannot access `/superadmin` route
- [ ] Superadmin can view all shops and orders
- [ ] Unauthenticated users can only access public marketplace
- [ ] API requests without proper auth/token are rejected
- [ ] API keys are properly scoped and enforced

---

## Current Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| Customer Auth | ✅ Implemented | `/app/account/`, Firebase Auth |
| Shop Owner Auth | ✅ Implemented | `/app/admin/`, Firebase Auth |
| Shop Ownership Check | ✅ Implemented | `shop_slug` field, API checks |
| Superadmin Auth | ✅ Implemented | `/app/superadmin/`, Token-based |
| API Key Management | ✅ Implemented | `registered_apps`, `api_keys` tables |
| Role-based API Access | ✅ Implemented | `/api/v1/` routes |
| Order Access Control | ✅ Implemented | Filters by `shop_slug` |
| Permission Documentation | ✅ This document | |

---

## Next Steps

1. **Review this guide** with your QA/testing team
2. **Create test accounts** using the checklist above
3. **Run permission tests** as outlined in TEST-SCENARIOS.md
4. **Verify enforcement** at API and UI levels
5. **Document findings** in test report

