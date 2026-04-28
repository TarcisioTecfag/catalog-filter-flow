import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, ImageIcon, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Animated demonstration overlaid on the empty CreateLine canvas.
 *
 * Tells a short story: a virtual cursor (Fagner) picks machines from the
 * left sidebar, drags them onto the canvas and connects them — showing the
 * user exactly what they're supposed to do. Loops indefinitely.
 *
 * Coordinates are local to the canvas main area (the parent must be
 * relatively positioned).
 */

type DemoMachine = {
  id: string;
  label: string;
  model: string;
  pickup: { x: number; y: number };
  drop: { x: number; y: number };
  hue: number;
};

const NODE_W = 160;
const NODE_H = 110;

const DEMO_MACHINES: DemoMachine[] = [
  {
    id: "d1",
    label: "Esteira Transportadora",
    model: "PAMQEST003",
    pickup: { x: 24, y: 130 },
    drop: { x: 300, y: 230 },
    hue: 200,
  },
  {
    id: "d2",
    label: "Envasadora 4 Bicos",
    model: "PAMQENV004",
    pickup: { x: 24, y: 190 },
    drop: { x: 540, y: 230 },
    hue: 340,
  },
  {
    id: "d3",
    label: "Rosqueadora Linear",
    model: "PAMQRSQ001",
    pickup: { x: 24, y: 250 },
    drop: { x: 780, y: 230 },
    hue: 30,
  },
];

