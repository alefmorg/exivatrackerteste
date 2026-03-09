import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  intensity?: number; // 0-1, default 1
}

interface MapHeatmapProps {
  points: HeatPoint[];
  visible: boolean;
  radius?: number; // radius in percentage of map width
  blur?: number;
  opacity?: number;
}

export default function MapHeatmap({ 
  points, 
  visible, 
  radius = 8, 
  blur = 15,
  opacity = 0.6 
}: MapHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate heatmap on canvas
  useEffect(() => {
    if (!visible || !canvasRef.current || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = 2; // Higher resolution
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate radius in pixels
    const radiusPx = (radius / 100) * rect.width;

    // Draw each heat point
    points.forEach(point => {
      const x = (point.x / 100) * rect.width;
      const y = (point.y / 100) * rect.height;
      const intensity = point.intensity ?? 1;

      // Create radial gradient for each point
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusPx);
      gradient.addColorStop(0, `hsla(25, 95%, 50%, ${0.8 * intensity})`);
      gradient.addColorStop(0.3, `hsla(30, 100%, 55%, ${0.5 * intensity})`);
      gradient.addColorStop(0.6, `hsla(35, 100%, 60%, ${0.25 * intensity})`);
      gradient.addColorStop(1, 'hsla(40, 100%, 65%, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radiusPx, 0, Math.PI * 2);
      ctx.fill();
    });

    // Apply color mapping for better visualization
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        // Map alpha to color intensity (cold to hot)
        const t = alpha / 255;
        
        if (t < 0.25) {
          // Cold - blue/purple
          data[i] = 80 + t * 200;     // R
          data[i + 1] = 50 + t * 100; // G
          data[i + 2] = 180;          // B
        } else if (t < 0.5) {
          // Medium - cyan/green
          const tt = (t - 0.25) * 4;
          data[i] = 130 - tt * 50;    // R
          data[i + 1] = 150 + tt * 80;// G
          data[i + 2] = 180 - tt * 100;// B
        } else if (t < 0.75) {
          // Warm - yellow/orange
          const tt = (t - 0.5) * 4;
          data[i] = 180 + tt * 75;    // R
          data[i + 1] = 180 + tt * 20;// G
          data[i + 2] = 80 - tt * 40; // B
        } else {
          // Hot - red/orange
          const tt = (t - 0.75) * 4;
          data[i] = 255;              // R
          data[i + 1] = 200 - tt * 120;// G
          data[i + 2] = 40;           // B
        }
        
        data[i + 3] = Math.min(255, alpha * 1.5); // Boost visibility
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [points, visible, radius]);

  // Generate cluster data for legend
  const clusters = useMemo(() => {
    if (points.length === 0) return { hot: 0, medium: 0, cold: 0 };
    
    // Simple clustering: count overlapping points
    const grid: Record<string, number> = {};
    const cellSize = 5; // 5% grid cells
    
    points.forEach(p => {
      const key = `${Math.floor(p.x / cellSize)}-${Math.floor(p.y / cellSize)}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    
    const counts = Object.values(grid);
    const max = Math.max(...counts);
    
    return {
      hot: counts.filter(c => c >= max * 0.7).length,
      medium: counts.filter(c => c >= max * 0.3 && c < max * 0.7).length,
      cold: counts.filter(c => c < max * 0.3).length,
    };
  }, [points]);

  if (!visible) return null;

  return (
    <>
      <motion.canvas
        ref={canvasRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: opacity }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          filter: `blur(${blur}px)`,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Heatmap legend */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 z-20"
      >
        <div className="text-[9px] font-semibold text-foreground mb-1.5 uppercase tracking-wider">
          🔥 Mapa de Calor
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0,100%,50%)]" />
            <span className="text-[8px] text-muted-foreground">Quente ({clusters.hot})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(45,100%,55%)]" />
            <span className="text-[8px] text-muted-foreground">Médio ({clusters.medium})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(200,80%,55%)]" />
            <span className="text-[8px] text-muted-foreground">Frio ({clusters.cold})</span>
          </div>
        </div>
        <div className="text-[7px] text-muted-foreground mt-1">
          {points.length} pontos · Baseado nas posições atuais
        </div>
      </motion.div>
    </>
  );
}
