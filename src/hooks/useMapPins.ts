import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MapPin {
  id: string;
  char_name: string;
  city_id: string;
  pos_x: number;
  pos_y: number;
  updated_at: string;
  updated_by: string | null;
}

export function useMapPins() {
  const { user } = useAuth();
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = useCallback(async () => {
    const { data } = await supabase
      .from('map_pins')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setPins(data as MapPin[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPins();
    const channel = supabase
      .channel('map_pins_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_pins' }, () => {
        fetchPins();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPins]);

  const addPin = useCallback(async (charName: string, posX: number, posY: number) => {
    if (!user) return;
    await supabase
      .from('map_pins')
      .upsert(
        { char_name: charName, city_id: '', pos_x: posX, pos_y: posY, updated_by: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'char_name' }
      );
  }, [user]);

  const removePin = useCallback(async (charName: string) => {
    await supabase.from('map_pins').delete().eq('char_name', charName);
  }, []);

  const cleanOfflinePins = useCallback(async (onlineNames: Set<string>) => {
    const toRemove = pins.filter(p => !onlineNames.has(p.char_name));
    if (toRemove.length > 0) {
      await supabase
        .from('map_pins')
        .delete()
        .in('char_name', toRemove.map(p => p.char_name));
    }
  }, [pins]);

  return { pins, loading, addPin, removePin, cleanOfflinePins, refetch: fetchPins };
}
