import { neon } from '@neondatabase/serverless';

let sql = null;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
} else {
  console.warn('⚠️  DATABASE_URL not set. Database features will be unavailable.');
}

export { sql };

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Database Setup Instructions
 *
 * Run the initialization script to create all required tables:
 *   npm run init-db
 *
 * This will create:
 * - shops: Store profiles and configuration
 * - orders: Customer orders and bookings
 * - menu_items: Products/services offered
 * - registered_apps: Webhook configuration
 *
 * Tables support:
 * - Multi-tenant architecture (shops table)
 * - All business types (not just food)
 * - Order status tracking
 * - Inventory management
 * - Webhook integrations
 */
