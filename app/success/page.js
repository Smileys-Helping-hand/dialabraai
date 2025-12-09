import Link from 'next/link';

export default function SuccessPage({ searchParams }) {
  const orderId = searchParams?.orderId;
  const trackingHref = orderId ? `/order/${orderId}` : '/order';
  
  // WhatsApp number (format: country code + number without + or spaces)
  const whatsappNumber = '27837864913'; // Replace with your actual number
  const whatsappMessage = orderId 
    ? `Hi! I just placed order ${orderId}. I'd like to confirm the details.`
    : 'Hi! I just placed an order and would like to confirm.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="section-surface p-8 space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-heading text-primary">Order Received!</h1>
          <p className="text-lg text-charcoal/85 leading-relaxed">
            Thank you — we've started preparing your meal.
          </p>
          
          {orderId && (
            <div className="bg-cream/50 border-2 border-gold/30 rounded-2xl p-4 inline-block">
              <p className="text-sm text-charcoal/70 mb-1">Your Order Number</p>
              <p className="text-3xl font-bold text-primary font-mono">{orderId}</p>
            </div>
          )}
        </div>

        {/* Estimated Time */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800 font-semibold mb-1">⏱️ Estimated Ready Time</p>
          <p className="text-2xl font-bold text-blue-900">30-45 minutes</p>
          <p className="text-sm text-blue-700 mt-1">We'll notify you when it's ready!</p>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-left">
          <p className="font-bold text-amber-900 mb-2">📋 Next Steps:</p>
          <ul className="space-y-2 text-amber-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Track your order status in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Show order number <strong>#{orderId}</strong> when collecting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Payment on collection or delivery</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href={trackingHref} className="brand-button text-center">
            📦 Track Your Order
          </Link>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contact Us on WhatsApp
          </a>
        </div>

        {/* Secondary Actions */}
        <div className="pt-4 border-t border-charcoal/10">
          <Link href="/menu" className="button-secondary inline-block">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
