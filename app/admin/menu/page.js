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
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const title = useMemo(() => (editingId ? 'Update Menu Item' : 'Add New Menu Item'), [editingId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setItems(data || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
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
      
      // Refresh the entire list from Firebase to ensure consistency
      await fetchItems();
      
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

      // Refresh the entire list from Firebase to ensure consistency
      await fetchItems();

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const parseBulkMenu = (text) => {
    const lines = text.trim().split('\n');
    const items = [];
    let currentCategory = 'Mains';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect category headers
      if (trimmed.match(/^(Meat|Chicken|Seafood|Sides|Combos|Salads|Snacks|Specialty)$/i)) {
        const categoryMap = {
          'meat': 'Mains',
          'chicken': 'Mains', 
          'seafood': 'Starters',
          'sides': 'Sides',
          'combos': 'Mains',
          'salads': 'Sides',
          'snacks': 'Sides',
          'specialty': 'Mains'
        };
        currentCategory = categoryMap[trimmed.toLowerCase()] || 'Mains';
        continue;
      }

      // Parse menu item with price - format: "Item Name (details): R250.00" or "Item Name: R250.00"
      const priceMatch = trimmed.match(/^(.+?):\s*R?(\d+(?:\.\d{2})?)$/);
      if (priceMatch) {
        let [, namePart, price] = priceMatch;
        
        // Extract description from parentheses
        let description = '';
        const descMatch = namePart.match(/^([^(]+)\(([^)]+)\)/);
        if (descMatch) {
          namePart = descMatch[1].trim();
          description = descMatch[2].trim();
        }

        items.push({
          name: namePart.trim(),
          description: description,
          price: parseFloat(price),
          category: currentCategory,
          image_url: ''
        });
      }
    }
    
    return items;
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      setError('Please paste your menu text');
      return;
    }

    setBulkImporting(true);
    setError('');
    
    try {
      const parsedItems = parseBulkMenu(bulkText);
      
      if (parsedItems.length === 0) {
        throw new Error('No valid menu items found. Make sure format is: "Item Name (description): R250.00"');
      }

      let successCount = 0;
      let failCount = 0;

      for (const item of parsedItems) {
        try {
          const res = await fetch('/api/menu/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
          
          if (res.ok) {
            const json = await res.json();
            if (json.item) {
              setItems((prev) => [json.item, ...prev]);
              successCount++;
            }
          } else {
            const errorData = await res.json();
            if (errorData.error && errorData.error.includes('Firebase is not configured')) {
              throw new Error('Firebase Admin SDK not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to environment variables.');
            }
            failCount++;
          }
        } catch (err) {
          if (err.message.includes('Firebase')) {
            throw err;
          }
          failCount++;
        }
      }

      // Refresh the entire list from Firebase to ensure consistency
      await fetchItems();
      
      setBulkText('');
      setShowBulkImport(false);
      alert(`Import complete!\n✅ Successfully added: ${successCount}\n❌ Failed: ${failCount}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:grid md:grid-cols-5">
        <section className="md:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-heading text-primary">{title}</h1>
            <button
              onClick={() => setShowBulkImport(!showBulkImport)}
              className="px-3 py-1 text-sm bg-gold/20 text-primary rounded-lg hover:bg-gold/30 transition"
            >
              {showBulkImport ? 'Cancel' : 'Bulk Import'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          
          {showBulkImport ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-sm">
                <p className="font-semibold text-amber-900 mb-2">📋 Bulk Import Instructions:</p>
                <p className="text-amber-800 mb-1">Paste your menu in this format:</p>
                <pre className="text-xs bg-white p-2 rounded mt-2 text-charcoal">
{`Meat
T-Bone Steak (200g-300g): R40.00
Lamb Chops (+ 12-13 pieces): R255.00

Chicken
Mixed Chicken Portions (7 Pieces): R95.00

Salads
Greek Salad: R95.00`}
                </pre>
              </div>
              
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste your menu here..."
                className="w-full h-64 px-4 py-3 border-2 border-charcoal/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleBulkImport}
                  disabled={bulkImporting || !bulkText.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkImporting ? 'Importing...' : '✅ Import Menu'}
                </button>
                <button
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkText('');
                  }}
                  className="px-4 py-2 bg-charcoal/10 text-charcoal rounded-xl hover:bg-charcoal/20 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {saving && <span className="text-xs text-charcoal/70">Saving…</span>}
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
                placeholder="https://images.unsplash.com/photo-..."
              />
              {form.image_url && (
                <div className="mt-2 p-2 border border-charcoal/10 rounded-lg bg-white">
                  <p className="text-xs text-charcoal/70 mb-2">Image Preview:</p>
                  <img 
                    src={form.image_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden text-xs text-red-600 mt-2">
                    ⚠️ Unable to load image. Check the URL.
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal">Upload Image</label>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <p className="font-semibold mb-1">📌 Note:</p>
                <p>File upload requires Firebase Storage setup. For now, use direct image URLs from:</p>
                <ul className="list-disc ml-4 mt-1 space-y-0.5">
                  <li><a href="https://unsplash.com" target="_blank" className="text-flame hover:underline">Unsplash</a> (free stock photos)</li>
                  <li><a href="https://imgur.com" target="_blank" className="text-flame hover:underline">Imgur</a> (image hosting)</li>
                  <li>Your own hosting service</li>
                </ul>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-orange/30 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                disabled
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
          </>
          )}
        </section>
        <section className="md:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-primary">Menu Items</h2>
            {loading && <span className="text-xs text-charcoal/70">Loading…</span>}
          </div>

          {/* Info box for creating menu packs */}
          <div className="p-4 bg-gold/10 border-2 border-gold/30 rounded-xl text-sm">
            <p className="font-semibold text-primary mb-2">💡 Creating Combo Packs:</p>
            <p className="text-charcoal/80 text-xs mb-2">
              To create combo packs (e.g., "Family Braai Pack"), add to Firestore with:
            </p>
            <pre className="text-xs bg-white p-2 rounded text-charcoal overflow-x-auto">
{`{
  name: "Family Braai Pack",
  category: "Packs",
  price: 299.99,
  isPack: true,
  items: [
    { id: "chops", name: "Lamb Chops", quantity: 10, price: 15.00 },
    { id: "chicken", name: "Chicken Pieces", quantity: 8, price: 12.00 }
  ]
}`}
            </pre>
            <p className="text-xs text-charcoal/70 mt-2">
              Run <code className="bg-white px-1 rounded">node scripts/add-sample-packs.js</code> to add examples
            </p>
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
