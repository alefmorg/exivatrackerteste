import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

// Simple notification sounds using Web Audio API
function playNotificationSound(type: 'online' | 'offline') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'online') {
      // Rising tone for login
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);
      osc.type = 'sine';
    } else {
      // Falling tone for logout
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2);
      osc.type = 'triangle';
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);

    // Cleanup
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not available
  }
}

export function useLoginNotifications() {
  const settings = useSettings();
  const initializedRef = useRef(false);

  const handleInsert = useCallback((payload: any) => {
    const { char_name, status } = payload.new as { char_name: string; status: string };
    const isOnline = status === 'online';

    if (settings.toastNotifications) {
      toast(
        isOnline ? `🟢 ${char_name} logou` : `🔴 ${char_name} deslogou`,
        {
          description: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          duration: 4000,
          position: 'top-right',
          style: {
            borderLeft: `3px solid ${isOnline ? 'hsl(var(--online))' : 'hsl(var(--offline))'}`,
          },
        }
      );
    }

    if (settings.soundNotifications) {
      playNotificationSound(isOnline ? 'online' : 'offline');
    }
  }, [settings.soundNotifications, settings.toastNotifications]);

  useEffect(() => {
    // Skip the first batch of inserts that happen on initial fetch
    const timer = setTimeout(() => {
      initializedRef.current = true;
    }, 5000);

    const channel = supabase
      .channel('login-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'login_history',
        },
        (payload) => {
          if (initializedRef.current) {
            handleInsert(payload);
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [handleInsert]);
}
