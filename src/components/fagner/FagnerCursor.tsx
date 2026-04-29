import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Sparkles, ImageIcon, Link2, Trash2, MoveDiagonal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CursorState } from "./useFagnerAgent";
import type { Machine } from "@/data/machines";

/**
 * Visual layer for the Fagner cursor. Receives a CursorState and animates
 * smoothly between target positions using framer-motion's tween easing —
 * this gives the "human hand" feel without us computing keyframes ourselves.
 *
 * The component is purely presentational: all timing/sequencing lives in
 * useFagnerAgent. We render at z-50 above the canvas with pointer-events-none
 * so it never interferes with real input.
 */
interface FagnerCursorProps {
  cursor: CursorState;
  machineMap: Map<string, Machine>;
}

const modeIcon = (mode: CursorState["mode"]) => {
  switch (mode) {
    case "carrying":
      return <MoveDiagonal className="h-3 w-3" />;
    case "drawing":
      return <Link2 className="h-3 w-3" />;
    case "clicking":
      return <Trash2 className="h-3 w-3" />;
    default:
      return <Sparkles className="h-3 w-3" />;
  }
};

const FagnerCursor = ({ cursor, machineMap }: FagnerCursorProps) => {
  const carriedMachine = cursor.carryingMachineId
    ? machineMap.get(cursor.carryingMachineId)
    : null;

  return (
    <AnimatePresence>
      {cursor.visible && (
        <motion.div
          key="fagner-cursor-root"
          className="absolute top-0 left-0 pointer-events-none z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: cursor.x,
            y: cursor.y,
          }}
          exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
          transition={{
            x: { type: "tween", ease: [0.45, 0.05, 0.25, 1], duration: 0.5 },
            y: { type: "tween", ease: [0.45, 0.05, 0.25, 1], duration: 0.5 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.25 },
          }}
        >
          {/* Click ripple at cursor tip during interactive modes */}
          <AnimatePresence>
            {(cursor.mode === "carrying" ||
              cursor.mode === "drawing" ||
              cursor.mode === "clicking") && (
              <motion.span
                key={`ripple-${cursor.mode}`}
                initial={{ opacity: 0.6, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "easeOut" }}
                className={cn(
                  "absolute -top-1 -left-1 h-5 w-5 rounded-full pointer-events-none",
                  cursor.mode === "clicking" ? "bg-destructive/40" : "bg-primary/40",
                )}
              />
            )}
          </AnimatePresence>

          {/* Cursor arrow */}
          <motion.div
            animate={{
              scale: cursor.mode === "carrying" || cursor.mode === "drawing" ? 0.85 : 1,
              rotate: cursor.mode === "carrying" ? -18 : -12,
            }}
            transition={{ duration: 0.18 }}
          >
            <MousePointer2
              className={cn(
                "h-7 w-7 drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]",
                cursor.mode === "clicking" ? "fill-destructive" : "fill-primary",
                "stroke-background",
              )}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Name + mode chip */}
          <motion.span
            className="absolute left-6 top-5 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {modeIcon(cursor.mode)}
            Fagner
          </motion.span>

          {/* Speech bubble */}
          <AnimatePresence mode="wait">
            {cursor.speech && (
              <motion.div
                key={cursor.speech}
                initial={{ opacity: 0, y: 6, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute left-8 top-12 bg-card border border-primary/40 rounded-lg px-2.5 py-1 shadow-xl whitespace-nowrap max-w-[260px]"
              >
                <span className="text-[10px] font-medium text-foreground">{cursor.speech}</span>
                <span className="absolute -top-1 left-2 h-2 w-2 bg-card border-l border-t border-primary/40 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ghost card while carrying a NEW machine from catalog */}
          <AnimatePresence>
            {cursor.mode === "carrying" && carriedMachine && (
              <motion.div
                key={`ghost-${carriedMachine.id}`}
                initial={{ opacity: 0, scale: 0.7, y: 0 }}
                animate={{ opacity: 0.95, scale: 1, y: 18 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="absolute left-3 top-0"
              >
                <div className="rounded-lg border-2 border-primary/80 bg-card/95 backdrop-blur shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] px-2 py-1.5 flex items-center gap-2 rotate-[-5deg]">
                  <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                    <ImageIcon className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">
                    {carriedMachine.name}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FagnerCursor;
