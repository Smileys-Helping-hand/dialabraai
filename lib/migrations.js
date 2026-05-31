import { sql } from './db.js';

export async function runAllMigrations() {
  try {
    // App Registry
    await sql`
      CREATE TABLE IF NOT EXISTS registered_apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL DEFAULT 'owned',
        description TEXT DEFAULT '',
        owner_email TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // API Keys
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        app_id TEXT NOT NULL REFERENCES registered_apps(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        key_prefix TEXT NOT NULL,
        scopes TEXT[] NOT NULL DEFAULT '{}',
        last_used_at TIMESTAMPTZ,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // API Call Logs
    await sql`
      CREATE TABLE IF NOT EXISTS api_logs (
        id BIGSERIAL PRIMARY KEY,
        app_id TEXT,
        api_key_id TEXT,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL DEFAULT 'GET',
        status_code INTEGER NOT NULL,
        duration_ms INTEGER,
        ip TEXT,
        user_agent TEXT,
        error_msg TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS api_logs_app_id_idx ON api_logs(app_id)`;
    await sql`CREATE INDEX IF NOT EXISTS api_logs_created_idx ON api_logs(created_at DESC)`;

    // Webhooks
    await sql`
      CREATE TABLE IF NOT EXISTS webhooks (
        id TEXT PRIMARY KEY,
        app_id TEXT NOT NULL REFERENCES registered_apps(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        events TEXT[] NOT NULL DEFAULT '{}',
        secret TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        last_fired_at TIMESTAMPTZ,
        fail_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Ad Campaigns
    await sql`
      CREATE TABLE IF NOT EXISTS ad_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        utm_source TEXT NOT NULL,
        utm_medium TEXT NOT NULL DEFAULT 'cpc',
        utm_campaign TEXT NOT NULL,
        utm_content TEXT DEFAULT '',
        budget_zar NUMERIC DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Ad Attribution Events
    await sql`
      CREATE TABLE IF NOT EXISTS ad_events (
        id BIGSERIAL PRIMARY KEY,
        campaign_id TEXT REFERENCES ad_campaigns(id) ON DELETE SET NULL,
        event_type TEXT NOT NULL,
        shop_slug TEXT,
        path TEXT,
        referrer TEXT,
        ip TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS ad_events_campaign_idx ON ad_events(campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS ad_events_type_idx ON ad_events(event_type)`;

    // Add UTM columns to shops
    await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS utm_source TEXT DEFAULT ''`;
    await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS utm_medium TEXT DEFAULT ''`;
    await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS utm_campaign TEXT DEFAULT ''`;
    await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS utm_content TEXT DEFAULT ''`;
    await sql`ALTER TABLE shops ADD COLUMN IF NOT EXISTS campaign_id TEXT DEFAULT ''`;

    // Seed registered_apps with dialabraai
    await sql`
      INSERT INTO registered_apps (id, name, slug, type, status)
      VALUES ('app_dialabraai', 'Graze Marketplace', 'dialabraai', 'owned', 'active')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('[migrations] All migrations completed successfully');
    return { success: true };
  } catch (error) {
    console.error('[migrations]', error);
    return { success: false, error: error.message };
  }
}
