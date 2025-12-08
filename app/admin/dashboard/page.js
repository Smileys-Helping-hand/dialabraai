'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [statsRes, inventoryRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/inventory')
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventory(inventoryData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const lowStockItems = inventory.filter(item => item.stock <= item.low_stock_threshold);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-charcoal/60">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-primary mb-3">Dashboard</h1>
        <p className="text-lg text-charcoal/70">Welcome! Here's your business overview</p>
      </div>

      {/* Alert for low stock */}
      {lowStockItems.length > 0 && (
        <div className="mb-8 bg-red-50 border-4 border-red-400 rounded-3xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-red-800 mb-3 flex items-center gap-2">
            <span className="text-3xl">⚠️</span> Low Stock Alert
          </h3>
          <p className="text-lg text-red-700 mb-3">The following items are running low:</p>
          <ul className="space-y-2">
            {lowStockItems.map(item => (
              <li key={item.id} className="text-lg text-red-800 font-semibold">
                • {item.name}: Only <strong className="text-2xl">{item.stock}</strong> left (Min: {item.low_stock_threshold})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Revenue"
          value={`R${stats?.totalIncomeToday?.toFixed(2) || '0.00'}`}
          subtitle={`${stats?.totalOrdersToday || 0} orders`}
          color="bg-green-50 border-green-400 text-green-800"
        />
        <StatsCard
          title="This Week"
          value={`R${stats?.totalIncomeWeek?.toFixed(2) || '0.00'}`}
          subtitle={`${stats?.totalOrdersWeek || 0} orders`}
          color="bg-blue-50 border-blue-400 text-blue-800"
        />
        <StatsCard
          title="This Month"
          value={`R${stats?.totalIncomeMonth?.toFixed(2) || '0.00'}`}
          subtitle={`${stats?.totalOrdersMonth || 0} orders`}
          color="bg-purple-50 border-purple-400 text-purple-800"
        />
        <StatsCard
          title="Items Sold"
          value={stats?.totalItemsSold || 0}
          subtitle="All time"
          color="bg-orange-50 border-orange-400 text-orange-800"
        />
      </div>

      {/* Current Orders Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-4 border-charcoal/10 rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-6">Current Orders</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-amber-50 rounded-2xl">
              <span className="text-lg font-semibold text-charcoal/70">Pending</span>
              <span className="text-4xl font-bold text-amber-600">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
              <span className="text-lg font-semibold text-charcoal/70">Preparing</span>
              <span className="text-4xl font-bold text-blue-600">{stats?.preparingOrders || 0}</span>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="mt-6 block text-center brand-button w-full text-xl py-4"
          >
            📦 Manage Orders
          </Link>
        </div>

        <div className="bg-white border-4 border-charcoal/10 rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              href="/admin/orders"
              className="block px-6 py-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition font-bold text-lg text-center"
            >
              📦 View All Orders
            </Link>
            <Link
              href="/admin/menu"
              className="block px-6 py-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition font-bold text-lg text-center"
            >
              🍖 Manage Menu
            </Link>
            <Link
              href="/admin/stats"
              className="block px-6 py-4 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition font-bold text-lg text-center"
            >
              📈 View Statistics
            </Link>
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      {stats?.bestSellers && stats.bestSellers.length > 0 && (
        <div className="bg-white border-4 border-charcoal/10 rounded-3xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">🏆 Top Sellers</h2>
          <div className="space-y-4">
            {stats.bestSellers.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-cream/50 rounded-2xl">
                <span className="text-lg font-bold text-charcoal">
                  <span className="text-2xl mr-3">{index + 1}.</span> {item.name}
                </span>
                <span className="text-2xl font-bold text-primary">{item.count} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Overview */}
      <div className="bg-white border-4 border-charcoal/10 rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-primary mb-6">📦 Inventory Status</h2>
        {inventory.length === 0 ? (
          <p className="text-lg text-charcoal/60">No inventory data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-charcoal/10">
                  <th className="text-left py-4 px-3 font-bold text-charcoal text-lg">Item</th>
                  <th className="text-center py-4 px-3 font-bold text-charcoal text-lg">Stock</th>
                  <th className="text-center py-4 px-3 font-bold text-charcoal text-lg">Sold</th>
                  <th className="text-center py-4 px-3 font-bold text-charcoal text-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className="border-b border-charcoal/5">
                    <td className="py-4 px-3 font-bold text-lg">{item.name}</td>
                    <td className="py-4 px-3 text-center text-xl font-bold">{item.stock}</td>
                    <td className="py-4 px-3 text-center text-xl font-bold">{item.total_sold || 0}</td>
                    <td className="py-4 px-3 text-center">
                      {item.stock <= item.low_stock_threshold ? (
                        <span className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-full text-base font-bold">
                          ⚠️ Low Stock
                        </span>
                      ) : (
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-base font-bold">
                          ✓ In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtitle, color }) {
  return (
    <div className={`border-2 rounded-2xl p-6 ${color}`}>
      <h3 className="text-sm font-semibold opacity-80 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-70">{subtitle}</p>
    </div>
  );
}
