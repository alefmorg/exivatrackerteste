import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Swords, UserPlus, ScrollText, Target, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, role, isAdmin, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: ScrollText, adminOnly: false },
    { path: '/exiva', label: 'Exiva', icon: Target, adminOnly: false },
    { path: '/bonecos', label: 'Bonecos', icon: Swords, adminOnly: true },
    { path: '/admin/usuarios', label: 'Usuários', icon: UserPlus, adminOnly: true },
    { path: '/configuracoes', label: 'Config', icon: Settings, adminOnly: false },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav - Discord-style */}
      <header className="sticky top-0 z-50 border-b border-border bg-[hsl(220_8%_14%)]">
        <div className="max-w-[1600px] mx-auto flex items-center h-12 px-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[hsl(38_92%_50%/0.12)] border border-[hsl(38_92%_50%/0.25)] flex items-center justify-center group-hover:bg-[hsl(38_92%_50%/0.2)] transition-colors">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-primary font-tibia gold-glow tracking-wide">EXIVA TRACKER</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-border" />

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5 flex-1">
            {visibleItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {active && (
                    <motion.div layoutId="nav-pill" className="absolute inset-0 rounded bg-secondary" transition={{ duration: 0.15 }} />
                  )}
                  <item.icon className="h-4 w-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/50">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-medium text-foreground truncate max-w-[100px]">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] text-muted-foreground capitalize">{role || 'user'}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-secondary" title="Sair">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="p-5 max-w-[1600px] mx-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
