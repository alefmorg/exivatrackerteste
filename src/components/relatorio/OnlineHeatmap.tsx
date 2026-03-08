import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface LoginRecord {
  char_name: string;
  status: string;
  recorded_at: string;
}

export default function OnlineHeatmap({ loginHistory }: { loginHistory: LoginRecord[] }) {
  // Build heatmap: hour (0-23) x day of week (0-6) → count of online events
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  loginHistory.forEach(l => {
    if (l.status !== 'online') return;
    const d = new Date(l.recorded_at);
    const day = d.getDay(); // 0=Sun
    const hour = d.getHours();
    heatmap[day][hour]++;
  });

  const max = Math.max(1, ...heatmap.flat());
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="panel rounded-lg p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-foreground">
          MAPA DE ATIVIDADE
        </span>
        <span className="text-[8px] text-muted-foreground ml-auto">Logins por hora/dia</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Hour labels */}
          <div className="flex gap-px ml-8 mb-px">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex-1 text-center text-[7px] text-muted-foreground font-mono">
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day, di) => (
            <div key={day} className="flex items-center gap-px">
              <span className="text-[8px] text-muted-foreground w-7 shrink-0 text-right pr-1 font-mono">{day}</span>
              {heatmap[di].map((count, hi) => {
                const intensity = count / max;
                return (
                  <div
                    key={hi}
                    className="flex-1 aspect-square rounded-[2px] transition-colors"
                    style={{
                      background: intensity > 0
                        ? `hsl(25 95% 50% / ${0.1 + intensity * 0.7})`
                        : 'hsl(0 0% 8%)',
                    }}
                    title={`${day} ${hi}h: ${count} logins`}
                  />
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <span className="text-[7px] text-muted-foreground">Menos</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: `hsl(25 95% 50% / ${i})` }} />
            ))}
            <span className="text-[7px] text-muted-foreground">Mais</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
