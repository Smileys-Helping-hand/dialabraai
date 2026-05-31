import './globals.css';
import { AuthProvider } from '@/lib/auth';
import SiteLoginGate from '@/components/SiteLoginGate';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Suspense } from 'react';
import {
  Inter, Plus_Jakarta_Sans, Syne, Playfair_Display,
  Nunito, Space_Grotesk, Oswald,
} from 'next/font/google';
import ShopProvider from '@/components/ShopProvider';

const inter      = Inter({          subsets: ['latin'], display: 'swap', variable: '--font-inter'    });
const jakarta    = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700','800'], display: 'swap', variable: '--font-jakarta'  });
const syne       = Syne({           subsets: ['latin'], weight: ['400','500','600','700','800'],          display: 'swap', variable: '--font-syne'     });
const playfair   = Playfair_Display({ subsets: ['latin'], weight: ['400','500','600','700','800'],        display: 'swap', variable: '--font-playfair' });
const nunito     = Nunito({         subsets: ['latin'], weight: ['300','400','500','600','700','800'],    display: 'swap', variable: '--font-nunito'   });
const spaceGrot  = Space_Grotesk({  subsets: ['latin'], weight: ['300','400','500','600','700'],         display: 'swap', variable: '--font-space'    });
const oswald     = Oswald({         subsets: ['latin'], weight: ['300','400','500','600','700'],         display: 'swap', variable: '--font-oswald'   });

export const metadata = {
  title: 'Graze — Local Food Ordering',
  description: 'Order from local shops without the chaos. Browse, pick, done. No commission. No app needed.',
  keywords: ['food ordering', 'local shops', 'takeaway', 'braai', 'restaurant', 'South Africa'],
  manifest: '/manifest.json',
  themeColor: '#762C1B',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Graze' },
  openGraph: {
    title: 'Graze — Local Food Ordering',
    description: 'Order from your favourite local spots. No commission. No middleman.',
    type: 'website',
    locale: 'en_ZA',
  },
};

export const dynamic  = 'force-dynamic';
export const revalidate = 0;

const fontVars = [
  inter.variable, jakarta.variable, syne.variable, playfair.variable,
  nunito.variable, spaceGrot.variable, oswald.variable,
].join(' ');

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`bg-cream scroll-smooth ${fontVars}`} suppressHydrationWarning>
      <body className={`${inter.className} bg-cream text-charcoal min-h-screen flex flex-col antialiased`}>
        <SiteLoginGate>
          <Suspense fallback={null}>
            <ShopProvider>
              <AuthProvider>
                <a href="#main-content" className="skip-link">Skip to content</a>
                {/* LayoutWrapper owns ThemeEngine + Navbar/Sidebar + ThemeCustomizerPanel + Footer */}
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </AuthProvider>
            </ShopProvider>
          </Suspense>
        </SiteLoginGate>
      </body>
    </html>
  );
}
