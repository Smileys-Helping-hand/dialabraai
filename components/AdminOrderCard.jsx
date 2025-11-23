import OrderStatusBadge from './OrderStatusBadge';

export default function AdminOrderCard({ order, onSelect, isSelected }) {
  const itemCount = Array.isArray(order?.items) ? order.items.length : 0;

  return (
    <button
      onClick={() => onSelect(order)}
      className={`w-full text-left card p-5 transition border-2 ${
        isSelected
          ? 'border-gold shadow-[0_0_10px_#E46A28]'
          : 'border-transparent hover:border-gold/70 hover:shadow-[0_0_10px_rgba(228,106,40,0.35)]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg text-primary">Order {String(order.id).slice(0, 6)}</h3>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-charcoal/75">
        {order.customer_name || 'Customer'} • {order.customer_phone || 'N/A'}
      </p>
      <p className="text-sm mt-2">Items: {itemCount}</p>
      <p className="font-semibold text-primary mt-1">
        Total: <span className="text-gold font-bold">R{Number(order.total_price || 0).toFixed(2)}</span>
      </p>
    </button>
  );
}
