import Link from 'next/link';

export default function SuccessPage({ searchParams }) {
  const orderId = searchParams?.orderId;
  const trackingHref = orderId ? `/order/${orderId}` : '/order';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="section-surface p-8 space-y-3">
        <h1 className="text-4xl font-heading text-primary">Order Received!</h1>
        <p className="text-charcoal/85 leading-relaxed">
          Thank you — we’ve started preparing your meal.
          <br />
          Show your order number when collecting.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href={trackingHref} className="brand-button">
            Track Your Order
          </Link>
          <Link href="/menu" className="button-secondary">
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
