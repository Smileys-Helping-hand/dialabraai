'use client';

import { useEffect, useMemo, useState } from 'react';
import MenuItemCard from '../../../components/MenuItemCard';
import { menuCategories } from '../../../lib/utils';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: menuCategories[0],
  image_url: '',
};

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const title = useMemo(() => (editingId ? 'Update Menu Item' : 'Add New Menu Item'), [editingId]);

  useEffect(() => {
    let active = true;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/menu/list');
        if (!active) return;
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        setItems(data || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchItems();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || menuCategories[0],
      image_url: item.image_url || '',
    });
    setFile(null);
  };

  const handleDelete = async (item) => {
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Delete this menu item?');
    if (!confirmed) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/menu/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, delete: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to delete item');
      setItems((prev) => prev.filter((m) => m.id !== item.id));
      if (editingId === item.id) resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadIfNeeded = async () => {
    if (!file) return form.image_url || '';
    
    // TODO: Implement Firebase Storage upload or use external service
    // For now, return a placeholder or the existing image_url
    console.warn('File upload not yet implemented for Firebase. Use external storage or Firebase Storage SDK.');
    return form.image_url || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const uploadedUrl = await handleUploadIfNeeded();
      const payload = {
        ...form,
        price: Number(form.price),
        image_url: uploadedUrl,
      };

      const endpoint = editingId ? '/api/menu/update' : '/api/menu/add';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to save menu item');

      if (json.item) {
        setItems((prev) => {
          const without = prev.filter((m) => m.id !== json.item.id);
          return [json.item, ...without].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        });
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:grid md:grid-cols-5">
        <section className="md:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-heading text-primary">{title}</h1>
            {saving && <span className="text-xs text-charcoal/70">Saving…</span>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Snoek – Large"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Marinated and smoked"
                rows={3}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal">Price (R)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="150"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-charcoal">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {menuCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal">Image URL (optional)</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="https://images..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              {file && <p className="text-xs text-charcoal/70">Selected: {file.name}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="button-primary"
                disabled={saving}
              >
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="md:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-primary">Menu Items</h2>
            {loading && <span className="text-xs text-charcoal/70">Loading…</span>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && items.length === 0 && <p className="text-sm text-charcoal/70">No menu items yet.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
