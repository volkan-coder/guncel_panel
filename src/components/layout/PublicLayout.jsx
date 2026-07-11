import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Building2, Newspaper, Phone, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState('Properties For Sale Turkey');
  const [logoUrl, setLogoUrl] = useState('');
  const location = useLocation();

  useEffect(() => {
    base44.entities.SiteSettings.filter({}).then((settings) => {
      const nameSetting = settings.find((s) => s.key === 'site_name');
      if (nameSetting?.value) setSiteName(nameSetting.value);
      const logoSetting = settings.find((s) => s.key === 'site_logo');
      if (logoSetting?.value) setLogoUrl(logoSetting.value);
    }).catch(() => {});
  }, []);

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/listings', label: 'Properties', icon: Building2 },
    { to: '/blog', label: 'Blog', icon: Newspaper },
    { to: '/contact', label: 'Contact', icon: Phone },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-9 w-auto rounded-lg" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                  PF
                </div>
              )}
              <span className="font-jakarta font-bold text-sm text-slate-800 hidden sm:block">{siteName}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(to)
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/listings"
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Search className="w-4 h-4" />
                Browse Properties
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(to)
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-slate-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  PF
                </div>
                <span className="font-jakarta font-bold text-white">{siteName}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your trusted partner for premium real estate investments in Turkey.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/listings" className="hover:text-white transition-colors">Properties</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Property Management</li>
                <li>Investment Consulting</li>
                <li>Airport Transfer</li>
                <li>Furniture Packages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>info@propertiesforsaleturkey.com</li>
                <li>+90 242 000 00 00</li>
                <li>Antalya, Turkey</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
