import { motion } from 'framer-motion';
import { ItemSprite } from '@/components/TibiaIcons';

interface MetricCardProps {
  label: string;
  value: string;
  sprite: Parameters<typeof ItemSprite>[0]['item'];
  highlight?: boolean;
  delay?: number;
}

export default function MetricCard({ label, value, sprite, highlight, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      whileHover={{ scale: 1.04, y: -2 }}
      className="panel-inset rounded-md p-2 text-center cursor-default group transition-shadow hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
    >
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <ItemSprite item={sprite} className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </div>
      <p className={`text-sm font-bold font-mono truncate ${highlight ? 'text-primary stat-glow' : 'text-foreground'}`}>{value}</p>
      <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5">{label}</p>
    </motion.div>
  );
}
