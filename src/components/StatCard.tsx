import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  color?: 'primary' | 'online' | 'offline' | 'afk';
}

const colorMap = {
  primary: 'text-primary bg-primary/10',
  online: 'text-online bg-online/10',
  offline: 'text-offline bg-offline/10',
  afk: 'text-afk bg-afk/10',
};

const dotMap = {
  primary: 'bg-primary',
  online: 'bg-online',
  offline: 'bg-offline',
  afk: 'bg-afk',
};

export default function StatCard({ icon, value, label, color = 'primary' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {color !== 'primary' && <span className={`w-2 h-2 rounded-full ${dotMap[color]}`} />}
          {label}
        </p>
      </div>
    </div>
  );
}
