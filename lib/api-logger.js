import { sql } from './db.js';

export function logApiCall({
  appId,
  keyId,
  endpoint,
  method = 'GET',
  statusCode,
  durationMs,
  ip,
  userAgent,
  errorMsg,
}) {
  if (!sql) return;

  // Fire-and-forget: never block the caller
  sql`
    INSERT INTO api_logs (
      app_id, api_key_id, endpoint, method, status_code, duration_ms, ip, user_agent, error_msg
    )
    VALUES (
      ${appId || null},
      ${keyId || null},
      ${endpoint},
      ${method},
      ${statusCode},
      ${durationMs || null},
      ${ip || null},
      ${userAgent || null},
      ${errorMsg || null}
    )
  `.catch((err) => console.error('[api-logger]', err));
}
