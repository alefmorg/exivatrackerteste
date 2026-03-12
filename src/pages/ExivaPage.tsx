import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { motion } from 'framer-motion';
import {
  Pencil,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  MapPin
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import {
  fetchGuildMembers,
  fetchGuildMemberDeaths,
  CharacterDeath
} from '@/lib/tibia-api';

import {
  loadAnnotations,
  saveAnnotationAsync,
  getMonitoredGuildsAsync,
  loadCategories,
  saveCategoryAsync,
  MemberCategory,
  recordLoginChange,
  getTodayLoginsAsync,
  LoginEntry
} from '@/lib/storage';

import { GuildMember } from '@/types/tibia';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

import {
  VocationIcon,
  getVocationColor,
  ItemSprite
} from '@/components/TibiaIcons';

import StatusDot from '@/components/StatusDot';
import { SkeletonRow } from '@/components/SkeletonLoader';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

import {
  useMapPins,
  MapPin as MapPinType
} from '@/hooks/useMapPins';

import { TIBIA_CITIES } from '@/lib/tibia-cities';



const CATEGORY_CONFIG: Record<
  MemberCategory,
  { label: string; emoji: string; borderColor: string }
> = {
  main: {
    label: 'Main',
    emoji: '👑',
    borderColor: 'border-t-primary'
  },
  bomba: {
    label: 'Bomba',
    emoji: '💣',
    borderColor: 'border-t-destructive'
  },
  maker: {
    label: 'Maker',
    emoji: '🔨',
    borderColor: 'border-t-afk'
  },
  outros: {
    label: 'Outros',
    emoji: '📦',
    borderColor: 'border-t-muted-foreground/30'
  }
};

const CATEGORIES: MemberCategory[] = [
  'main',
  'bomba',
  'maker',
  'outros'
];



function getNearestCity(posX: number, posY: number): string {
  let closest = '';
  let minDist = Infinity;

  for (const city of TIBIA_CITIES) {
    const d = Math.hypot(city.x - posX, city.y - posY);

    if (d < minDist) {
      minDist = d;
      closest = city.name;
    }
  }

  return closest;
}



export default function ExivaPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const settings = useSettings();

  const [members, setMembers] = useState<GuildMember[]>([]);
  const { pins, refetch: refetchPins } = useMapPins();

  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState('');

  const [lastUpdate, setLastUpdate] = useState('');

  const [deaths, setDeaths] = useState<CharacterDeath[]>([]);
  const [loadingDeaths, setLoadingDeaths] = useState(false);
  const [showDeaths, setShowDeaths] = useState(true);

  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const [categories, setCategories] = useState<Record<string, MemberCategory>>({});
  const [annotations, setAnnotationsState] = useState<Record<string, string>>({});

  const [refreshCountdown, setRefreshCountdown] = useState(settings.refreshInterval);
  const [showOnlineOnly, setShowOnlineOnly] = useState(true);

  const [guildName, setGuildName] = useState('');
  const [guildLoading, setGuildLoading] = useState(true);



  useEffect(() => {
    const init = async () => {
      setGuildLoading(true);

      const [guilds, annots, cats] = await Promise.all([
        getMonitoredGuildsAsync(),
        loadAnnotations(),
        loadCategories()
      ]);

      if (guilds.length > 0) {
        setGuildName(guilds[0].name);
      }

      setAnnotationsState(annots);
      setCategories(cats);

      setGuildLoading(false);
    };

    init();
  }, []);
  const doFetch = useCallback(
    async (name: string) => {
      if (!name.trim()) return;

      setLoading(true);

      try {
        const data = await fetchGuildMembers(name);

        const [savedCats, savedAnnots] = await Promise.all([
          loadCategories(),
          loadAnnotations()
        ]);

        setCategories(savedCats);
        setAnnotationsState(savedAnnots);

        data.forEach((m) => {
          m.annotation = savedAnnots[m.name] || '';
        });

        setMembers(data);

        setRefreshCountdown(settings.refreshInterval);

        setLastUpdate(
          new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );

        refetchPins();
      } catch (e: any) {
        toast({
          title: 'Erro ao buscar membros',
          description: e.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    },
    [settings.refreshInterval, toast, refetchPins]
  );



  const fetchDeaths = useCallback(async () => {
    if (members.length === 0) return;

    setLoadingDeaths(true);

    try {
      setDeaths(
        await fetchGuildMemberDeaths(
          members.map((m) => m.name)
        )
      );
    } catch {}

    setLoadingDeaths(false);
  }, [members]);



  useEffect(() => {
    if (guildName) {
      doFetch(guildName);
    }
  }, [guildName]);



  const onlineCount = members.filter(
    (m) => m.status === 'online'
  ).length;

  const offlineCount = members.filter(
    (m) => m.status === 'offline'
  ).length;



  const filtered = members.filter((m) => {
    if (showOnlineOnly && m.status !== 'online') {
      return false;
    }

    if (
      searchFilter &&
      !m.name
        .toLowerCase()
        .includes(searchFilter.toLowerCase())
    ) {
      return false;
    }

    return true;
  });



  const grouped = useMemo(() => {
    const result: Record<
      MemberCategory,
      typeof filtered
    > = {
      main: [],
      bomba: [],
      maker: [],
      outros: []
    };

    filtered.forEach((m) => {
      result[categories[m.name] || 'outros'].push(m);
    });

    Object.keys(result).forEach((k) => {
      result[k as MemberCategory].sort(
        (a, b) => b.level - a.level
      );
    });

    return result;
  }, [filtered, categories]);



  const pinMap = useMemo(() => {
    const map: Record<string, MapPinType> = {};

    pins.forEach((p) => {
      map[p.char_name] = p;
    });

    return map;
  }, [pins]);



  if (guildLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-1 h-8 rounded-full bg-secondary" />

          <div className="space-y-2">
            <div className="h-5 w-40 bg-secondary rounded" />
            <div className="h-2 w-24 bg-secondary/60 rounded" />
          </div>
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }



  return (
    <div className="space-y-4">
      <PageHeader
        title="EXIVA LIST"
        icon="exiva"
      />
    </div>
  );
}
