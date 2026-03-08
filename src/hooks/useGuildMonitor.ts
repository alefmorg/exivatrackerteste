import { useEffect, useRef, useCallback } from 'react';
import { fetchGuildMembers } from '@/lib/tibia-api';
import { getMonitoredGuildsAsync, recordLoginChange, recordLevelSnapshots } from '@/lib/storage';
import { useSettings } from '@/hooks/useSettings';
import { GuildMember } from '@/types/tibia';

/**
 * Background guild monitor — runs globally in AppLayout.
 * Periodically fetches guild member statuses and records login/logout
 * changes to login_history, which triggers realtime notifications.
 */
export function useGuildMonitor() {
  const settings = useSettings();
  const prevMembersRef = useRef<Record<string, string>>({});
  const guildNameRef = useRef('');
  const runningRef = useRef(false);

  const checkStatuses = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      // Get the first monitored guild
      if (!guildNameRef.current) {
        const guilds = await getMonitoredGuildsAsync();
        if (guilds.length > 0) guildNameRef.current = guilds[0].name;
      }

      if (!guildNameRef.current) return;

      const members = await fetchGuildMembers(guildNameRef.current);
      const prev = prevMembersRef.current;
      const newMap: Record<string, string> = {};

      for (const m of members) {
        newMap[m.name] = m.status;
        // Only record changes if we have previous state (skip first run)
        if (Object.keys(prev).length > 0 && prev[m.name] && prev[m.name] !== m.status) {
          recordLoginChange(m.name, m.status);
        }
      }

      // Record level snapshots
      recordLevelSnapshots(members.map(m => ({ name: m.name, level: m.level })));

      prevMembersRef.current = newMap;
    } catch {
      // Silently fail — will retry on next interval
    } finally {
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkStatuses();

    // Periodic check based on settings
    const interval = setInterval(checkStatuses, settings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [checkStatuses, settings.refreshInterval]);

  // Refresh guild name when settings change
  useEffect(() => {
    guildNameRef.current = '';
  }, [settings.defaultWorld]);
}