// Build the same cubic curve used by the real canvas so demo edges match.
const buildPath = (sx: number, sy: number, tx: number, ty: number) => {
  const x1 = sx + NODE_W;
  const y1 = sy + NODE_H / 2;
  const x2 = tx;
  const y2 = ty + NODE_H / 2;
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

// Per-machine cadence (ms): grab → drag → release.
const PER = 3000;
const CONNECT_GAP = 1200;
const HOLD_END = 2200;

interface CreateLineDemoProps {
  onDismiss?: () => void;
}

const CreateLineDemo = ({ onDismiss }: CreateLineDemoProps) => {
  const [cycle, setCycle] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [edgesDrawn, setEdgesDrawn] = useState(0);
  const [carrying, setCarrying] = useState<number>(-1);

  // ===== Cursor keyframes (memoized; identical for every cycle) =====
  const { xs, ys, times, totalMs } = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const times: number[] = [];

    const totalDrops = DEMO_MACHINES.length * PER;
    const connectStart = totalDrops + 400;
    const totalConnects = (DEMO_MACHINES.length - 1) * CONNECT_GAP;
    const total = connectStart + totalConnects + HOLD_END;

    const push = (t: number, x: number, y: number) => {
      xs.push(x);
      ys.push(y);
      times.push(Math.min(1, Math.max(0, t / total)));
    };

    push(0, 600, 60);

    DEMO_MACHINES.forEach((m, i) => {
      const base = i * PER;
      // travel to pickup
      push(base + 200, m.pickup.x + 80, m.pickup.y + 18);
      // dwell during grab
      push(base + 600, m.pickup.x + 80, m.pickup.y + 18);
      // drag to drop center
      push(base + 1700, m.drop.x + NODE_W / 2, m.drop.y + NODE_H / 2);
      // release dwell
      push(base + 2050, m.drop.x + NODE_W / 2, m.drop.y + NODE_H / 2);
    });

    for (let i = 0; i < DEMO_MACHINES.length - 1; i++) {
      const src = DEMO_MACHINES[i];
      const tgt = DEMO_MACHINES[i + 1];
      const t0 = connectStart + i * CONNECT_GAP;
      push(t0 + 100, src.drop.x + NODE_W, src.drop.y + NODE_H / 2);
      push(t0 + 800, tgt.drop.x, tgt.drop.y + NODE_H / 2);
    }

    push(total - 200, 900, 80);

    return { xs, ys, times, totalMs: total };
  }, []);

  // ===== Master timeline (real timeouts to keep DOM state in sync) =====
  useEffect(() => {
    setPlaced(0);
    setEdgesDrawn(0);
    setCarrying(-1);

    const timeouts: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timeouts.push(window.setTimeout(fn, ms));
    };

    DEMO_MACHINES.forEach((_, i) => {
      const base = i * PER;
      at(base + 600, () => setCarrying(i));
      at(base + 1700, () => setPlaced((p) => Math.max(p, i + 1)));
      at(base + 2050, () => setCarrying(-1));
    });

    const totalDrops = DEMO_MACHINES.length * PER;
    const connectStart = totalDrops + 400;
    for (let i = 0; i < DEMO_MACHINES.length - 1; i++) {
      at(connectStart + i * CONNECT_GAP + 800, () =>
        setEdgesDrawn((e) => Math.max(e, i + 1)),
      );
    }

    at(totalMs, () => setCycle((c) => c + 1));

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [cycle, totalMs]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {/* Controls (interactive) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-full px-3 py-1.5 shadow-lg">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Play className="h-3 w-3 text-primary" />
          Veja como o Fagner monta uma linha
        </span>
        <button
          onClick={() => setCycle((c) => c + 1)}
          className="text-[10px] text-primary hover:underline font-medium"
        >
          Repetir
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Fechar demonstração"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Phantom catalog rail (mirrors sidebar items getting picked) */}
      <div className="absolute left-0 top-[110px] flex flex-col gap-2">
        {DEMO_MACHINES.map((m, i) => {
          const dimmed = carrying === i || placed > i;
          return (
            <motion.div
              key={`${cycle}-rail-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: dimmed ? 0.25 : 0.9,
                x: 0,
                scale: carrying === i ? 0.94 : 1,
              }}
              transition={{ duration: 0.25 }}
              className="ml-3 w-[170px] rounded-md border border-dashed border-primary/40 bg-card/70 backdrop-blur px-2 py-1.5 flex items-center gap-2"
            >
              <div
                className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${m.hue} 55% 22%), hsl(${(m.hue + 40) % 360} 60% 14%))`,
                }}
              >
                <ImageIcon className="h-3 w-3 text-white/60" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-foreground line-clamp-1">
                  {m.label}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono">
                  {m.model}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SVG layer for connection edges */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <marker
            id="demo-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
          </marker>
        </defs>
        {DEMO_MACHINES.slice(0, -1).map((src, i) => {
          if (edgesDrawn <= i) return null;
          const tgt = DEMO_MACHINES[i + 1];
          const d = buildPath(src.drop.x, src.drop.y, tgt.drop.x, tgt.drop.y);
          return (
            <motion.path
              key={`${cycle}-edge-${i}`}
              d={d}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              markerEnd="url(#demo-arrow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      {/* Dropped machine cards on canvas */}
      <AnimatePresence>
        {DEMO_MACHINES.map((m, i) => {
          if (placed <= i) return null;
          return (
            <motion.div
              key={`${cycle}-card-${i}`}
              initial={{ opacity: 0, scale: 0.55, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="absolute rounded-xl border-2 border-primary/70 bg-card shadow-[0_0_20px_-4px_hsl(var(--primary)/0.55)] overflow-hidden"
              style={{
                left: m.drop.x,
                top: m.drop.y,
                width: NODE_W,
                height: NODE_H,
              }}
            >
              <div
                className="relative h-[68px] w-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${m.hue} 55% 22%) 0%, hsl(${(m.hue + 40) % 360} 60% 14%) 100%)`,
                }}
              >
                <ImageIcon className="h-6 w-6 text-white/30" />
                <span className="absolute top-1 left-1 text-[8px] font-mono px-1 py-0.5 rounded bg-black/40 text-white/80">
                  {m.model}
                </span>
              </div>
              <div className="px-2 py-1.5">
                <p className="text-[10px] font-semibold text-foreground line-clamp-2 leading-tight">
                  {m.label}
                </p>
              </div>
              <span className="absolute -right-1.5 top-[34px] h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <span className="absolute -left-1.5 top-[34px] h-2.5 w-2.5 rounded-full bg-muted border-2 border-background" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Ghost card pinned to the cursor while it's dragging.
          Uses the SAME keyframes as the cursor so the offset stays exact. */}
      <AnimatePresence>
        {carrying >= 0 && (
          <motion.div
            key={`${cycle}-ghost-${carrying}`}
            className="absolute top-0 left-0"
            initial={{ x: xs[0] + 18, y: ys[0] + 18, opacity: 0 }}
            animate={{
              x: xs.map((v) => v + 18),
              y: ys.map((v) => v + 18),
              opacity: 0.92,
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{
              x: { duration: totalMs / 1000, times, ease: "easeInOut" },
              y: { duration: totalMs / 1000, times, ease: "easeInOut" },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="rounded-md border border-primary/70 bg-card/95 backdrop-blur shadow-xl px-2 py-1 flex items-center gap-2 rotate-[-4deg]">
              <div
                className="h-5 w-5 rounded flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${DEMO_MACHINES[carrying].hue} 55% 22%), hsl(${(DEMO_MACHINES[carrying].hue + 40) % 360} 60% 14%))`,
                }}
              >
                <ImageIcon className="h-2.5 w-2.5 text-white/70" />
              </div>
              <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">
                {DEMO_MACHINES[carrying].label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The animated cursor */}
      <motion.div
        key={`${cycle}-cursor`}
        className="absolute top-0 left-0"
        initial={{ x: xs[0], y: ys[0] }}
        animate={{ x: xs, y: ys }}
        transition={{
          duration: totalMs / 1000,
          times,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <MousePointer2
            className={cn(
              "h-6 w-6 -rotate-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
              "fill-primary stroke-background",
            )}
          />
          <span className="absolute left-5 top-4 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
            Fagner
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateLineDemo;
