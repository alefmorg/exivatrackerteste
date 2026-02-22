import { CharacterStatus } from '@/types/tibia';

interface StatusBadgeProps {
  status: CharacterStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    online: { label: 'Online', className: 'bg-online/15 text-online border-online/30' },
    offline: { label: 'Offline', className: 'bg-offline/15 text-offline border-offline/30' },
    afk: { label: 'AFK', className: 'bg-afk/15 text-afk border-afk/30' },
  }[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
