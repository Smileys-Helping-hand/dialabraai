'use client';

import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/price';

const fetchStats = async () => {
  const res = await fetch('/api/admin/stats');
  if (!res.ok) {
    throw new Error('Unable to fetch stats');
  }
  return res.json();
};

const StatCard = ({ label, value, hint }) => (
  <div className="card p-5 space-y-1 border border-orange/10">
    <p className="text-sm uppercase tracking-wide text-charcoal/70">{label}</p>
    <p className="text-2xl font-heading text-primary">{value}</p>
    {hint ? <p className="text-xs text-charcoal/60">{hint}</p> : null}
  </div>
);

const Section = ({ title, children }) => (
  <section className="card p-6 space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-heading text-primary">{title}</h2>
    </div>
    {children}
  </section>
);

function StatsBody() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats, refetchInterval: 30000, staleTime: 30000 });

  const monthlyTotal = useMemo(
    () => (data?.monthlyIncome || []).reduce((sum, entry) => sum + Number(entry.total || 0), 0),
    [data?.monthlyIncome],
  );

  const bestSellers = data?.bestSellers || [];
  const ordersPerCategory = data?.ordersPerCategory || [];
  const incomeToday = data?.totalIncomeToday || 0;
  const ordersToday = data?.totalOrdersToday || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="card h-28 animate-pulse bg-cream" />
          ))}
        </div>
        <div className="card h-64 animate-pulse bg-cream" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card h-48 animate-pulse bg-cream" />
          <div className="card h-48 animate-pulse bg-cream" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
        Unable to load analytics right now. Please refresh.
        <button
          onClick={() => refetch()}
          className="ml-3 inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Today’s Summary" value={ordersToday} hint="Orders placed so far" />
        <StatCard label="Total Income" value={formatCurrency(incomeToday)} hint="Cash or EFT on collection/delivery" />
        <StatCard label="Monthly Performance" value={formatCurrency(monthlyTotal)} hint="Gross revenue (VAT-free)" />
      </div>

      <Section title="Monthly Performance">
        {data?.monthlyIncome?.length ? (
          <div className="space-y-2">
            {data.monthlyIncome.map((entry) => (
              <div key={entry.date} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-charcoal/80">
                  <span className="font-semibold">{entry.date}</span>
                  <span className="text-orange font-semibold">{formatCurrency(entry.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-cream overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange to-primary"
                    style={{ width: `${Math.min(100, (entry.total / Math.max(monthlyTotal, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal/70">No orders recorded this month yet.</p>
        )}
      </Section>

      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Top Selling Items">
          {bestSellers.length ? (
            <ul className="space-y-2">
              {bestSellers.map((item) => (
                <li key={item.name} className="flex items-center justify-between rounded-lg bg-cream px-3 py-2">
                  <span className="font-medium text-charcoal">{item.name}</span>
                  <span className="text-sm text-orange font-semibold">{item.count} sold</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal/70">No sales data available.</p>
          )}
        </Section>

        <Section title="Orders by Category">
          {ordersPerCategory.length ? (
            <ul className="space-y-2">
              {ordersPerCategory.map((item) => (
                <li key={item.category} className="flex items-center justify-between rounded-lg bg-cream px-3 py-2">
                  <span className="font-medium text-charcoal">{item.category}</span>
                  <span className="text-sm text-orange font-semibold">{item.count} items</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal/70">No category breakdown yet.</p>
          )}
        </Section>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => refetch()}
          className="button-secondary inline-flex items-center gap-2"
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>
    </div>
  );
}

export default function AdminStatsPage() {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <div className="min-h-screen bg-cream px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Analytics</p>
              <h1 className="text-3xl font-heading text-primary">Sales & Operations Insight</h1>
              <p className="text-sm text-charcoal/70">Today’s Summary, Total Income, Orders by Category, and Top Selling Items.</p>
            </div>
          </div>

          <StatsBody />
        </div>
      </div>
    </QueryClientProvider>
  );
}
