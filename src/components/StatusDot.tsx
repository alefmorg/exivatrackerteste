import { forwardRef } from 'react';

interface StatusDotProps {
  status: 'online' | 'offline' | 'afk';
  size?: 'sm' | 'md';
}

const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(({ status, size = 'md' }, ref) => {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const colorClass = {
    online: 'bg-online',
    offline: 'bg-offline',
    afk: 'bg-afk',
  }[status];

  return (
    <span ref={ref} className={`inline-block rounded-full ${sizeClass} ${colorClass} ${status === 'online' ? 'animate-pulse-neon' : ''}`} />
  );
});

StatusDot.displayName = 'StatusDot';
export default StatusDot;
