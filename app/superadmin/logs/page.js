'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollText, Play, Pause } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [apps, setApps] = useState([]);
  const [filters, setFilters] = useState({
    appId: '',
    endpoint: '',
    statusCode: '',
    from: '',
    to: '',
  });
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ total_count: 0, error_rate: 0, avg_duration_ms: 0 });
  const [scrollPos, setScrollPos] = useState(0);
  const tableRef = useRef(null);

  // Load apps
  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await fetch('/api/superadmin/apps');
        const data = await res.json();
        setApps(data.apps || []);
      } catch (err) {
        console.error('Failed to load apps:', err);
      }
    };
    loadApps();
  }, []);

  // Auto-refresh logs
  useEffect(() => {
    if (isPaused) return;

    const loadLogs = async () => {
      try {
        const query = new URLSearchParams();
        if (filters.appId) query.append('appId', filters.appId);
        if (filters.endpoint) query.append('endpoint', filters.endpoint);
        if (filters.statusCode) query.append('statusCode', filters.statusCode);
        if (filters.from) query.append('from', filters.from);
        if (filters.to) query.append('to', filters.to);

        const res = await fetch(`/api/superadmin/logs?${query}`);
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || { total_count: 0, error_rate: 0, avg_duration_ms: 0 });
      } catch (err) {
        console.error('Failed to load logs:', err);
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, [filters, isPaused]);

  const getStatusColor = (code) => {
    if (code >= 500) return 'bg-red-100 text-red-700';
    if (code >= 400) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  const getAppName = (appId) => {
    return apps.find(a => a.id === appId)?.name || appId || '(internal)';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-charcoal">API Logs</h1>
          <p className="text-sm text-charcoal/50">Real-time API call monitoring</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-charcoal/8 bg-white p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={filters.appId}
            onChange={(e) => setFilters({ ...filters, appId: e.target.value })}
            className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Apps</option>
            {apps.map(app => (
              <option key={app.id} value={app.id}>{app.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Endpoint filter"
            value={filters.endpoint}
            onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
            className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
          />

          <select
            value={filters.statusCode}
            onChange={(e) => setFilters({ ...filters, statusCode: e.target.value })}
            className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="200">2xx (Success)</option>
            <option value="400">4xx (Client Error)</option>
            <option value="500">5xx (Server Error)</option>
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
          />

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              isPaused ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? 'Paused' : 'Live'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-charcoal/50">Total Calls</p>
          <p className="text-3xl font-bold text-charcoal mt-1">{stats.total_count}</p>
        </div>
        <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-charcoal/50">Error Rate</p>
          <p className={`text-3xl font-bold mt-1 ${stats.error_rate > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
            {Number(stats.error_rate || 0).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-charcoal/50">Avg Duration</p>
          <p className="text-3xl font-bold text-charcoal mt-1">{Math.round(stats.avg_duration_ms || 0)}ms</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-charcoal/8 bg-white overflow-hidden" ref={tableRef}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 bg-charcoal/2">
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">App</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Method</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Endpoint</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-charcoal">Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-charcoal/50">
                    No logs yet
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={`${log.id}-${i}`} className="border-b border-charcoal/8 hover:bg-charcoal/2 transition">
                    <td className="px-4 py-3 text-charcoal/60 text-xs">
                      <time title={new Date(log.created_at).toLocaleString()}>
                        {formatRelative(new Date(log.created_at))}
                      </time>
                    </td>
                    <td className="px-4 py-3 text-charcoal truncate">{getAppName(log.app_id)}</td>
                    <td className="px-4 py-3 text-charcoal/70 font-mono text-xs">{log.method}</td>
                    <td className="px-4 py-3 text-charcoal/70 text-xs truncate">{log.endpoint}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-charcoal/60 text-xs">{log.duration_ms}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatRelative(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
