import { docClient, TABLES, scanTable } from '@/lib/dynamodb';
import { demoStore } from '@/lib/demo-store';
import fs from 'fs/promises';
import path from 'path';

// Disable all caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // If DynamoDB isn't configured, fall back to sample data
  if (!docClient) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'sample-menu.json');
      const raw = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(raw);
      // Initialize inventory for demo mode
      demoStore.initializeInventory(data);
      return new Response(JSON.stringify(data || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('No DynamoDB and failed to load sample data:', err);
      return new Response(
        JSON.stringify({ error: 'DynamoDB is not configured and no sample data available.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  try {
    const data = await scanTable(TABLES.MENU);

    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Failed to fetch menu:', error.message);
    
    // If DynamoDB has any configuration issues, fall back to sample data
    console.log('⚠️  DynamoDB not available - loading sample menu data');
    try {
      const filePath = path.join(process.cwd(), 'data', 'sample-menu.json');
      const raw = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(raw);
      // Initialize inventory for demo mode
      demoStore.initializeInventory(data);
      return new Response(JSON.stringify(data || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (fileError) {
      console.error('Failed to load sample data:', fileError);
      return new Response(JSON.stringify({ error: 'Unable to load menu items right now.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
