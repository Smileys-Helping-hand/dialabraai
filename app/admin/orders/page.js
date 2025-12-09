'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminOrderCard from '../../../components/AdminOrderCard';
import AdminStatusButtons from '../../../components/AdminStatusButtons';
import OrderStatusBadge from '../../../components/OrderStatusBadge';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) || null, [orders, selectedId]);

  // Filtered orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter (name, phone, or order ID)
      const matchesSearch = !searchQuery || 
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone?.includes(searchQuery) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders/list');
        if (!active) return;
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data || []);
        if (data && data.length > 0) {
          setSelectedId((prev) => prev || data[0].id);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const updateStatus = async (status) => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to update status');
      const updated = json.order;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePaid = async () => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, paid: !selected.paid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to update payment status');
      const updated = json.order;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const printReceipt = () => {
    if (!selected) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${selected.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #E46A28; }
            .header { border-bottom: 2px solid #E46A28; padding-bottom: 10px; margin-bottom: 20px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #333; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔥 Dial-A-Braai</h1>
            <p>Order Receipt</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Order ID:</strong> ${selected.id}</p>
            <p><strong>Date:</strong> ${new Date(selected.created_at).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="text-transform: capitalize;">${selected.status}</span></p>
            <p><strong>Payment:</strong> ${selected.paid ? 'Paid' : 'Pending'}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${selected.customer_name}</p>
            <p><strong>Phone:</strong> ${selected.customer_phone}</p>
            ${selected.customer_email ? `<p><strong>Email:</strong> ${selected.customer_email}</p>` : ''}
            ${selected.notes ? `<p><strong>Notes:</strong> ${selected.notes}</p>` : ''}
          </div>

          <div class="items">
            <h3>Order Items</h3>
            ${selected.items.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
              </div>
            `).join('')}
          </div>

          <div class="total">
            <div style="display: flex; justify-between;">
              <span>Total:</span>
              <span>R${Number(selected.total_price || 0).toFixed(2)}</span>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Thank you for your order!</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #E46A28; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
              Print Receipt
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Search and Filter Header */}
        <div className="bg-white border-2 border-charcoal/10 rounded-3xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Box */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, phone, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border-2 border-charcoal/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-charcoal/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white font-semibold"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Results Count */}
          {(searchQuery || statusFilter !== 'all') && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/70">
                Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong>
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Dashboard</p>
              <h1 className="text-3xl font-heading text-primary">Today’s Orders</h1>
              <div className="h-1 w-16 bg-gold mt-2 rounded-full" />
            </div>
            {loading && <span className="text-xs text-charcoal/70">Loading…</span>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && filteredOrders.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-charcoal/70">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No orders match your search criteria.' 
                  : 'No orders yet.'}
              </p>
            </div>
          )}
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="card h-24 animate-pulse bg-gradient-to-br from-cream to-[#FDF3D2]" />
              ))
            : filteredOrders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onSelect={setSelectedId}
                  isSelected={order.id === selectedId}
                />
              ))}
        </div>
        <div className="md:col-span-2 card p-6 space-y-4">
          {selected ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-heading text-primary">Order Details</h2>
                  <p className="text-sm text-charcoal/70">
                    {selected.customer_name} • {selected.customer_phone}
                  </p>
                  {selected.customer_email && (
                    <p className="text-sm text-charcoal/70">
                      📧 {selected.customer_email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={selected.status} />
                  <button
                    onClick={printReceipt}
                    className="px-4 py-2 bg-charcoal/10 text-charcoal rounded-xl hover:bg-charcoal/20 transition flex items-center gap-2"
                    title="Print Receipt"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
              <AdminStatusButtons
                currentStatus={selected.status}
                onUpdate={updateStatus}
                isUpdating={isUpdating}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm">Payment</span>
                <button
                  disabled={isUpdating}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl text-sm font-semibold transition border-2 ${
                    selected.paid
                      ? 'bg-green-700 text-white border-green-800'
                      : 'bg-primary text-cream border-gold hover:shadow-[0_0_10px_#E46A28]'
                  } ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={togglePaid}
                  aria-label={selected.paid ? 'Payment Received' : 'Mark as Paid'}
                >
                  {selected.paid ? 'Payment Received' : 'Mark as Paid'}
                </button>
              </div>
              <div className="border-t border-orange/10 pt-4 text-sm space-y-2">
                <div className="space-y-1">
                  <p className="font-semibold text-charcoal">Items</p>
                  <ul className="list-disc list-inside text-charcoal/80">
                    {Array.isArray(selected.items) && selected.items.length > 0 ? (
                      selected.items.map((item, idx) => (
                        <li key={`${item.name}-${idx}`}>
                          {item.quantity || 1} × {item.name} — R{Number(item.price || 0).toFixed(2)}
                        </li>
                      ))
                    ) : (
                      <li>No items recorded</li>
                    )}
                  </ul>
                </div>
                <p className="font-semibold text-primary text-base">
                  Total: <span className="text-gold">R{Number(selected.total_price || 0).toFixed(2)}</span>
                </p>
                {selected.notes && <p className="text-sm text-charcoal/70">Notes: {selected.notes}</p>}
                {selected.created_at && (
                  <p className="text-xs text-charcoal/60">Created: {new Date(selected.created_at).toLocaleString()}</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal/70">Select an order to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
}
