import { sql } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM menu_items WHERE available = true ORDER BY category, name`;
      const data = rows.map(r => ({ ...r, price: Number(r.price) }));
      return new Response(JSON.stringify(data || []), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    } catch (error) {
      console.error('Failed to fetch menu:', error.message);
    }
  }

  // Fallback to sample data
  try {
    const filePath = path.join(process.cwd(), 'data', 'sample-menu.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    demoStore.initializeInventory(data);
    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to load sample data:', err);
    return new Response(JSON.stringify({ error: 'Unable to load menu items right now.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
