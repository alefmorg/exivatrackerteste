import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Sword, Swords, Skull, UserPlus, ScrollText, Target } from 'lucide-react';
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
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-sidebar/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto flex items-center h-14 px-4 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Sword className="h-6 w-6 text-primary" />
            <span className="text-lg font-extrabold text-primary neon-text tracking-tight" style={{ fontFamily: "'MedievalSharp', cursive" }}>EXIVA</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest hidden sm:block">Manager</span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 flex-1">
            {visibleItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {active && (
                    <motion.div layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" transition={{ duration: 0.2 }} />
                  )}
                  <item.icon className={`h-4 w-4 relative z-10 ${active ? 'text-primary' : ''}`} />
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <Skull className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{role || 'Usuário'}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="p-6 max-w-[1600px] mx-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
