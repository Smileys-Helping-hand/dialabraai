import Link from 'next/link';
import { menuCategories } from '../../lib/utils';

const highlights = [
  'Fire-grilled and halal-friendly, prepared fresh',
  'Collection and delivery across Cape Town',
  'Pay in person — admin confirms when you collect',
];

export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 items-center">
      <div className="section-surface p-8 space-y-6">
        <p className="text-flame font-semibold uppercase tracking-wide">Welcome to Dial-A-Braai</p>
        <h1 className="text-5xl font-heading text-primary leading-tight">Fire-Grilled Goodness, Made Fresh to Order.</h1>
        <p className="text-lg text-charcoal/85">Authentic South African flavours, slow-grilled to perfection.</p>
        <div className="space-y-2">
          {highlights.map((text) => (
            <div key={text} className="flex items-center gap-3 text-base">
              <span className="inline-flex h-3 w-3 rounded-full bg-gold border border-primary/40" />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/order" className="brand-button">Order now</Link>
          <Link href="/menu" className="button-secondary">Browse Menu</Link>
        </div>
      </div>
      <div className="card p-6 bg-cream/90 shadow-lg shadow-orange/10">
        <h2 className="font-heading text-2xl text-primary mb-4">What’s on the fire?</h2>
        <div className="grid grid-cols-2 gap-4">
          {menuCategories.map((cat) => (
            <div key={cat} className="p-4 rounded-xl bg-cream border border-charcoal/15 shadow-[0_0_12px_-8px_rgba(0,0,0,0.35)]">
              <p className="font-heading text-lg text-primary">{cat}</p>
              <p className="text-sm text-charcoal/70">Fire-grilled classics prepared to order.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
