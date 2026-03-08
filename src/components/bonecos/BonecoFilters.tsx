import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import StatusDot from '@/components/StatusDot';
import { ItemSprite } from '@/components/TibiaIcons';

type CharacterStatus = 'online' | 'afk' | 'offline';

const ACTIVITIES: { value: string; label: string; emoji: string }[] = [
  { value: '', label: 'Todos', emoji: '📋' },
];

const VOCATIONS = ['', 'Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer'];
const STATUSES: CharacterStatus[] = ['online', 'afk', 'offline'];

interface BonecoFiltersProps {
  searchFilter: string;
  setSearchFilter: (v: string) => void;
  activityFilter: string;
  setActivityFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  vocationFilter: string;
  setVocationFilter: (v: string) => void;
  showAvailableOnly: boolean;
  setShowAvailableOnly: (v: boolean) => void;
  availableCount: number;
}

export default function BonecoFilters({
  searchFilter, setSearchFilter, activityFilter, setActivityFilter,
  statusFilter, setStatusFilter, vocationFilter, setVocationFilter,
  showAvailableOnly, setShowAvailableOnly, availableCount,
}: BonecoFiltersProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <ItemSprite item="search" className="h-4 w-4" />
          </div>
          <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Buscar por nome ou mundo..." className="pl-9 bg-secondary border-border" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <ItemSprite item="filter" className="h-4 w-4" />
        {/* Activity */}
        <div className="flex gap-1">
          {ACTIVITIES.map(a => (
            <button key={a.value} onClick={() => setActivityFilter(activityFilter === a.value ? '' : a.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activityFilter === a.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
        <span className="text-border">|</span>
        {/* Status */}
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
              <StatusDot status={s} size="sm" /> {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-border">|</span>
        {/* Vocation */}
        <select value={vocationFilter} onChange={e => setVocationFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg text-xs bg-secondary border border-border text-foreground">
          <option value="">Todas Vocs</option>
          {VOCATIONS.filter(Boolean).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span className="text-border">|</span>
        {/* Available only */}
        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
          <Switch checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
          Disponíveis ({availableCount})
        </label>
      </div>
    </div>
  );
}
