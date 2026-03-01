import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  color?: 'primary' | 'online' | 'offline' | 'afk';
}

const colorMap = {
  primary: 'text-primary',
  online: 'text-online',
  offline: 'text-offline',
  afk: 'text-afk',
};

const bgMap = {
  primary: 'border-primary/20',
  online: 'border-online/20',
  offline: 'border-offline/20',
  afk: 'border-afk/20',
};

export default function StatCard({ icon, value, label, color = 'primary' }: StatCardProps) {
  return (
    <div className={`rpg-frame rounded-none border bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3 ${bgMap[color]} scanlines`}>
      <div className={`${colorMap[color]} opacity-70`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-extrabold font-mono ${colorMap[color]}`}>{value}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}
