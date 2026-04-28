import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, ImageIcon, X, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Animated demonstration overlaid on the empty CreateLine canvas.
 *
 * Simulates Fagner (the AI assistant) physically building a line: cursor
 * moves with natural easing, machines lift on grab, drop with a bounce, edges
 * draw progressively, and a final "linha pronta" flourish celebrates the
 * result. Loops indefinitely until dismissed.
 *
 * All coordinates are local to the canvas main area (parent must be
 * `position: relative`).
 */

type DemoMachine = {
  id: string;
  label: string;
  model: string;
  pickup: { x: number; y: number };
  drop: { x: number; y: number };
  hue: number;
};

const NODE_W = 168;
const NODE_H = 116;

const DEMO_MACHINES: DemoMachine[] = [
  {
    id: "d1",
    label: "Esteira Transportadora",
    model: "PAMQEST003",
    pickup: { x: 24, y: 130 },
    drop: { x: 280, y: 240 },
    hue: 200,
  },
  {
    id: "d2",
    label: "Envasadora 4 Bicos",
    model: "PAMQENV004",
    pickup: { x: 24, y: 196 },
    drop: { x: 520, y: 240 },
    hue: 340,
  },
  {
    id: "d3",
    label: "Rosqueadora Linear",
    model: "PAMQRSQ001",
    pickup: { x: 24, y: 262 },
    drop: { x: 760, y: 240 },
    hue: 30,
  },
];

