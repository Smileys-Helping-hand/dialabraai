import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { demoStore } from '@/lib/demo-store';

export const dynamic = 'force-dynamic';

const toCurrencyNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

function calculateStats(orders) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter completed orders only for revenue
  const completedOrders = orders.filter(order => order.status === 'completed');
  
  const ordersToday = completedOrders.filter((order) => new Date(order.created_at) >= startOfDay);
  const ordersThisWeek = completedOrders.filter((order) => new Date(order.created_at) >= startOfWeek);
  const ordersThisMonth = completedOrders.filter((order) => new Date(order.created_at) >= startOfMonth);

  const totalOrdersToday = ordersToday.length;
  const totalIncomeToday = ordersToday.reduce((sum, order) => sum + toCurrencyNumber(order.total_price), 0);
  
  const totalOrdersWeek = ordersThisWeek.length;
  const totalIncomeWeek = ordersThisWeek.reduce((sum, order) => sum + toCurrencyNumber(order.total_price), 0);
  
  const totalOrdersMonth = ordersThisMonth.length;
  const totalIncomeMonth = ordersThisMonth.reduce((sum, order) => sum + toCurrencyNumber(order.total_price), 0);

  const dailyIncomeMap = new Map();
  const bestSellerMap = new Map();
  const categoryMap = new Map();
  let totalItemsSold = 0;

  completedOrders.forEach((order) => {
    const createdDate = new Date(order.created_at);
    const key = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(
      createdDate.getDate()
    ).padStart(2, '0')}`;
    dailyIncomeMap.set(key, (dailyIncomeMap.get(key) || 0) + toCurrencyNumber(order.total_price));

    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const name = item.name || item.id || 'Unknown item';
      bestSellerMap.set(name, (bestSellerMap.get(name) || 0) + qty);
      totalItemsSold += qty;
      if (item.category) {
        categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + qty);
      }
    });
  });

  const dailyIncome = Array.from(dailyIncomeMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const bestSellers = Array.from(bestSellerMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const ordersPerCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalOrdersToday,
    totalIncomeToday,
    totalOrdersWeek,
    totalIncomeWeek,
    totalOrdersMonth,
    totalIncomeMonth,
    dailyIncome,
    bestSellers,
    ordersPerCategory,
    totalItemsSold,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
  };
}

export async function GET() {
  // If Firebase is not configured, use demo orders
  if (!adminDb) {
    console.log('📊 Demo mode: calculating stats from demo orders');
    const orders = demoStore.getAllOrders();
    return NextResponse.json(calculateStats(orders));
  }

  try {
    const snapshot = await adminDb
      .collection('orders')
      .orderBy('created_at', 'desc')
      .get();

    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(calculateStats(orders));
  } catch (error) {
    console.error('Failed to fetch stats', error);
    // If Firestore has any configuration issues, use demo orders
    if (error.code === 5 || error.code === 7 || error.reason === 'SERVICE_DISABLED') {
      console.log('⚠️  Firestore not available - using demo orders for stats');
      const orders = demoStore.getAllOrders();
      return NextResponse.json(calculateStats(orders));
    }
    return NextResponse.json({ error: 'Unable to load stats' }, { status: 500 });
  }
}
