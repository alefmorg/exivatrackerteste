interface StatusDotProps {
  status: 'online' | 'offline' | 'afk';
  size?: 'sm' | 'md';
}

export default function StatusDot({ status, size = 'md' }: StatusDotProps) {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const colorClass = {
    online: 'bg-online',
    offline: 'bg-offline',
    afk: 'bg-afk',
  }[status];

  return (
    <span className={`inline-block rounded-full ${sizeClass} ${colorClass} ${status === 'online' ? 'animate-pulse-neon' : ''}`} />
  );
}
