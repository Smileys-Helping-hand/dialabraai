import { adminDb } from '@/lib/firebase-admin';
import { demoStore } from '@/lib/demo-store';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  // If Firebase isn't configured, fall back to sample data
  if (!adminDb) {
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
      console.error('No Firebase and failed to load sample data:', err);
      return new Response(
        JSON.stringify({ error: 'Firebase is not configured and no sample data available.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  try {
    const snapshot = await adminDb.collection('menu').orderBy('category').orderBy('name').get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return new Response(JSON.stringify(data || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch menu:', error.message);
    
    // If Firestore has any configuration issues, fall back to sample data
    // Error codes: 5 = NOT_FOUND (no database), 7 = SERVICE_DISABLED, etc.
    if (error.code === 5 || error.code === 7 || error.reason === 'SERVICE_DISABLED') {
      console.log('⚠️  Firestore not available - loading sample menu data');
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
    
    return new Response(JSON.stringify({ error: 'Unable to load menu items right now.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
