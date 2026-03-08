import { motion } from 'framer-motion';
import { ItemSprite } from '@/components/TibiaIcons';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: Parameters<typeof ItemSprite>[0]['item'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150" />
        <div className="relative w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center">
          <ItemSprite item={icon} className="h-10 w-10 opacity-40" />
        </div>
      </div>
      <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground text-center max-w-[240px]">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-4 text-xs gap-1.5">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
