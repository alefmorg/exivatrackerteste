import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, ChevronLeft, ChevronRight, LogOut, Sword, Swords, Shield, Skull, UserPlus, ScrollText, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, role, isAdmin, signOut } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: ScrollText, adminOnly: false },
    { path: '/exiva', label: 'Exiva', sublabel: 'Monitoramento de Guild', icon: Target, adminOnly: false },
    { path: '/bonecos', label: 'Bonecos', sublabel: 'Gerenciar Personagens', icon: Swords, adminOnly: true },
    { path: '/admin/usuarios', label: 'Usuários', sublabel: 'Gerenciar Contas', icon: UserPlus, adminOnly: true },
    { path: '/configuracoes', label: 'Configurações', icon: Settings, adminOnly: false },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <Sword className="h-7 w-7 text-primary shrink-0" />
          {!collapsed && (
            <div>
              <span className="text-lg font-extrabold text-primary neon-text tracking-tight" style={{ fontFamily: "'MedievalSharp', cursive" }}>EXIVA</span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">Manager Pro</span>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {visibleItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  active ? 'bg-primary/15 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                {active && (
                  <motion.div layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" transition={{ duration: 0.2 }} />
                )}
                <item.icon className={`h-5 w-5 shrink-0 relative z-10 ${active ? 'text-primary' : ''}`} />
                {!collapsed && (
                  <div className="relative z-10">
                    <span className={`text-sm font-medium ${active ? 'text-primary' : ''}`}>{item.label}</span>
                    {item.sublabel && <span className="block text-[10px] text-muted-foreground">{item.sublabel}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Skull className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{role || 'Usuário'}</p>
              </div>
            )}
            {!collapsed && (
              <LogOut onClick={signOut} className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            )}
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-6 max-w-[1600px]">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
