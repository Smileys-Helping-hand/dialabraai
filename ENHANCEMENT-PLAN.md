# System Enhancement Plan: Quote & Order Management Platform

## Current State Assessment
The system currently has:
- ✅ Multi-tenant foundation (shops, menu items, orders)
- ✅ Customer checkout with phone/email
- ✅ Order tracking dashboard
- ✅ WhatsApp integration
- ❌ Quote/proposal system (shown in screenshots, needs implementation)
- ❌ Customer profiles & signed-in quote history
- ❌ In-app notifications
- ❌ Email notifications
- ❌ Manual payment confirmation UI
- ❌ WeChat integration

---

## Enhancement Roadmap (5 Iterations)

### ITERATION 1: Customer Profile System & Quote Foundation
**Goal:** Enable customers to have persistent accounts with quote history

**Tasks:**
1. Create `quotes` table in database
   - id, shop_slug, customer_id/email, items (JSONB), quote_status, shop_price, customer_accepted, created_at, expires_at
2. Create Quote API endpoints
   - POST /api/quotes/create (customer requests quote)
   - GET /api/quotes/list (customer views their quotes)
   - GET /api/quotes/[id] (view single quote)
   - POST /api/quotes/[id]/accept (customer accepts quote)
3. Create `/quote` page for quote request form
4. Create `/quotes/history` page for customer quote history
5. Update ShopProvider to support authenticated customer context
6. Implement quote view page (`/quotes/[id]`) for customers to review & accept

**Database Schema Addition:**
```sql
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  shop_slug TEXT NOT NULL,
  customer_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  notes TEXT DEFAULT '',
  shop_quoted_price NUMERIC,
  status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  FOREIGN KEY (shop_slug) REFERENCES shops(slug)
);
```

---

### ITERATION 2: Notifications System
**Goal:** Notify users of quote status changes via app, email, and WhatsApp

**Tasks:**
1. Create `notifications` table
   - id, user_id, user_email, type, related_quote_id/order_id, message, read, created_at
2. Add notification preferences table
3. Create notification service (`lib/notifications.js`)
4. Implement email notifications (use Resend)
5. Implement in-app notification badge & panel
6. Add WhatsApp notification triggers
7. Create notification settings page in customer account
8. Add email/SMS templates for:
   - Quote request received
   - Quote ready for review
   - Quote accepted/rejected
   - Order status updates

**API Endpoints:**
- POST /api/notifications/send
- GET /api/notifications/list
- POST /api/notifications/[id]/read
- PUT /api/notifications/preferences

---

### ITERATION 3: Manual Payment Confirmation
**Goal:** Allow shop owners to manually mark orders/quotes as paid

**Tasks:**
1. Add `payment_method` field to quotes & orders table (cash, eft, online, etc.)
2. Create payment status UI components
   - Payment status badge
   - Payment confirmation modal
   - Payment history log
3. Add admin page: `/admin/payments`
4. Implement payment confirmation endpoint
5. Add payment confirmation webhook to notifications
6. Create payment receipt system
7. Add cash/EFT specific fields (transaction ref, etc.)

**UI Features:**
- Payment status selector in quote/order details
- Quick payment mark modal
- Payment method icons
- Payment history timeline

---

### ITERATION 4: Multi-Messenger Integration
**Goal:** Support WhatsApp, WeChat, and in-app notifications equally

**Tasks:**
1. Create messenger config system (`lib/messengers.js`)
2. Implement WhatsApp message queue system
3. Implement WeChat integration
4. Create message template system
5. Add messenger preference selector for shop owners
6. Create automated message triggers for:
   - Quote ready for review
   - Order accepted
   - Payment confirmed
   - Order ready
7. Add message history/audit log
8. Create admin page: `/admin/communications`

**Message Types:**
- Quote Request Confirmation
- Quote Ready for Review
- Quote Accepted by Customer
- Payment Status Update
- Order Status Update

---

### ITERATION 5: UX/UI Optimization & Code Cleanup
**Goal:** Polish UX, optimize performance, remove redundancy

**Tasks:**
1. Audit and refactor component hierarchy
2. Optimize image loading
3. Consolidate similar components
4. Implement skeleton loading states
5. Add loading spinners and transitions
6. Optimize database queries (add indexes)
7. Implement caching where appropriate
8. Remove deprecated code
9. Add error boundary components
10. Create reusable form components
11. Optimize mobile responsiveness
12. Add accessibility improvements

**Specific Optimizations:**
- Combine quote & order creation flows
- Reuse payment confirmation modals
- Consolidate notification UI
- Streamline customer authentication flow
- Add optimistic updates
- Implement request deduplication

---

## Testing Strategy

### Manual Testing Checklist (Per Iteration)
1. **Customer Flow:**
   - [ ] Sign up / Log in
   - [ ] Request quote
   - [ ] Receive quote notification
   - [ ] View and accept quote
   - [ ] See confirmation
   - [ ] View payment status
   - [ ] Receive email/WhatsApp confirmation

2. **Shop Owner Flow:**
   - [ ] Log in to admin
   - [ ] See quote requests
   - [ ] Set quote price
   - [ ] Send quote to customer
   - [ ] Mark as paid when customer pays
   - [ ] Move to job tracking
   - [ ] Receive notifications

3. **Device Testing:**
   - [ ] Desktop (Chrome, Firefox)
   - [ ] Mobile (iOS Safari)
   - [ ] Mobile (Android Chrome)
   - [ ] Tablet

4. **Integration Points:**
   - [ ] WhatsApp link generation
   - [ ] Email delivery
   - [ ] Database transactions
   - [ ] Payment confirmation flow
   - [ ] WeChat message delivery

---

## Key Principles

1. **Customer-First:** Every improvement should reduce friction for customers
2. **Shop-Friendly:** Owners should see clear, actionable information
3. **Notification Fatigue Aware:** Only notify on important state changes
4. **Multi-Device:** Works seamlessly on phone, tablet, desktop
5. **Offline-Ready:** App should work with poor connectivity
6. **Accessible:** WCAG 2.1 AA standards
7. **Fast:** < 2s page load, < 50ms interactions
8. **DRY:** No component/function duplication

---

## Success Metrics

- Quote-to-acceptance conversion rate
- Time to quote response
- Customer notification engagement
- Payment confirmation accuracy
- Feature adoption across 2 pilot shops
- Zero critical bugs in production

---

## Implementation Timeline

- **Iteration 1:** 4-6 hours (Core quote system)
- **Iteration 2:** 3-4 hours (Notifications)
- **Iteration 3:** 2-3 hours (Payment UI)
- **Iteration 4:** 3-4 hours (Multi-messenger)
- **Iteration 5:** 2-3 hours (Optimization)
- **Testing:** 4-5 hours (Comprehensive testing)
- **Total:** ~18-25 hours

