import { useEffect, useRef } from 'react';
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
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);
      osc.type = 'sine';
    } else {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2);
      osc.type = 'triangle';
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);

    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not available
  }
}

// Request notification permission
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// Send native OS notification
function sendNativeNotification(charName: string, isOnline: boolean) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const title = isOnline ? `🟢 ${charName} logou` : `🔴 ${charName} deslogou`;
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  try {
    const notification = new Notification(title, {
      body: time,
      icon: '/favicon.ico',
      tag: `login-${charName}`,
      silent: true,
    });

    setTimeout(() => notification.close(), 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // Notification not supported in this context
  }
}

export function useLoginNotifications() {
  const settings = useSettings();
  const settingsRef = useRef(settings);
  const initializedRef = useRef(false);
  const permissionRequestedRef = useRef(false);
  const processedIdsRef = useRef(new Set<string>());

  // Keep settings ref fresh without causing re-subscribes
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Request permission on mount if push notifications enabled
  useEffect(() => {
    if (settings.pushNotifications && !permissionRequestedRef.current) {
      permissionRequestedRef.current = true;
      requestNotificationPermission().then(granted => {
        if (granted) {
          toast.success('Notificações nativas ativadas!', {
            description: 'Você receberá alertas mesmo com o navegador minimizado.',
            duration: 3000,
          });
        }
      });
    }
  }, [settings.pushNotifications]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializedRef.current = true;
    }, 5000);

    // Clean old processed IDs periodically to avoid memory leak
    const cleanupInterval = setInterval(() => {
      if (processedIdsRef.current.size > 500) {
        processedIdsRef.current.clear();
      }
    }, 60000);

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
          if (!initializedRef.current) return;

          const record = payload.new as { id: string; char_name: string; status: string };

          // Deduplicate by record ID
          if (processedIdsRef.current.has(record.id)) return;
          processedIdsRef.current.add(record.id);

          const isOnline = record.status === 'online';
          const s = settingsRef.current;

          // In-app toast
          if (s.toastNotifications) {
            toast(
              isOnline ? `🟢 ${record.char_name} logou` : `🔴 ${record.char_name} deslogou`,
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

          // Native OS notification
          if (s.pushNotifications) {
            sendNativeNotification(record.char_name, isOnline);
          }

          // Sound
          if (s.soundNotifications) {
            playNotificationSound(isOnline ? 'online' : 'offline');
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      clearInterval(cleanupInterval);
      supabase.removeChannel(channel);
    };
  }, []); // Stable — never re-subscribes
}
