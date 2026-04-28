import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, ImageIcon, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Animated demonstration overlaid on the empty CreateLine canvas.
 *
 * Tells a short story: a virtual cursor (Fagner) picks machines from the
 * left sidebar, drags them onto the canvas and connects them — showing the
 * user exactly what they're supposed to do. Loops indefinitely with a clean
 * fade-out/fade-in between cycles.
 *
 * Coordinates are local to the canvas main area (the parent must be relatively
 * positioned). All timings are in seconds for framer-motion.
 */

type DemoMachine = {
  id: string;
  label: string;
  model: string;
  // Position inside the catalog rail (left side, screen-space)
  pickup: { x: number; y: number };
  // Final position on the canvas (centered area)
  drop: { x: number; y: number };
  hue: number;
};

const DEMO_MACHINES: DemoMachine[] = [
  {
    id: "d1",
    label: "Esteira Transportadora",
    model: "PAMQEST003",
    pickup: { x: 40, y: 120 },
    drop: { x: 320, y: 240 },
    hue: 200,
  },
  {
    id: "d2",
    label: "Envasadora 4 Bicos",
    model: "PAMQENV004",
    pickup: { x: 40, y: 180 },
    drop: { x: 560, y: 240 },
    hue: 340,
  },
  {
    id: "d3",
    label: "Rosqueadora Linear",
    model: "PAMQRSQ001",
    pickup: { x: 40, y: 240 },
    drop: { x: 800, y: 240 },
    hue: 30,
  },
];

const NODE_W = 160;
const NODE_H = 110;

