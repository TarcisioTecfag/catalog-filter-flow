import { useCallback, useRef, useState } from "react";
import type { Machine } from "@/data/machines";

/**
 * Fagner Agent — programmatic API that drives the SAME canvas state used by
 * the human user. Each action moves a virtual cursor toward a real DOM target,
 * waits a humanized delay, then commits the underlying mutation.
 *
 * The agent is intentionally back-end-agnostic: it only mutates the local
 * nodes/edges arrays via the setters passed in. In the production system the
 * caller can layer remote sync on top of these same setters without changing
 * the agent's behavior.
 */

export interface FlowNode {
  id: string;
  machineId: string;
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export type FagnerAction =
  // Pick a machine card from the catalog sidebar (visual only — moves cursor there).
  | { kind: "pickFromCatalog"; machineId: string }
  // Drop the carried machine on the canvas at content-coordinates (x, y).
  | { kind: "dropAt"; machineId: string; x: number; y: number }
  // Connect two existing nodes (by node id). Animates: source handle → target.
  | { kind: "connect"; sourceId: string; targetId: string }
  // Move an existing node to a new content-coordinate position.
  | { kind: "moveNode"; nodeId: string; x: number; y: number }
  // Remove a node and all its edges.
  | { kind: "deleteNode"; nodeId: string }
  // Remove a single edge by id.
  | { kind: "deleteEdge"; edgeId: string }
  // Select a node (visual highlight, no mutation beyond selection).
  | { kind: "selectNode"; nodeId: string | null }
  // Show a speech bubble for a duration (ms).
  | { kind: "say"; text: string; holdMs?: number }
  // Pure pause (ms) — useful for pacing.
  | { kind: "wait"; ms: number };

export interface AgentDeps {
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FlowEdge[]>>;
  setSelectedNodeId: (id: string | null) => void;
  // Read-only refs for live coordinate translation.
  canvasRef: React.RefObject<HTMLElement>;
  zoomRef: React.MutableRefObject<number>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  machineMap: Map<string, Machine>;
  nodeWidth: number;
  nodeHeight: number;
}

export interface CursorState {
  // Position is in viewport-relative (canvas-local) pixel coordinates.
  x: number;
  y: number;
  visible: boolean;
  speech: string | null;
  // Visual modes for the cursor itself.
  mode: "idle" | "moving" | "carrying" | "drawing" | "clicking";
  // Optional machine snippet attached to cursor while carrying.
  carryingMachineId: string | null;
}

const DEFAULT_CURSOR: CursorState = {
  x: 80,
  y: 60,
  visible: false,
  speech: null,
  mode: "idle",
  carryingMachineId: null,
};

// Humanized timing — feel free to tweak per phase.
const T = {
  travelMin: 380,
  travelPerPx: 0.55, // extra ms per pixel of distance, capped below
  travelMax: 950,
  hoverBeforeClick: 220,
  clickFlash: 160,
  pickupLift: 180,
  dropSettle: 320,
  connectLatch: 240,
  postAction: 200,
};

/** Animate the cursor toward a target with humanized duration; returns Promise that resolves on arrival. */
function travelDuration(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  return Math.min(T.travelMax, Math.max(T.travelMin, dist * T.travelPerPx));
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export function useFagnerAgent(deps: AgentDeps) {
  const { setNodes, setEdges, setSelectedNodeId, canvasRef, zoomRef, panRef, machineMap, nodeWidth, nodeHeight } = deps;

  const [cursor, setCursor] = useState<CursorState>(DEFAULT_CURSOR);
  const cursorRef = useRef<CursorState>(DEFAULT_CURSOR);
  const setCursorBoth = useCallback((next: Partial<CursorState>) => {
    cursorRef.current = { ...cursorRef.current, ...next };
    setCursor(cursorRef.current);
  }, []);

  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);

  /** Move the cursor (state-driven; framer-motion handles the actual easing). */
  const moveCursorTo = useCallback(
    async (x: number, y: number, opts?: { mode?: CursorState["mode"] }) => {
      const from = { x: cursorRef.current.x, y: cursorRef.current.y };
      const dur = travelDuration(from, { x, y });
      setCursorBoth({
        x,
        y,
        visible: true,
        mode: opts?.mode ?? cursorRef.current.mode ?? "moving",
      });
      await sleep(dur);
    },
    [setCursorBoth],
  );

  /** Get a DOM element's center in canvas-local coordinates. */
  const targetCenter = useCallback(
    (el: Element | null): { x: number; y: number } | null => {
      if (!el) return null;
      const rect = (el as HTMLElement).getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return null;
      return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2,
      };
    },
    [canvasRef],
  );

