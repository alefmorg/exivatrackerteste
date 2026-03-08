import { motion } from 'framer-motion';
import { ItemSprite } from '@/components/TibiaIcons';

interface PageHeaderProps {
  title: string;
  icon: Parameters<typeof ItemSprite>[0]['item'];
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, icon, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-primary" />
        <div>
          <h1 className="text-lg font-display font-bold text-foreground tracking-wide flex items-center gap-2">
            <ItemSprite item={icon} className="h-6 w-6" /> {title}
          </h1>
          {subtitle && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-1.5">{actions}</div>}
    </motion.div>
  );
}
