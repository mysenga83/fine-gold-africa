// MainLayout — dark-only, triple-tap logo opens admin portal
import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LayoutDashboard, Wallet, ClipboardList, ShieldCheck, LogOut, User, Eye, EyeOff, ShieldAlert, MapPin, Phone, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '256764473988';
const FOOTER_BG = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260708/j.jpg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png';
const ADMIN_DOMAIN = 'mysenga83.com';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Buy Gold', href: '/buy-gold' },
  { label: 'Our Products', href: '/catalog' },
  { label: 'Buyer Guide', href: '/buyer-guide' },
  { label: 'Governance', href: '/governance' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const portalLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/wallet', icon: Wallet },
  { label: 'Orders', href: '/orders', icon: ClipboardList },
  { label: 'KYC Verification', href: '/kyc', icon: ShieldCheck },
];

/* ── Secret Admin Login Dialog ─────────────────────────────── */
function AdminLoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain !== ADMIN_DOMAIN) {
      toast.error('Access restricted to authorised personnel.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Sign-in failed.');
    } else {
      toast.success('Welcome back, admin.');
      onClose();
      navigate('/admin');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border p-0 overflow-hidden">
        {/* Gold top bar */}
        <div className="h-1 w-full bg-primary" />
        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-3">
              <img
                src={LOGO_URL}
                alt="Fine Gold Africa"
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.15) contrast(1.1)' }}
              />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl tracking-[0.15em] uppercase text-center text-foreground">Secure Portal</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mt-2 tracking-widest">Authorised Access Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`admin@${ADMIN_DOMAIN}`}
                className="bg-background border-border h-11 px-3"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background border-border h-11 px-3 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-12 hover:bg-primary/90"
            >
              {loading ? 'Authenticating…' : 'Sign In to Portal'}
            </Button>
          </form>

          <button
            onClick={onClose}
            className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground tracking-widest uppercase transition-colors"
          >
            ← Return to Platform
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Triple-tap detection on logo
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 800);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setAdminDialogOpen(true);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Secret Admin Login Dialog (triple-tap logo) */}
      <AdminLoginDialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo — triple-tap = secret admin entry */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group" onClick={handleLogoTap}>
            <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden select-none">
              <img
                src={LOGO_URL}
                alt="Fine Gold Africa"
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.15) contrast(1.1)' }}
              />
            </div>
            <span className="text-sm tracking-[0.18em] uppercase font-bold text-primary whitespace-nowrap">
              Fine Gold Africa
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs tracking-widest uppercase font-medium transition-colors whitespace-nowrap ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right — only show when logged in */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user && (
              <>
                <Button variant="ghost" size="icon" className="border border-border text-muted-foreground hover:text-primary w-9 h-9" asChild>
                  <Link to="/admin" aria-label="Admin Panel"><ShieldAlert className="h-4 w-4" /></Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10 gap-2 tracking-widest text-xs uppercase h-9 px-3">
                      <User className="h-4 w-4" />
                      <span className="max-w-[100px] truncate">{profile?.full_name || profile?.email || 'Account'}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                    {portalLinks.map(link => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link to={link.href} className="flex items-center gap-2 text-sm">
                          <link.icon className="h-4 w-4 text-primary" />
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground w-9 h-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card border-border flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 overflow-hidden shrink-0">
                      <img
                        src={LOGO_URL}
                        alt="Fine Gold Africa"
                        className="w-full h-full object-contain"
                        style={{ mixBlendMode: 'screen', filter: 'brightness(1.15) contrast(1.1)' }}
                      />
                    </div>
                    <span className="text-sm tracking-[0.18em] uppercase font-bold text-primary whitespace-nowrap">
                      Fine Gold Africa
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex flex-col gap-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-3 text-sm tracking-widest uppercase font-medium transition-colors border-b border-border/50 ${
                        isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {user && (
                  <div className="mt-4 flex flex-col gap-1">
                    <p className="px-4 py-2 text-xs tracking-widest uppercase text-primary font-semibold">Portal</p>
                    {portalLinks.map(link => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm flex items-center gap-3 text-muted-foreground hover:text-foreground border-b border-border/50"
                      >
                        <link.icon className="h-4 w-4 text-primary" />
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-sm flex items-center gap-3 text-muted-foreground hover:text-foreground border-b border-border/50"
                    >
                      <ShieldAlert className="h-4 w-4 text-primary" />
                      Admin Panel
                    </Link>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  {user && (
                    <Button
                      variant="ghost"
                      className="border border-border text-destructive hover:bg-destructive/10 gap-2 w-full"
                      onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        {/* Corporate & Compliance — gold image background */}
        <div
          className="relative"
          style={{
            backgroundImage: `url(${FOOTER_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Heavy dark overlay so text stays legible */}
          <div className="absolute inset-0 bg-black/80" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-14">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 overflow-hidden shrink-0">
                    <img src={LOGO_URL} alt="Fine Gold Africa"
                      className="w-full h-full object-contain"
                      style={{ mixBlendMode: 'screen', filter: 'brightness(1.15) contrast(1.1)' }} />
                  </div>
                  <span className="text-sm tracking-[0.18em] uppercase font-bold text-primary whitespace-nowrap">
                    Fine Gold Africa
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-xs mb-4">
                  Uganda's premier physical gold exchange. Bridging East African mineral wealth with global institutional capital.
                </p>
                {/* Uganda contact details */}
                <div className="flex flex-col gap-2">
                  <a href="https://maps.google.com/?q=Plot+7+Nakasero+Road+Kampala+Uganda" target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-2 text-xs text-gray-300 hover:text-primary transition-colors">
                    <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    Plot 7, Nakasero Road, Kampala, Uganda
                  </a>
                  <a href="tel:+256764473988" className="flex items-center gap-2 text-xs text-gray-300 hover:text-primary transition-colors">
                    <Phone className="h-3 w-3 text-primary shrink-0" />
                    +256 764 473 988
                  </a>
                  <a href="mailto:finegoldafrica@gmail.com" className="flex items-center gap-2 text-xs text-gray-300 hover:text-primary transition-colors">
                    <Mail className="h-3 w-3 text-primary shrink-0" />
                    finegoldafrica@gmail.com
                  </a>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-300 hover:text-primary transition-colors">
                    <svg className="h-3 w-3 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp: +256 764 473 988
                  </a>
                </div>
              </div>

              {/* Corporate links */}
              <div>
                <p className="text-xs tracking-widest uppercase text-primary font-semibold mb-4">Corporate</p>
                <div className="flex flex-col gap-2">
                  {navLinks.map(l => (
                    <Link key={l.href} to={l.href} className="text-sm text-gray-300 hover:text-primary transition-colors">{l.label}</Link>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div>
                <p className="text-xs tracking-widest uppercase text-primary font-semibold mb-4">Compliance</p>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-300">Certified Purity: 96% – 99.99%</span>
                  <span className="text-sm text-gray-300">100% Mine-to-Market Traceability</span>
                  <span className="text-sm text-gray-300">OECD Due Diligence Compliant</span>
                  <span className="text-sm text-gray-300">Uganda Minerals Act Licensed</span>
                  <span className="text-sm text-gray-300">Responsible Ethical Sourcing</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-primary/30 w-full" />
            <p className="text-center text-xs text-gray-400 mt-6 tracking-widest uppercase">
              © {new Date().getFullYear()} Fine Gold Africa — Kampala, Uganda. All rights reserved. Capital allocation in commodities carries risk.
            </p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Floating Action Button ── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%20am%20interested%20in%20Fine%20Gold%20Africa%20products.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl hover:bg-[#20bd5a] hover:scale-110 transition-all duration-200"
      >
        <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
      </a>
    </div>
  );
}