  /** Convert content-space (x, y) to canvas-local pixel for cursor positioning. */
  const contentToCanvas = useCallback(
    (cx: number, cy: number): { x: number; y: number } => {
      const z = zoomRef.current;
      const p = panRef.current;
      return { x: cx * z + p.x, y: cy * z + p.y };
    },
    [zoomRef, panRef],
  );

  // ============================================================
  // Action implementations
  // ============================================================

  const doPickFromCatalog = useCallback(
    async (machineId: string) => {
      const el = document.querySelector(`[data-catalog-machine="${machineId}"]`);
      const center = targetCenter(el);
      if (center) {
        await moveCursorTo(center.x, center.y, { mode: "moving" });
        await sleep(T.hoverBeforeClick);
      }
      setCursorBoth({ mode: "carrying", carryingMachineId: machineId });
      await sleep(T.pickupLift);
    },
    [moveCursorTo, targetCenter, setCursorBoth],
  );

  const doDropAt = useCallback(
    async (machineId: string, x: number, y: number) => {
      // Cursor target is the drop center in canvas-local coords.
      const dropCenterContent = { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };
      const screen = contentToCanvas(dropCenterContent.x, dropCenterContent.y);
      await moveCursorTo(screen.x, screen.y, { mode: "carrying" });
      await sleep(T.dropSettle);

      // Commit node creation.
      const newNode: FlowNode = {
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        machineId,
        x,
        y,
      };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(newNode.id);
      setCursorBoth({ mode: "idle", carryingMachineId: null });
      await sleep(T.postAction);
      return newNode.id;
    },
    [contentToCanvas, moveCursorTo, nodeHeight, nodeWidth, setNodes, setSelectedNodeId, setCursorBoth],
  );

  const doConnect = useCallback(
    async (sourceId: string, targetId: string) => {
      const srcHandle = document.querySelector(`[data-source-handle="${sourceId}"]`);
      const tgtNode = document.getElementById(`flow-node-${targetId}`);
      const srcCenter = targetCenter(srcHandle);
      const tgtCenter = targetCenter(tgtNode);
      if (srcCenter) {
        await moveCursorTo(srcCenter.x, srcCenter.y, { mode: "moving" });
        await sleep(T.hoverBeforeClick);
      }
      setCursorBoth({ mode: "drawing" });
      if (tgtCenter) {
        await moveCursorTo(tgtCenter.x, tgtCenter.y, { mode: "drawing" });
      }
      await sleep(T.connectLatch);
      // Commit the edge (idempotent — skip duplicates).
      setEdges((prev) => {
        if (prev.some((e) => e.source === sourceId && e.target === targetId)) return prev;
        return [...prev, { id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, source: sourceId, target: targetId }];
      });
      setCursorBoth({ mode: "idle" });
      await sleep(T.postAction);
    },
    [moveCursorTo, setEdges, targetCenter, setCursorBoth],
  );

