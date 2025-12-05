'use client';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="font-heading text-lg text-primary">{item.name}</p>
        <p className="text-sm text-charcoal/70 font-semibold">R{Number(item.price).toFixed(2)} x {item.quantity}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="h-12 w-12 rounded-full bg-cream text-primary border border-gold/60 shadow-sm"
          onClick={() => onDecrement(item.id)}
          aria-label={`Decrease ${item.name} quantity`}
        >
          −
        </button>
        <span className="font-semibold min-w-[1.5rem] text-center">{item.quantity}</span>
        <button
          className="h-12 w-12 rounded-full bg-primary text-cream border-2 border-gold shadow-sm hover:shadow-[0_0_10px_#E46A28]"
          onClick={() => onIncrement(item.id)}
          aria-label={`Increase ${item.name} quantity`}
        >
          +
        </button>
        {onRemove ? (
          <button
            className="ml-3 text-sm text-primary underline underline-offset-4 min-h-[48px]"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
