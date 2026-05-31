import { createHash, randomBytes } from 'crypto';
import { sql } from './db.js';

export function hashKey(rawKey) {
  return createHash('sha256').update(rawKey).digest('hex');
}

export async function generateApiKey(appId, name, scopes) {
  const fullKey = `graze_live_${randomBytes(24).toString('base64url')}`;
  const keyHash = hashKey(fullKey);
  const keyPrefix = fullKey.slice(0, 16);
  const id = `key_${Date.now()}_${randomBytes(4).toString('hex')}`;

  if (!sql) {
    return { id, fullKey, keyPrefix, keyHash, appId, name, scopes };
  }

  try {
    await sql`
      INSERT INTO api_keys (id, app_id, name, key_hash, key_prefix, scopes)
      VALUES (${id}, ${appId}, ${name}, ${keyHash}, ${keyPrefix}, ${scopes})
    `;
    return { id, fullKey, keyPrefix, keyHash, appId, name, scopes, createdAt: new Date() };
  } catch (error) {
    console.error('[api-keys] generateApiKey error:', error);
    throw error;
  }
}

export async function validateApiKey(rawToken) {
  if (!rawToken) {
    return { valid: false };
  }

  if (!sql) {
    return { valid: false };
  }

  try {
    const keyHash = hashKey(rawToken);

    const rows = await sql`
      SELECT k.id, k.app_id, k.scopes, a.status as app_status
      FROM api_keys k
      JOIN registered_apps a ON a.id = k.app_id
      WHERE k.key_hash = ${keyHash}
        AND k.revoked_at IS NULL
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { valid: false };
    }

    const key = rows[0];

    if (key.app_status !== 'active') {
      return { valid: false };
    }

    // Fire-and-forget update of last_used_at
    sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${key.id}`.catch((err) =>
      console.error('[api-keys] failed to update last_used_at:', err)
    );

    return {
      valid: true,
      appId: key.app_id,
      scopes: key.scopes || [],
      keyId: key.id,
    };
  } catch (error) {
    console.error('[api-keys] validateApiKey error:', error);
    return { valid: false };
  }
}

export async function revokeApiKey(keyId) {
  if (!sql) return { success: false };

  try {
    await sql`UPDATE api_keys SET revoked_at = NOW() WHERE id = ${keyId}`;
    return { success: true };
  } catch (error) {
    console.error('[api-keys] revokeApiKey error:', error);
    throw error;
  }
}
