import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';
import SiteLoginGate from '@/components/SiteLoginGate';
import { Suspense } from 'react';
import { Inter, Plus_Jakarta_Sans, Syne, Playfair_Display, Nunito, Space_Grotesk, Oswald } from 'next/font/google';
import ShopProvider from '@/components/ShopProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-playfair',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-oswald',
});

export const metadata = {
  title: 'Graze — Local Shop Ordering',
  description: 'Browse and order from local food shops in your area.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const allFontVars = [
  inter.variable,
  jakarta.variable,
  syne.variable,
  playfair.variable,
  nunito.variable,
  spaceGrotesk.variable,
  oswald.variable,
].join(' ');

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`bg-cream scroll-smooth ${allFontVars}`}>
      <body className={`${inter.className} bg-cream text-charcoal min-h-screen flex flex-col antialiased`}>
        <SiteLoginGate>
          <Suspense fallback={null}>
            <ShopProvider>
              <AuthProvider>
                <a href="#main-content" className="skip-link">Skip to content</a>
                <Navbar />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
              </AuthProvider>
            </ShopProvider>
          </Suspense>
        </SiteLoginGate>
      </body>
    </html>
  );
}
