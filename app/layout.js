import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';
import SiteLoginGate from '@/components/SiteLoginGate';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Dial-A-Braai',
  description: 'Halal braai delivered with care in Cape Town',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-cream scroll-smooth">
      <body className={`${inter.className} bg-cream text-charcoal min-h-screen flex flex-col antialiased`}>
        <SiteLoginGate>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </SiteLoginGate>
      </body>
    </html>
  );
}
