import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, ClipboardList, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png';

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio & Vault', href: '/wallet', icon: Wallet },
  { label: 'Order History', href: '/orders', icon: ClipboardList },
  { label: 'KYC Verification', href: '/kyc', icon: ShieldCheck },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" onClick={onNavigate}>
          <img src={LOGO_URL} alt="Fine Gold Africa" className="h-10 w-auto object-contain" />
        </Link>
        {profile && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Signed in as</p>
            <p className="text-sm text-foreground truncate mt-1">{profile.full_name || profile.email}</p>
            <span className="inline-block mt-1 text-xs tracking-widest uppercase text-primary border border-primary/40 px-2 py-0.5">
              {profile.role}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {sidebarLinks.map(link => {
          const active = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors ${
                active
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <link.icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive text-sm"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-border">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-4 px-4 h-14 bg-background/95 backdrop-blur-sm border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <img src={LOGO_URL} alt="Fine Gold Africa" className="h-8 w-auto object-contain" />
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
