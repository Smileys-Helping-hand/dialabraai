const colorMap = {
  pending: 'bg-cream text-charcoal border border-charcoal/25',
  preparing: 'bg-flame/10 text-flame border border-flame/40',
  ready: 'bg-gold/20 text-primary border border-gold/60',
  completed: 'bg-green-100 text-green-900 border border-green-300',
};

const copyMap = {
  pending: 'Your order is in the queue.',
  preparing: 'We’re on the braai — almost ready!',
  ready: 'Your order is ready for collection.',
  completed: 'Enjoy your meal!',
};

export default function OrderStatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center min-h-[40px] ${
        colorMap[normalized] || 'bg-gray-200 text-gray-800'
      }`}
    >
      {copyMap[normalized] || normalized || 'pending'}
    </span>
  );
}
