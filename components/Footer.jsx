import Link from 'next/link';

const contactLinks = [
  { label: 'WhatsApp / Call: 081 749 2724', href: 'tel:0817492724' },
  { label: 'Instagram: @dialabraaict', href: 'https://instagram.com/dialabraaict' },
  { label: 'Email: dialabraai@gmail.com', href: 'mailto:dialabraai@gmail.com' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gold/20 bg-charcoal text-cream">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Dial-A-Braai</p>
          <p className="text-lg font-heading leading-tight">
            Flame-fired halal braai catering Cape Town families have trusted for years.
          </p>
          <p className="text-sm text-cream/70">Payment in person on delivery or collection.</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading text-lg text-gold">Visit</h3>
          <p className="text-sm text-cream/80">We braai on-site and deliver across Cape Town.</p>
          <p className="text-sm text-cream/80">Cape Flats · Southern Suburbs · Atlantic Seaboard</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-heading text-lg text-gold">Connect</h3>
          <div className="space-y-2 text-sm">
            {contactLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-cream/80 transition hover:text-gold"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 bg-black/30 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} Dial-A-Braai. Crafted with pride in Cape Town.
      </div>
    </footer>
  );
}