  const doMoveNode = useCallback(
    async (nodeId: string, x: number, y: number) => {
      const el = document.getElementById(`flow-node-${nodeId}`);
      const center = targetCenter(el);
      if (center) {
        await moveCursorTo(center.x, center.y, { mode: "moving" });
        await sleep(T.hoverBeforeClick);
      }
      setCursorBoth({ mode: "carrying", carryingMachineId: null });
      const dropScreen = contentToCanvas(x + nodeWidth / 2, y + nodeHeight / 2);
      await moveCursorTo(dropScreen.x, dropScreen.y, { mode: "carrying" });
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
      await sleep(T.dropSettle);
      setCursorBoth({ mode: "idle" });
      await sleep(T.postAction);
    },
    [contentToCanvas, moveCursorTo, nodeHeight, nodeWidth, setNodes, targetCenter, setCursorBoth],
  );

  const doDeleteNode = useCallback(
    async (nodeId: string) => {
      // First, click the node to select it (so the X button reveals).
      setSelectedNodeId(nodeId);
      const nodeEl = document.getElementById(`flow-node-${nodeId}`);
      const nodeCenter = targetCenter(nodeEl);
      if (nodeCenter) {
        await moveCursorTo(nodeCenter.x, nodeCenter.y, { mode: "moving" });
        await sleep(T.hoverBeforeClick);
      }
      // Wait one frame for the X button to be in DOM, then move to it.
      await sleep(60);
      const xBtn = document.querySelector(`[data-delete-node="${nodeId}"]`);
      const xCenter = targetCenter(xBtn);
      if (xCenter) {
        await moveCursorTo(xCenter.x, xCenter.y, { mode: "clicking" });
        await sleep(T.clickFlash);
      }
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
      setCursorBoth({ mode: "idle" });
      await sleep(T.postAction);
    },
    [moveCursorTo, setEdges, setNodes, setSelectedNodeId, targetCenter, setCursorBoth],
  );

  const doDeleteEdge = useCallback(
    async (edgeId: string) => {
      const path = document.getElementById(`flow-edge-${edgeId}`);
      const center = targetCenter(path);
      if (center) {
        await moveCursorTo(center.x, center.y, { mode: "clicking" });
        await sleep(T.clickFlash);
      }
      setEdges((prev) => prev.filter((e) => e.id !== edgeId));
      await sleep(T.postAction);
    },
    [moveCursorTo, setEdges, targetCenter],
  );

  const doSay = useCallback(
    async (text: string, holdMs = 1400) => {
      setCursorBoth({ speech: text });
      await sleep(holdMs);
      setCursorBoth({ speech: null });
    },
    [setCursorBoth],
  );

  /** Run a queue of actions sequentially with humanized pacing. */
  const run = useCallback(
    async (actions: FagnerAction[]) => {
      if (running) return;
      setRunning(true);
      cancelRef.current = false;
      setCursorBoth({ visible: true });
      try {
        for (const action of actions) {
          if (cancelRef.current) break;
          switch (action.kind) {
            case "pickFromCatalog":
              await doPickFromCatalog(action.machineId);
              break;
            case "dropAt":
              await doDropAt(action.machineId, action.x, action.y);
              break;
            case "connect":
              await doConnect(action.sourceId, action.targetId);
              break;
            case "moveNode":
              await doMoveNode(action.nodeId, action.x, action.y);
              break;
            case "deleteNode":
              await doDeleteNode(action.nodeId);
              break;
            case "deleteEdge":
              await doDeleteEdge(action.edgeId);
              break;
            case "selectNode":
              setSelectedNodeId(action.nodeId);
              await sleep(120);
              break;
            case "say":
              await doSay(action.text, action.holdMs);
              break;
            case "wait":
              await sleep(action.ms);
              break;
          }
        }
      } finally {
        setRunning(false);
        // Linger briefly, then hide the cursor.
        await sleep(500);
        setCursorBoth({ visible: false, mode: "idle", carryingMachineId: null, speech: null });
      }
    },
    [
      doConnect,
      doDeleteEdge,
      doDeleteNode,
      doDropAt,
      doMoveNode,
      doPickFromCatalog,
      doSay,
      running,
      setCursorBoth,
      setSelectedNodeId,
    ],
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { cursor, running, run, cancel, machineMap };
}