// Same cubic curve formula used by the real canvas so demo edges look identical.
const buildPath = (sx: number, sy: number, tx: number, ty: number) => {
  const x1 = sx + NODE_W;
  const y1 = sy + NODE_H / 2;
  const x2 = tx;
  const y2 = ty + NODE_H / 2;
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

// ===== Timing constants (ms) =====
// Designed for a deliberate, "watch me work" pace — not too fast, not boring.
const T = {
  intro: 700,                   // initial cursor entrance + greet
  approach: 650,                // cursor travels to a catalog item
  hover: 280,                   // cursor hovers before grabbing
  lift: 220,                    // grab + lift animation
  drag: 1100,                   // drag to drop position
  release: 320,                 // release + settle bounce
  betweenMachines: 180,         // tiny pause between drops
  beforeConnect: 600,           // pause after last drop, before connecting
  connectApproach: 520,         // travel to source handle
  connectDraw: 700,             // drag from source to target handle
  connectSettle: 220,           // brief pause after each connection
  celebrate: 1600,              // final "done" flourish
  endHold: 800,                 // hold completed line before restart
};

interface CreateLineDemoProps {
  onDismiss?: () => void;
}

const CreateLineDemo = ({ onDismiss }: CreateLineDemoProps) => {
  const [cycle, setCycle] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [edgesDrawn, setEdgesDrawn] = useState(0);
  const [carrying, setCarrying] = useState<number>(-1);
  // Index of the edge currently being "drawn" by the cursor (-1 = none).
  // While active, we render an animated dashed preview line that follows the
  // cursor — exactly like the real connection UX would show.
  const [drawingEdge, setDrawingEdge] = useState<number>(-1);
  // "speech bubble" content shown next to Fagner's cursor at key moments
  const [speech, setSpeech] = useState<string | null>(null);
  // Triggers a celebratory pulse on completed nodes when the line finishes
  const [celebrating, setCelebrating] = useState(false);
  // "ready to connect" — cursor reached source handle, before drag starts
  const [readyHandle, setReadyHandle] = useState<number>(-1);
  // "just connected" — flash target handle + edge briefly after acceptance
  const [acceptedEdge, setAcceptedEdge] = useState<number>(-1);

  // ===== Cursor keyframes (memoized; identical for every cycle) =====
  // Built as a (time, x, y) timeline that mirrors the timeout schedule below.
  // Using arrays + `times` lets framer-motion interpolate smoothly between
  // waypoints with a single ease curve — far smoother than chained tweens.
  const { xs, ys, times, totalMs } = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const ts: number[] = [];

    let t = 0;
    const push = (x: number, y: number) => {
      xs.push(x);
      ys.push(y);
      ts.push(t);
    };

    // ----- Intro: cursor flies in from top-right -----
    push(900, -40);
    t += T.intro;
    push(640, 80);

    // ----- Phase 1: pick + drop each machine -----
    DEMO_MACHINES.forEach((m, i) => {
      // travel to catalog item
      t += T.approach;
      push(m.pickup.x + 90, m.pickup.y + 22);
      // hover
      t += T.hover;
      push(m.pickup.x + 90, m.pickup.y + 22);
      // lift (tiny upward nudge to feel like grabbing)
      t += T.lift;
      push(m.pickup.x + 96, m.pickup.y + 16);
      // drag to drop center (with a subtle arc — midpoint slightly higher)
      const midX = (m.pickup.x + 96 + m.drop.x + NODE_W / 2) / 2;
      const midY = Math.min(m.pickup.y, m.drop.y) - 30;
      t += T.drag * 0.5;
      push(midX, midY);
      t += T.drag * 0.5;
      push(m.drop.x + NODE_W / 2, m.drop.y + NODE_H / 2);
      // release dwell
      t += T.release;
      push(m.drop.x + NODE_W / 2 + 4, m.drop.y + NODE_H / 2 - 6);
      if (i < DEMO_MACHINES.length - 1) {
        t += T.betweenMachines;
        push(m.drop.x + NODE_W / 2 + 4, m.drop.y + NODE_H / 2 - 6);
      }
    });

    // ----- Phase 2: connect machines -----
    t += T.beforeConnect;
    const lastDrop = DEMO_MACHINES[DEMO_MACHINES.length - 1].drop;
    push(lastDrop.x + NODE_W / 2, lastDrop.y - 30);

    for (let i = 0; i < DEMO_MACHINES.length - 1; i++) {
      const src = DEMO_MACHINES[i];
      const tgt = DEMO_MACHINES[i + 1];
      // approach source handle
      t += T.connectApproach;
      push(src.drop.x + NODE_W + 6, src.drop.y + NODE_H / 2);
      // drag arc up & across to target handle
      const midX = (src.drop.x + NODE_W + tgt.drop.x) / 2;
      const midY = src.drop.y + NODE_H / 2 - 40;
      t += T.connectDraw * 0.5;
      push(midX, midY);
      t += T.connectDraw * 0.5;
      push(tgt.drop.x - 6, tgt.drop.y + NODE_H / 2);
      // settle
      t += T.connectSettle;
      push(tgt.drop.x - 6, tgt.drop.y + NODE_H / 2);
    }

    // ----- Phase 3: celebrate + glide off -----
    t += T.celebrate * 0.4;
    push(
      (DEMO_MACHINES[0].drop.x + DEMO_MACHINES[DEMO_MACHINES.length - 1].drop.x) / 2 +
        NODE_W / 2,
      DEMO_MACHINES[0].drop.y - 70,
    );
    t += T.celebrate * 0.6;
    push(940, 60);
    t += T.endHold;
    push(940, 60);

    const total = t;
    const times = ts.map((v) => v / total);
    return { xs, ys, times, totalMs: total };
  }, []);

  // ===== Master timeline (real timeouts to keep DOM state in sync) =====
  // Mirrors the cursor waypoints above; offsets are accumulated identically.
  // We also store cycleStart so the live cursor interpolation below can stay
  // perfectly synced with the framer-motion keyframe transition.
  const [cycleStart, setCycleStart] = useState(() => performance.now());
  useEffect(() => {
    setPlaced(0);
    setEdgesDrawn(0);
    setCarrying(-1);
    setDrawingEdge(-1);
    setReadyHandle(-1);
    setAcceptedEdge(-1);
    setSpeech(null);
    setCelebrating(false);
    setCycleStart(performance.now());

    const timeouts: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timeouts.push(window.setTimeout(fn, ms));
    };

    let t = 0;

    // Intro greeting
    at(t + 200, () => setSpeech("Deixa comigo!"));
    at(t + T.intro + 400, () => setSpeech(null));

    t += T.intro;

    // Phase 1
    DEMO_MACHINES.forEach((m, i) => {
      t += T.approach;
      // hover starts
      const hoverStart = t;
      t += T.hover;
      // grab
      at(hoverStart + T.hover - 40, () => setCarrying(i));
      t += T.lift;
      t += T.drag;
      // drop
      at(t, () => {
        setPlaced((p) => Math.max(p, i + 1));
      });
      t += T.release;
      at(t - 60, () => setCarrying(-1));
      if (i < DEMO_MACHINES.length - 1) t += T.betweenMachines;
    });

    // Phase 2
    t += T.beforeConnect;
    at(t - 200, () => setSpeech("Conectando..."));
    at(t + 900, () => setSpeech(null));

    for (let i = 0; i < DEMO_MACHINES.length - 1; i++) {
      const idx = i;
      // cursor approaches source handle → "ready to connect"
      at(t + 40, () => setReadyHandle(idx));
      t += T.connectApproach;
      // start drawing the live preview when cursor reaches source handle
      at(t, () => {
        setReadyHandle(-1);
        setDrawingEdge(idx);
      });
      t += T.connectDraw;
      // commit edge & clear preview when cursor reaches target handle
      at(t, () => {
        setEdgesDrawn((e) => Math.max(e, idx + 1));
        setDrawingEdge(-1);
        setAcceptedEdge(idx);
      });
      at(t + 650, () => setAcceptedEdge((cur) => (cur === idx ? -1 : cur)));
      t += T.connectSettle;
    }

    // Phase 3
    at(t + 100, () => {
      setCelebrating(true);
      setSpeech("Linha pronta! ✨");
    });
    t += T.celebrate;
    at(t, () => setSpeech(null));
    t += T.endHold;

    at(totalMs, () => setCycle((c) => c + 1));

    return () => timeouts.forEach((to) => clearTimeout(to));
  }, [cycle, totalMs]);

  // Live cursor position — interpolated from THE SAME keyframes used by the
  // framer-motion cursor transition. This guarantees the preview-edge tip is
  // pixel-perfect on the cursor (no DOM read jitter, no drift).
  const [cursorPos, setCursorPos] = useState({ x: xs[0], y: ys[0] });
  useEffect(() => {
    if (drawingEdge < 0) return;
    let raf = 0;
    // Replicate framer-motion's default `easeInOut` (cubic) on each segment
    // so our sample matches the visible cursor exactly.
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const tick = () => {
      const elapsed = performance.now() - cycleStart;
      const p = Math.min(1, Math.max(0, elapsed / totalMs));
      // Locate the segment [i, i+1] containing p.
      let i = 0;
      for (let k = 0; k < times.length - 1; k++) {
        if (p >= times[k] && p <= times[k + 1]) {
          i = k;
          break;
        }
        if (p > times[times.length - 1]) i = times.length - 2;
      }
      const span = Math.max(1e-6, times[i + 1] - times[i]);
      const localT = easeInOut((p - times[i]) / span);
      const x = xs[i] + (xs[i + 1] - xs[i]) * localT;
      const y = ys[i] + (ys[i + 1] - ys[i]) * localT;
      setCursorPos({ x, y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drawingEdge, totalMs, cycleStart, xs, ys, times]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {/* Soft vignette to focus attention on the demo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background)/0.55)_100%)]" />

      {/* Top control strip (interactive) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-card/95 backdrop-blur border border-primary/30 rounded-full pl-3 pr-2 py-1.5 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span className="text-[11px] font-medium text-foreground">
          Fagner está montando uma linha de exemplo
        </span>
        <button
          onClick={() => setCycle((c) => c + 1)}
          className="ml-1 inline-flex items-center gap-1 text-[10px] text-primary hover:bg-primary/10 px-2 py-1 rounded-full font-medium transition-colors"
          title="Repetir demonstração"
        >
          <RotateCcw className="h-3 w-3" />
          Repetir
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-0.5 h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            title="Fechar demonstração"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </motion.div>

      {/* Phantom catalog rail (mirrors sidebar items getting picked) */}
      <div className="absolute left-0 top-[110px] flex flex-col gap-2">
        {DEMO_MACHINES.map((m, i) => {
          const isCarrying = carrying === i;
          const isPlaced = placed > i;
          return (
            <motion.div
              key={`${cycle}-rail-${i}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{
                opacity: isPlaced ? 0.18 : isCarrying ? 0.35 : 0.95,
                x: 0,
                scale: isCarrying ? 0.92 : 1,
                borderColor: isCarrying ? "hsl(var(--primary))" : undefined,
              }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="ml-3 w-[180px] rounded-md border-2 border-dashed border-primary/40 bg-card/80 backdrop-blur px-2 py-1.5 flex items-center gap-2 shadow-sm"
            >
              <div
                className="h-7 w-7 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${m.hue} 55% 22%), hsl(${(m.hue + 40) % 360} 60% 14%))`,
                }}
              >
                <ImageIcon className="h-3 w-3 text-white/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-foreground line-clamp-1">
                  {m.label}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono">
                  {m.model}
                </p>
              </div>
              {/* Pulse ring while cursor hovers */}
              {isCarrying && (
                <motion.span
                  className="absolute inset-0 rounded-md border-2 border-primary pointer-events-none"
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
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
          <linearGradient id="demo-edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Committed edges */}
        {DEMO_MACHINES.slice(0, -1).map((src, i) => {
          if (edgesDrawn <= i) return null;
          const tgt = DEMO_MACHINES[i + 1];
          const d = buildPath(src.drop.x, src.drop.y, tgt.drop.x, tgt.drop.y);
          return (
            <g key={`${cycle}-edge-${i}`}>
              {/* Glow underlay */}
              <motion.path
                d={d}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={6}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: celebrating ? 0.35 : 0.18 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ filter: "blur(4px)" }}
              />
              {/* Main stroke */}
              <motion.path
                d={d}
                fill="none"
                stroke="url(#demo-edge-gradient)"
                strokeWidth={2.2}
                strokeLinecap="round"
                markerEnd="url(#demo-arrow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
              {/* Travelling spark to imply data flow */}
              {edgesDrawn > i && (
                <motion.circle
                  r={3}
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 0.6,
                    delay: 0.4,
                  }}
                >
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.4s"
                    path={d}
                  />
                </motion.circle>
              )}
            </g>
          );
        })}

        {/* Live preview edge being dragged from a source handle */}
        {drawingEdge >= 0 && (() => {
          const src = DEMO_MACHINES[drawingEdge];
          const sx = src.drop.x + NODE_W;
          const sy = src.drop.y + NODE_H / 2;
          const tx = cursorPos.x;
          const ty = cursorPos.y;
          const dx = Math.abs(tx - sx) * 0.5;
          const d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
          return (
            <path
              d={d}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.85}
            />
          );
        })()}
      </svg>

      {/* Dropped machine cards on canvas */}
      <AnimatePresence>
        {DEMO_MACHINES.map((m, i) => {
          if (placed <= i) return null;
          return (
            <motion.div
              key={`${cycle}-card-${i}`}
              initial={{ opacity: 0, scale: 0.4, y: -24, rotate: -6 }}
              animate={{
                opacity: 1,
                scale: celebrating ? [1, 1.06, 1] : 1,
                y: 0,
                rotate: 0,
              }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                scale: celebrating
                  ? { duration: 0.5, delay: i * 0.1, repeat: 1, repeatType: "reverse" }
                  : undefined,
              }}
              className={cn(
                "absolute rounded-xl border-2 bg-card overflow-hidden",
                celebrating
                  ? "border-primary shadow-[0_0_30px_-2px_hsl(var(--primary)/0.7)]"
                  : "border-primary/70 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]",
              )}
              style={{
                left: m.drop.x,
                top: m.drop.y,
                width: NODE_W,
                height: NODE_H,
              }}
            >
              {/* Drop ripple */}
              <motion.span
                className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
              <div
                className="relative h-[70px] w-full flex items-center justify-center"
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
              <span className="absolute -right-1.5 top-[36px] h-3 w-3 rounded-full bg-primary border-2 border-background shadow-md" />
              {/* Source handle "ready to connect" pulse */}
              {readyHandle === i && (
                <>
                  <motion.span
                    className="absolute -right-2.5 top-[33px] h-5 w-5 rounded-full border-2 border-primary pointer-events-none"
                    initial={{ opacity: 0.9, scale: 0.6 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute -right-1.5 top-[36px] h-3 w-3 rounded-full bg-primary pointer-events-none"
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
                  />
                </>
              )}
              {/* Target handle "accepted" highlight */}
              {acceptedEdge === i - 1 && (
                <motion.span
                  className="absolute -left-2.5 top-[33px] h-5 w-5 rounded-full border-2 border-primary pointer-events-none"
                  initial={{ opacity: 0.95, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              )}
              <span
                className={cn(
                  "absolute -left-1.5 top-[36px] h-2.5 w-2.5 rounded-full border-2 border-background transition-colors",
                  acceptedEdge === i - 1 ? "bg-primary" : "bg-muted",
                )}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Ghost card pinned to cursor while it's dragging.
          Shares EXACT keyframes with the cursor so the offset stays pixel-perfect. */}
      <AnimatePresence>
        {carrying >= 0 && (
          <motion.div
            key={`${cycle}-ghost-${carrying}`}
            className="absolute top-0 left-0"
            initial={{ x: xs[0] + 18, y: ys[0] + 18, opacity: 0, scale: 0.7 }}
            animate={{
              x: xs.map((v) => v + 18),
              y: ys.map((v) => v + 18),
              opacity: 0.95,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            transition={{
              x: { duration: totalMs / 1000, times, ease: "easeInOut" },
              y: { duration: totalMs / 1000, times, ease: "easeInOut" },
              opacity: { duration: 0.18 },
              scale: { duration: 0.2 },
            }}
          >
            <div className="rounded-lg border-2 border-primary/80 bg-card/95 backdrop-blur shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] px-2 py-1.5 flex items-center gap-2 rotate-[-5deg]">
              <div
                className="h-6 w-6 rounded flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${DEMO_MACHINES[carrying].hue} 55% 22%), hsl(${(DEMO_MACHINES[carrying].hue + 40) % 360} 60% 14%))`,
                }}
              >
                <ImageIcon className="h-3 w-3 text-white/70" />
              </div>
              <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">
                {DEMO_MACHINES[carrying].label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The animated Fagner cursor */}
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
        <div id="fagner-cursor" className="relative">
          {/* Click ripple at the cursor tip when grabbing/releasing */}
          <AnimatePresence>
            {(carrying >= 0 || drawingEdge >= 0) && (
              <motion.span
                key={`ripple-${carrying}-${drawingEdge}`}
                initial={{ opacity: 0.6, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary/40 pointer-events-none"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={{
              scale: carrying >= 0 || drawingEdge >= 0 ? 0.85 : 1,
              rotate: carrying >= 0 ? -18 : -12,
            }}
            transition={{ duration: 0.18 }}
          >
            <MousePointer2
              className={cn(
                "h-7 w-7 drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]",
                "fill-primary stroke-background",
              )}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Fagner name tag */}
          <motion.span
            className="absolute left-6 top-5 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-2.5 w-2.5" />
            Fagner
          </motion.span>

          {/* Speech bubble */}
          <AnimatePresence>
            {speech && (
              <motion.div
                key={speech}
                initial={{ opacity: 0, y: 6, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute left-8 top-12 bg-card border border-primary/40 rounded-lg px-2.5 py-1 shadow-xl whitespace-nowrap"
              >
                <span className="text-[10px] font-medium text-foreground">{speech}</span>
                <span className="absolute -top-1 left-2 h-2 w-2 bg-card border-l border-t border-primary/40 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Final celebration burst */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-[180px] flex justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.6, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.7)] flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">Linha montada!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateLineDemo;
