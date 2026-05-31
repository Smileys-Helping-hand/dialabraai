import { createHmac } from 'crypto';
import { sql } from './db.js';

export function dispatchWebhook(event, payload, appId) {
  if (!sql) return;

  // Fire-and-forget IIFE
  (async () => {
    try {
      const hooks = await sql`
        SELECT id, url, secret, fail_count
        FROM webhooks
        WHERE app_id = ${appId}
          AND active = true
          AND ${event} = ANY(events)
      `;

      for (const hook of hooks) {
        try {
          const body = JSON.stringify({
            event,
            data: payload,
            timestamp: new Date().toISOString(),
          });

          const sig = 'sha256=' + createHmac('sha256', hook.secret).update(body).digest('hex');

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(hook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Graze-Event': event,
              'X-Graze-Signature': sig,
            },
            body,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            await sql`
              UPDATE webhooks
              SET last_fired_at = NOW(), fail_count = 0
              WHERE id = ${hook.id}
            `;
          } else {
            const newFailCount = hook.fail_count + 1;
            const shouldSuspend = newFailCount > 5;
            await sql`
              UPDATE webhooks
              SET fail_count = ${newFailCount},
                  active = ${!shouldSuspend}
              WHERE id = ${hook.id}
            `;
          }
        } catch (error) {
          const newFailCount = hook.fail_count + 1;
          const shouldSuspend = newFailCount > 5;
          await sql`
            UPDATE webhooks
            SET fail_count = ${newFailCount},
                active = ${!shouldSuspend}
            WHERE id = ${hook.id}
          `;
        }
      }
    } catch (error) {
      console.error('[webhook-dispatcher]', error);
    }
  })();
}
