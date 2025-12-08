'use client';

const statusOrder = ['pending', 'preparing', 'ready', 'completed'];

export default function AdminStatusButtons({ currentStatus = 'pending', onUpdate, isUpdating }) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Get available status changes (next status or previous status)
  const availableStatuses = [];
  
  // Can go backwards (revert) unless at the first status
  if (currentIndex > 0) {
    availableStatuses.push({
      status: statusOrder[currentIndex - 1],
      label: `Revert to ${statusOrder[currentIndex - 1]}`,
      isRevert: true
    });
  }
  
  // Can go forwards unless at the last status
  if (currentIndex < statusOrder.length - 1) {
    const nextStatus = statusOrder[currentIndex + 1];
    availableStatuses.push({
      status: nextStatus,
      label: nextStatus === 'preparing' ? 'Mark as Preparing' :
             nextStatus === 'ready' ? 'Mark as Ready' :
             'Mark as Completed',
      isRevert: false
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableStatuses.map(({ status, label, isRevert }) => (
        <button
          key={status}
          disabled={isUpdating || !onUpdate}
          className={`min-h-[48px] px-4 py-3 rounded-2xl text-sm font-semibold transition border-2 shadow-sm
            ${isUpdating || !onUpdate 
              ? 'bg-cream text-charcoal/40 cursor-not-allowed border-charcoal/15' 
              : isRevert
                ? 'bg-amber-600 text-white border-amber-700 hover:shadow-[0_0_10px_rgba(217,119,6,0.5)]'
                : 'bg-primary text-cream border-gold hover:shadow-[0_0_10px_#E46A28]'
            }
          `}
          onClick={() => onUpdate && onUpdate(status)}
          aria-label={label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
