'use client';

const statusOrder = ['pending', 'preparing', 'ready', 'completed'];

export default function AdminStatusButtons({ currentStatus = 'pending', onUpdate, isUpdating }) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="flex flex-wrap gap-2">
      {statusOrder
        .filter((status) => status !== 'pending')
        .map((status) => {
          const targetIndex = statusOrder.indexOf(status);
          const disabled =
            isUpdating ||
            targetIndex <= currentIndex ||
            currentStatus === 'completed' ||
            !onUpdate;

          return (
            <button
              key={status}
              disabled={disabled}
              className={`min-h-[48px] px-4 py-3 rounded-2xl text-sm font-semibold transition border-2 shadow-sm
                ${disabled ? 'bg-cream text-charcoal/40 cursor-not-allowed border-charcoal/15' : 'bg-primary text-cream border-gold hover:shadow-[0_0_10px_#E46A28]'}
              `}
              onClick={() => onUpdate && onUpdate(status)}
              aria-label={`Set status to ${status}`}
            >
              {status === 'preparing' && 'Mark as Preparing'}
              {status === 'ready' && 'Mark as Ready'}
              {status === 'completed' && 'Mark as Completed'}
            </button>
          );
        })}
    </div>
  );
}
