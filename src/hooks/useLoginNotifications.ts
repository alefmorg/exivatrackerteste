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
      tag: `login-${charName}`, // Replace previous notification for same char
      silent: true, // We handle sound ourselves
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Focus window on click
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
  const initializedRef = useRef(false);
  const permissionRequestedRef = useRef(false);

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

  const handleInsert = useCallback((payload: any) => {
    const { char_name, status } = payload.new as { char_name: string; status: string };
    const isOnline = status === 'online';

    // In-app toast
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

    // Native OS notification (works in background)
    if (settings.pushNotifications) {
      sendNativeNotification(char_name, isOnline);
    }

    // Sound
    if (settings.soundNotifications) {
      playNotificationSound(isOnline ? 'online' : 'offline');
    }
  }, [settings.soundNotifications, settings.toastNotifications, settings.pushNotifications]);

  useEffect(() => {
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
