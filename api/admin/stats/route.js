import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const toCurrencyNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and service role key.' },
      { status: 500 },
    );
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, total_price, created_at, items, status, paid')
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch stats', error);
    return NextResponse.json({ error: 'Unable to load stats' }, { status: 500 });
  }

  const orders = Array.isArray(data) ? data : [];
  const startOfDayISO = startOfDay.toISOString();

  const ordersToday = orders.filter((order) => order.created_at >= startOfDayISO);
  const totalOrdersToday = ordersToday.length;
  const totalIncomeToday = ordersToday.reduce(
    (sum, order) => sum + toCurrencyNumber(order.total_price),
    0,
  );

  const dailyIncomeMap = new Map();
  const bestSellerMap = new Map();
  const categoryMap = new Map();

  orders.forEach((order) => {
    const createdDate = new Date(order.created_at);
    const key = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(
      createdDate.getDate(),
    ).padStart(2, '0')}`;
    dailyIncomeMap.set(key, (dailyIncomeMap.get(key) || 0) + toCurrencyNumber(order.total_price));

    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const name = item.name || item.id || 'Unknown item';
      bestSellerMap.set(name, (bestSellerMap.get(name) || 0) + qty);
      if (item.category) {
        categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + qty);
      }
    });
  });

  const monthlyIncome = Array.from(dailyIncomeMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const bestSellers = Array.from(bestSellerMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const ordersPerCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalOrdersToday,
    totalIncomeToday,
    monthlyIncome,
    bestSellers,
    ordersPerCategory,
  });
}
