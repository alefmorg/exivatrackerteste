import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavSprite } from '@/components/TibiaIcons';
import { useAuth } from '@/hooks/useAuth';

export default function MobileNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const items = [
    { path: '/', label: 'Dashboard', sprite: 'dashboard' as const },
    { path: '/exiva', label: 'Exiva', sprite: 'exiva' as const },
    { path: '/relatorio', label: 'Relatório', sprite: 'relatorio' as const },
    { path: '/bonecos', label: 'Bonecos', sprite: 'bonecos' as const },
    { path: '/historico', label: 'Log', sprite: 'history' as const },
    ...(isAdmin ? [{ path: '/admin/usuarios', label: 'Users', sprite: 'users' as const }] : []),
    { path: '/configuracoes', label: 'Config', sprite: 'settings' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {items.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-[1px] inset-x-2 h-[2px] bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <NavSprite spriteKey={item.sprite} className="h-5 w-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