// Build the same cubic curve used by the real canvas so the demo edges look
// identical to what users will create.
const buildPath = (sx: number, sy: number, tx: number, ty: number) => {
  const x1 = sx + NODE_W;
  const y1 = sy + NODE_H / 2;
  const x2 = tx;
  const y2 = ty + NODE_H / 2;
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

interface CreateLineDemoProps {
  onDismiss?: () => void;
}

const CreateLineDemo = ({ onDismiss }: CreateLineDemoProps) => {
  // cycle increments to retrigger the whole sequence after a pause
  const [cycle, setCycle] = useState(0);
  // which machines have already been "dropped" and stay visible
  const [placed, setPlaced] = useState<number>(0);
  // which edges have been "drawn"
  const [edgesDrawn, setEdgesDrawn] = useState<number>(0);
  // index of the machine currently being carried by the cursor (-1 = idle)
  const [carrying, setCarrying] = useState<number>(-1);

  // Master timeline. Each step uses real timeouts so cursor + state stay in
  // sync without depending on framer's onAnimationComplete chains.
  useEffect(() => {
    setPlaced(0);
    setEdgesDrawn(0);
    setCarrying(-1);

    const timeouts: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timeouts.push(window.setTimeout(fn, ms));
    };

    // ---- Phase 1: drop each machine, one by one ----
    // Per machine cadence: pickup (1.2s) -> drag to drop (1.4s) -> release (0.4s)
    const PER = 3000;
    DEMO_MACHINES.forEach((_, i) => {
      const base = i * PER;
      at(base + 200, () => setCarrying(i)); // grab
      at(base + 1600, () => {
        // release at destination
        setPlaced((p) => Math.max(p, i + 1));
      });
      at(base + 1900, () => setCarrying(-1));
    });

    // ---- Phase 2: connect the machines ----
    const connectStart = DEMO_MACHINES.length * PER + 400;
    for (let i = 0; i < DEMO_MACHINES.length - 1; i++) {
      at(connectStart + i * 1200, () => setEdgesDrawn((e) => Math.max(e, i + 1)));
    }

    // ---- Phase 3: hold completed line, then restart ----
    const holdEnd =
      connectStart + (DEMO_MACHINES.length - 1) * 1200 + 2200;
    at(holdEnd, () => setCycle((c) => c + 1));

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [cycle]);

  // ===== Cursor positioning per cycle step =====
  // We compute the cursor target as a sequence of waypoints. Framer plays
  // them via animate.x/y arrays with matching `times` for smooth motion.
  const cursorKeyframes = (() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const times: number[] = [];

    // Cycle total duration, recomputed to mirror the timeline above.
    const PER = 3000;
    const totalDrops = DEMO_MACHINES.length * PER;
    const connectStart = totalDrops + 400;
    const totalConnects = (DEMO_MACHINES.length - 1) * 1200;
    const holdMs = 2200;
    const total = connectStart + totalConnects + holdMs;

    const push = (t: number, x: number, y: number) => {
      xs.push(x);
      ys.push(y);
      times.push(t / total);
    };

    // start at top-right idle
    push(0, 600, 60);

    DEMO_MACHINES.forEach((m, i) => {
      const base = i * PER;
      // travel to pickup
      push(base + 200, m.pickup.x + 90, m.pickup.y + 20);
      // dwell during grab
      push(base + 600, m.pickup.x + 90, m.pickup.y + 20);
      // drag to drop
      push(base + 1600, m.drop.x + NODE_W / 2, m.drop.y + NODE_H / 2);
      // release dwell
      push(base + 1950, m.drop.x + NODE_W / 2, m.drop.y + NODE_H / 2);
    });

    // connect handles: hover the right handle of source then the left handle of target
    for (let i = 0; i < DEMO_MACHINES.length - 1; i++) {
      const src = DEMO_MACHINES[i];
      const tgt = DEMO_MACHINES[i + 1];
      const t0 = connectStart + i * 1200;
      push(t0 + 100, src.drop.x + NODE_W, src.drop.y + NODE_H / 2);
      push(t0 + 700, tgt.drop.x, tgt.drop.y + NODE_H / 2);
    }

    // final flourish: glide to the side
    push(total - 200, 900, 80);

    return { xs, ys, times };
  })();

  const PER = 3000;
  const totalDrops = DEMO_MACHINES.length * PER;
  const connectStart = totalDrops + 400;
  const totalConnects = (DEMO_MACHINES.length - 1) * 1200;
  const total = connectStart + totalConnects + 2200;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {/* Dismiss / replay controls (interactive) */}
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

      {/* Phantom catalog row (mirrors sidebar items getting picked up) */}
      <div className="absolute left-0 top-[100px] flex flex-col gap-2 opacity-70">
        {DEMO_MACHINES.map((m, i) => {
          const isPicked = carrying === i || placed > i;
          return (
            <motion.div
              key={`${cycle}-rail-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isPicked ? 0.25 : 1,
                x: 0,
                scale: carrying === i ? 0.95 : 1,
              }}
              transition={{ duration: 0.25 }}
              className="ml-3 w-[170px] rounded-md border border-dashed border-primary/40 bg-card/60 backdrop-blur px-2 py-1.5 flex items-center gap-2"
            >
              <div
                className="h-6 w-6 rounded flex items-center justify-center"
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
          const tgt = DEMO_MACHINES[i + 1];
          if (edgesDrawn <= i) return null;
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
              animate={{ pathLength: 1, opacity: 0.8 }}
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
              initial={{ opacity: 0, scale: 0.6, y: -10 }}
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
              {/* connection handles */}
              <span className="absolute -right-1.5 top-[34px] h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <span className="absolute -left-1.5 top-[34px] h-2.5 w-2.5 rounded-full bg-muted border-2 border-background" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Ghost card carried by the cursor while dragging */}
      <AnimatePresence>
        {carrying >= 0 && (
          <motion.div
            key={`${cycle}-ghost-${carrying}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none rounded-lg border border-primary/60 bg-card/90 backdrop-blur shadow-xl px-2 py-1.5 flex items-center gap-2"
            style={{
              // Anchored to the cursor; we use the same animate pattern below
              // by reusing the cursor's transform via a wrapping motion.div.
              left: 0,
              top: 0,
              x: cursorKeyframes.xs[0] + 12,
              y: cursorKeyframes.ys[0] + 12,
            }}
            // Re-run cursor keyframes on the ghost too so it follows perfectly.
            // This avoids needing a portal/ref-based attachment.
            animate-x={undefined}
          >
            <CarriedGhost
              machine={DEMO_MACHINES[carrying]}
              xs={cursorKeyframes.xs}
              ys={cursorKeyframes.ys}
              times={cursorKeyframes.times}
              total={total}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The animated cursor itself */}
      <motion.div
        key={`${cycle}-cursor`}
        className="absolute top-0 left-0"
        initial={{ x: cursorKeyframes.xs[0], y: cursorKeyframes.ys[0] }}
        animate={{ x: cursorKeyframes.xs, y: cursorKeyframes.ys }}
        transition={{
          duration: total / 1000,
          times: cursorKeyframes.times,
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

/**
 * The card "stuck" to the cursor while it's dragging a machine.
 * Re-uses the same keyframes as the main cursor so the offset stays exact.
 */
const CarriedGhost = ({
  machine,
  xs,
  ys,
  times,
  total,
}: {
  machine: DemoMachine;
  xs: number[];
  ys: number[];
  times: number[];
  total: number;
}) => {
  return (
    <motion.div
      className="absolute top-0 left-0 flex items-center gap-2"
      initial={{ x: xs[0] + 14, y: ys[0] + 14 }}
      animate={{ x: xs.map((v) => v + 14), y: ys.map((v) => v + 14) }}
      transition={{
        duration: total / 1000,
        times,
        ease: "easeInOut",
      }}
    >
      <div className="rounded-md border border-primary/60 bg-card/95 backdrop-blur shadow-lg px-2 py-1 flex items-center gap-2">
        <div
          className="h-5 w-5 rounded flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, hsl(${machine.hue} 55% 22%), hsl(${(machine.hue + 40) % 360} 60% 14%))`,
          }}
        >
          <ImageIcon className="h-2.5 w-2.5 text-white/70" />
        </div>
        <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">
          {machine.label}
        </p>
      </div>
    </motion.div>
  );
};

export default CreateLineDemo;
