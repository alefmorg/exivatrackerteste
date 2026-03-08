import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NavSprite, ItemSprite } from '@/components/TibiaIcons';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, role, username, isAdmin, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', sprite: 'dashboard' as const, adminOnly: false },
    { path: '/exiva', label: 'Exiva', sprite: 'exiva' as const, adminOnly: false },
    { path: '/bonecos', label: 'Bonecos', sprite: 'bonecos' as const, adminOnly: false },
    { path: '/historico', label: 'Histórico', sprite: 'history' as const, adminOnly: false },
    { path: '/admin/usuarios', label: 'Usuários', sprite: 'users' as const, adminOnly: true },
    { path: '/configuracoes', label: 'Config', sprite: 'settings' as const, adminOnly: false },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center h-11 px-3 gap-1">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group mr-3">
            <div className="w-8 h-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary/25 transition-all">
              <ItemSprite item="exiva" className="h-7 w-7" />
            </div>
            <span className="font-display text-[11px] font-bold text-primary tracking-wider neon-text">
              EXIVA
            </span>
          </Link>

          {/* Separator */}
          <div className="w-px h-4 bg-border mx-1" />

          {/* Nav */}
          <nav className="flex items-center gap-px flex-1">
            {visibleItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium transition-all ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-primary"
                      style={{ bottom: '-6px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <NavSprite spriteKey={item.sprite} className="h-5 w-5 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/8 border border-primary/15 mr-2">
            <ItemSprite item="live" className="h-4 w-4 animate-pulse" />
            <span className="text-[9px] font-bold text-primary font-mono tracking-wider">LIVE</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50">
              <ItemSprite item="skull" className="h-4 w-4" />
              <div className="hidden md:flex flex-col leading-none">
                <span className="text-[10px] font-semibold text-foreground truncate max-w-[80px]">{username || user?.email}</span>
                <span className="text-[8px] text-muted-foreground uppercase font-mono tracking-wider">{role || 'user'}</span>
              </div>
            </div>
            <button onClick={signOut} className="p-1 text-muted-foreground hover:text-destructive transition-colors" title="Sair">
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="p-3 md:p-5 max-w-[1600px] mx-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.12 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
