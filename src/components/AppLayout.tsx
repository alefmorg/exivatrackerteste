import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Sword, Swords, Skull, UserPlus, ScrollText, Target, ArrowRightLeft, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, role, isAdmin, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: ScrollText, adminOnly: false },
    { path: '/exiva', label: 'Exiva', icon: Target, adminOnly: false },
    { path: '/bonecos', label: 'Bonecos', icon: Swords, adminOnly: false },
    { path: '/historico', label: 'Histórico', icon: ArrowRightLeft, adminOnly: false },
    { path: '/admin/usuarios', label: 'Usuários', icon: UserPlus, adminOnly: true },
    { path: '/configuracoes', label: 'Config', icon: Settings, adminOnly: false },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-sidebar/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto flex items-center h-12 px-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary/25 group-hover:neon-box-sm transition-all">
              <Sword className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-extrabold text-primary tracking-tight neon-text" style={{ fontFamily: "'MedievalSharp', cursive" }}>EXIVA TRACKER</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-[0.2em]">Manager Pro</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5 flex-1">
            {visibleItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-3.5 w-3.5 relative z-10 ${active ? 'text-primary' : ''}`} />
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-neon" />
            <span className="text-[10px] font-semibold text-primary">LIVE</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Skull className="h-3 w-3 text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-medium text-foreground truncate max-w-[100px]">{user?.email}</p>
                <p className="text-[9px] text-muted-foreground capitalize">{role || 'Usuário'}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-1 text-muted-foreground hover:text-destructive transition-colors" title="Sair">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
