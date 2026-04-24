import { useState, useRef, useMemo, useCallback, useEffect, DragEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Send,
  Sparkles,
  Trash2,
  Link2,
  Save,
  X,
  GripVertical,
  Bot,
  User as UserIcon,
  Wand2,
  AlertTriangle,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Hand,
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories, machines, type Machine } from "@/data/machines";
import type { LineMachine } from "@/data/industrialLines";
import MachineDetailModal from "@/components/MachineDetailModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FlowNode {
  id: string;
  machineId: string;
  x: number;
  y: number;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const NODE_W = 180;
const NODE_H = 200;

// Pseudo-random but stable hue per machine id, used to create a colored
// "photo" placeholder so the card looks visual even without real images.
const hueFromId = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
};

const CreateLine = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  // catalog filter
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // workflow state
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // modal
  const [openMachine, setOpenMachine] = useState<LineMachine | null>(null);

  // zoom + panels + pan
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2;
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // pan mode (toggled by Space key or dedicated button); spaceHeld tracks
  // momentary activation while the key is held.
  const [panMode, setPanMode] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const isPanActive = panMode || spaceHeld;
  const isPanActiveRef = useRef(false);
  useEffect(() => {
    isPanActiveRef.current = isPanActive;
  }, [isPanActive]);

  const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

  // Zoom around an anchor point given in canvas-local pixel coordinates.
  // Keeps the world point under the anchor stationary on screen.
  const zoomAt = useCallback((nextZoomRaw: number, anchorX: number, anchorY: number) => {
    const nextZoom = clampZoom(nextZoomRaw);
    const z = zoomRef.current;
    if (nextZoom === z) return;
    const p = panRef.current;
    // world point under cursor before zoom
    const worldX = (anchorX - p.x) / z;
    const worldY = (anchorY - p.y) / z;
    // new pan so the same world point stays under the cursor
    const newPanX = anchorX - worldX * nextZoom;
    const newPanY = anchorY - worldY * nextZoom;
    setZoom(nextZoom);
    setPan({ x: newPanX, y: newPanY });
  }, []);

  // Centered zoom helpers (icon buttons): anchor is the canvas center.
  const zoomCenterDelta = (delta: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      setZoom((z) => clampZoom(parseFloat((z + delta).toFixed(2))));
      return;
    }
    zoomAt(parseFloat((zoomRef.current + delta).toFixed(2)), rect.width / 2, rect.height / 2);
  };
  const zoomIn = () => zoomCenterDelta(0.1);
  const zoomOut = () => zoomCenterDelta(-0.1);
  const zoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // ---- Smooth drag with refs + rAF (no React state per mousemove) ----
  const draggingRef = useRef<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
    rafId: number | null;
    nextX: number;
    nextY: number;
    moved: boolean;
    affectedEdges: { edgeId: string; sourceId: string; targetId: string }[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o Fagner, seu assistente de linhas industriais. Posso te ajudar a montar um fluxo, sugerir máquinas para uma etapa específica, ou analisar a linha que você está criando. Por onde começamos?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const filteredMachines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return machines.filter((m) => {
      if (activeCategory !== "all" && m.category !== activeCategory) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  const machineMap = useMemo(() => {
    const map = new Map<string, Machine>();
    machines.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // Convert catalog Machine -> LineMachine shape expected by the modal
  const toLineMachine = useCallback((m: Machine): LineMachine => {
    return {
      name: m.name,
      model: m.model,
      description:
        `Equipamento da categoria ${m.subcategory}. Cadastrado no catálogo geral com tags: ${m.tags.join(", ") || "—"}.`,
      features: m.tags,
      specs: [
        { label: "Categoria", value: m.subcategory },
        { label: "Modelo", value: m.model },
      ],
      images: [],
      usageInLine:
        "Esta máquina foi adicionada ao seu fluxo personalizado. Configure a posição e as conexões para definir como ela se integra à linha.",
    };
  }, []);

  // ===== Drag from sidebar =====
  const handleSidebarDragStart = (e: DragEvent<HTMLDivElement>, machineId: string) => {
    e.dataTransfer.setData("machineId", machineId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const machineId = e.dataTransfer.getData("machineId");
    if (!machineId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const z = zoomRef.current;
    const p = panRef.current;
    const x = (e.clientX - rect.left - p.x) / z - NODE_W / 2;
    const y = (e.clientY - rect.top - p.y) / z - NODE_H / 2;
    const newNode: FlowNode = {
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      machineId,
      x: Math.max(10, x),
      y: Math.max(10, y),
    };
    setNodes((prev) => [...prev, newNode]);
    toast.success("Máquina adicionada ao fluxo");
  };

  // Live positions used by the drag loop. Kept in a ref so we can update the
  // DOM (node transform + SVG paths) inside rAF without triggering React re-renders
  // on every mouse move. Synced to React state on drag end.
  const livePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Keep live positions in sync whenever React state changes (add/remove/commit).
  useEffect(() => {
    const map = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => map.set(n.id, { x: n.x, y: n.y }));
    livePositionsRef.current = map;
  }, [nodes]);

  // Build the cubic bezier path string between two nodes given their top-left positions.
  const buildEdgePath = (sx: number, sy: number, tx: number, ty: number) => {
    const x1 = sx + NODE_W;
    const y1 = sy + NODE_H / 2;
    const x2 = tx;
    const y2 = ty + NODE_H / 2;
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // ===== Smooth move of existing node (pointer events + rAF + DOM mutation) =====
  const applyDragFrame = useCallback(() => {
    const drag = draggingRef.current;
    if (!drag) return;
    drag.rafId = null;

    // 1) Move the node element directly via transform.
    const el = document.getElementById(`flow-node-${drag.nodeId}`);
    if (el) {
      el.style.transform = `translate3d(${drag.nextX}px, ${drag.nextY}px, 0)`;
    }

    // 2) Update the live position map so edge calculations see the new coords.
    livePositionsRef.current.set(drag.nodeId, { x: drag.nextX, y: drag.nextY });

    // 3) Update only the affected SVG paths in place (no React re-render).
    drag.affectedEdges.forEach(({ edgeId, sourceId, targetId }) => {
      const src = livePositionsRef.current.get(sourceId);
      const tgt = livePositionsRef.current.get(targetId);
      if (!src || !tgt) return;
      const pathEl = document.getElementById(`flow-edge-${edgeId}`) as unknown as SVGPathElement | null;
      if (pathEl) {
        pathEl.setAttribute("d", buildEdgePath(src.x, src.y, tgt.x, tgt.y));
      }
    });
  }, []);

  const handleNodePointerDown = (e: React.PointerEvent<HTMLDivElement>, node: FlowNode) => {
    if (connectingFrom) return;
    if (isPanActiveRef.current) return; // pan mode owns canvas drags
    if (e.button !== 0) return;
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const z = zoomRef.current;
    const p = panRef.current;
    // Pre-compute which edges touch this node so we don't filter on every frame.
    const affectedEdges = edges
      .filter((ed) => ed.source === node.id || ed.target === node.id)
      .map((ed) => ({ edgeId: ed.id, sourceId: ed.source, targetId: ed.target }));
    draggingRef.current = {
      nodeId: node.id,
      // offsets are in content (unzoomed, unpanned) coordinates
      offsetX: (e.clientX - rect.left - p.x) / z - node.x,
      offsetY: (e.clientY - rect.top - p.y) / z - node.y,
      rafId: null,
      nextX: node.x,
      nextY: node.y,
      moved: false,
      affectedEdges,
    };
    setSelectedNodeId(node.id);
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      const drag = draggingRef.current;
      if (!drag) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const z = zoomRef.current;
      const p = panRef.current;
      // Translate viewport pointer to content coordinates: subtract pan, divide by zoom.
      // No bounds clamping vs viewport — content can extend beyond visible area
      // (the user can pan to reach it). Just clamp at zero on the top/left.
      const newX = Math.max(0, (ev.clientX - rect.left - p.x) / z - drag.offsetX);
      const newY = Math.max(0, (ev.clientY - rect.top - p.y) / z - drag.offsetY);
      drag.nextX = newX;
      drag.nextY = newY;
      drag.moved = true;
      if (drag.rafId == null) {
        drag.rafId = requestAnimationFrame(applyDragFrame);
      }
    };
    const onUp = () => {
      const drag = draggingRef.current;
      if (!drag) return;
      if (drag.rafId != null) cancelAnimationFrame(drag.rafId);
      const finalX = drag.nextX;
      const finalY = drag.nextY;
      const nodeId = drag.nodeId;
      draggingRef.current = null;
      setIsDragging(false);
      // Commit final position to React state. The node's inline transform stays
      // valid because we render nodes using the same translate3d formula, so
      // there's no visible jump between DOM-driven drag and React-rendered state.
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, x: finalX, y: finalY } : n)),
      );
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [applyDragFrame]);

  // ===== Wheel zoom centered on cursor =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const ax = ev.clientX - rect.left;
      const ay = ev.clientY - rect.top;
      // Smooth-ish multiplicative step.
      const factor = ev.deltaY > 0 ? 0.9 : 1.1;
      const next = parseFloat((zoomRef.current * factor).toFixed(3));
      zoomAt(next, ax, ay);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel as EventListener);
  }, [zoomAt]);

  // ===== Space key toggles temporary pan mode while held =====
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.code !== "Space") return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      ev.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (ev: KeyboardEvent) => {
      if (ev.code !== "Space") return;
      setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // ===== Pan drag (rAF-driven, direct DOM transform) =====
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    nextX: number;
    nextY: number;
    rafId: number | null;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const applyPanFrame = useCallback(() => {
    const drag = panDragRef.current;
    if (!drag) return;
    drag.rafId = null;
    panRef.current = { x: drag.nextX, y: drag.nextY };
    const wrapper = document.getElementById("flow-canvas-wrapper");
    if (wrapper) {
      wrapper.style.transform = `translate3d(${drag.nextX}px, ${drag.nextY}px, 0) scale(${zoomRef.current})`;
    }
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isMiddle = e.button === 1;
    if (!isPanActiveRef.current && !isMiddle) return;
    if (e.button !== 0 && !isMiddle) return;
    e.preventDefault();
    panDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: panRef.current.x,
      baseY: panRef.current.y,
      nextX: panRef.current.x,
      nextY: panRef.current.y,
      rafId: null,
    };
    setIsPanning(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      const drag = panDragRef.current;
      if (!drag) return;
      drag.nextX = drag.baseX + (ev.clientX - drag.startX);
      drag.nextY = drag.baseY + (ev.clientY - drag.startY);
      if (drag.rafId == null) {
        drag.rafId = requestAnimationFrame(applyPanFrame);
      }
    };
    const onUp = () => {
      const drag = panDragRef.current;
      if (!drag) return;
      if (drag.rafId != null) cancelAnimationFrame(drag.rafId);
      const finalX = drag.nextX;
      const finalY = drag.nextY;
      panDragRef.current = null;
      setIsPanning(false);
      // Commit final pan to React state — wrapper already shows these coords.
      setPan({ x: finalX, y: finalY });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [applyPanFrame]);


  const handleCanvasClick = () => {
    setSelectedNodeId(null);
    setConnectingFrom(null);
  };

  // ===== Connections =====
  const startConnection = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
    toast.info("Clique em outra máquina para conectar");
  };

  const handleNodeClick = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== nodeId) {
      const exists = edges.some((ed) => ed.source === connectingFrom && ed.target === nodeId);
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { id: `e_${Date.now()}`, source: connectingFrom, target: nodeId },
        ]);
        toast.success("Conexão criada");
      }
      setConnectingFrom(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const handleNodeDoubleClick = (e: MouseEvent, machineId: string) => {
    e.stopPropagation();
    const m = machineMap.get(machineId);
    if (!m) return;
    setOpenMachine(toLineMachine(m));
  };

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
    toast.success("Máquina removida");
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    toast.success("Fluxo limpo");
  };

  // ===== Edge rendering =====
  const renderEdges = () => {
    return edges.map((edge) => {
      const src = nodes.find((n) => n.id === edge.source);
      const tgt = nodes.find((n) => n.id === edge.target);
      if (!src || !tgt) return null;
      const path = buildEdgePath(src.x, src.y, tgt.x, tgt.y);
      return (
        <g key={edge.id}>
          <path
            id={`flow-edge-${edge.id}`}
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            markerEnd="url(#arrow)"
            className="opacity-70"
          />
        </g>
      );
    });
  };

  // ===== Chat (mock) =====
  const generateFagnerReply = useCallback(
    (userMsg: string, currentNodes: FlowNode[]): string => {
      const lower = userMsg.toLowerCase();
      const nodeCount = currentNodes.length;
      const machineNames = currentNodes
        .map((n) => machineMap.get(n.machineId)?.name)
        .filter(Boolean);

      if (lower.includes("analis") || lower.includes("revis") || lower.includes("verific")) {
        if (nodeCount === 0) {
          return "Seu canvas está vazio. Arraste algumas máquinas do menu à esquerda para que eu possa analisar o fluxo.";
        }
        return `Analisando seu fluxo com ${nodeCount} máquina(s):\n\n${machineNames
          .map((n, i) => `${i + 1}. ${n}`)
          .join("\n")}\n\n⚠️ Pontos de atenção:\n• Verifique se a vazão de cada etapa é compatível.\n• Recomendo adicionar uma esteira de transição entre processos críticos.\n• Considere um sistema de inspeção visual antes do envase.`;
      }

      if (lower.includes("envase") || lower.includes("liquido") || lower.includes("líquido")) {
        return "Para uma linha de envase de líquidos, sugiro:\n\n1️⃣ Esteira transportadora inox\n2️⃣ Envasadora de líquidos (4 ou 6 bicos)\n3️⃣ Rosqueadora automática linear\n4️⃣ Rotuladora\n5️⃣ Datadora\n6️⃣ Encartuchadeira\n\nQuer que eu sugira modelos específicos do nosso catálogo?";
      }

      if (lower.includes("erro") || lower.includes("defeito") || lower.includes("problema")) {
        return "Os defeitos mais comuns em linhas industriais são:\n\n🔴 Desincronização de velocidade entre máquinas\n🔴 Falta de sensor de presença antes do envase\n🔴 Esteiras subdimensionadas para o pico de produção\n🔴 Ausência de inspeção visual após rotulagem\n\nMe diga qual etapa você quer otimizar e te ajudo a prevenir.";
      }

      if (lower.includes("oi") || lower.includes("olá") || lower.includes("ola")) {
        return "Olá! 👋 Posso te ajudar a montar uma linha do zero, sugerir máquinas, ou analisar o fluxo que você está criando. O que prefere?";
      }

      if (nodeCount > 0) {
        return `Vi que você já tem ${nodeCount} máquina(s) no canvas. Posso:\n\n• Analisar o fluxo atual\n• Sugerir a próxima etapa\n• Apontar possíveis gargalos\n\nO que prefere?`;
      }

      return "Entendi. Para começar, me conta um pouco mais sobre o produto que você quer envasar/produzir. Assim eu monto um fluxo otimizado pra você.";
    },
    [machineMap],
  );

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const userMsg: ChatMessage = { id: `m_${Date.now()}`, role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `m_${Date.now() + 1}`,
        role: "assistant",
        content: generateFagnerReply(text, nodes),
      };
      setChatMessages((prev) => [...prev, reply]);
      setChatLoading(false);
    }, 800);
  };

  const askFagnerToBuild = () => {
    setChatInput("Monte uma linha de envase de líquidos para mim");
  };

  return (
    <PageTransition>
      <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Workflow_Icon />
              <h1 className="font-display text-lg font-bold">Crie sua própria Linha</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:inline">
              {nodes.length} máquina(s) · {edges.length} conexão(ões)
            </span>
            <Button variant="outline" size="sm" onClick={clearCanvas} disabled={nodes.length === 0}>
              <Trash2 className="h-4 w-4 mr-1" /> Limpar
            </Button>
            <Button size="sm" onClick={() => toast.success("Fluxo salvo (mock)")}>
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* LEFT: Catalog */}
          {leftOpen && (
            <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card/30 flex flex-col">
              <div className="p-3 border-b border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-sm flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-primary" />
                    Catálogo de Máquinas
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setLeftOpen(false)}
                    title="Ocultar catálogo"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar máquina..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1.5">
                  {filteredMachines.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Nenhuma máquina encontrada
                    </p>
                  )}
                  {filteredMachines.map((m) => (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={(e) => handleSidebarDragStart(e, m.id)}
                      className="group cursor-grab active:cursor-grabbing rounded-md border border-border bg-card p-2.5 hover:border-primary/50 hover:bg-accent/30 transition-colors"
                      title="Arraste para o canvas"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                          <GripVertical className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            {m.model}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground text-center">
                  💡 Arraste para o canvas · duplo clique abre detalhes
                </p>
              </div>
            </aside>
          )}

          {/* CENTER: Canvas */}
          <main className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:24px_24px]">
            <div
              ref={canvasRef}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onPointerDown={handleCanvasPointerDown}
              onClick={handleCanvasClick}
              className={cn(
                "absolute inset-0",
                isPanActive && (isPanning ? "cursor-grabbing" : "cursor-grab"),
              )}
              style={{ touchAction: isPanActive ? "none" : undefined }}
            >
              {/* Zoom + pan content layer */}
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  // give the wrapper a huge logical size so nodes can sit anywhere
                  width: "10000px",
                  height: "10000px",
                  transition: isDragging || panDragRef.current ? "none" : "transform 120ms ease-out",
                  pointerEvents: isPanActive ? "none" : undefined,
                }}
              >
                {/* SVG layer for edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker
                      id="arrow"
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
                  {renderEdges()}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                  const machine = machineMap.get(node.machineId);
                  if (!machine) return null;
                  const isSelected = selectedNodeId === node.id;
                  const isConnectingSrc = connectingFrom === node.id;
                  const hue = hueFromId(machine.id);
                  const isThisDragging =
                    isDragging && draggingRef.current?.nodeId === node.id;
                  return (
                    <div
                      key={node.id}
                      id={`flow-node-${node.id}`}
                      style={{
                        left: 0,
                        top: 0,
                        width: NODE_W,
                        height: NODE_H,
                        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                        willChange: isThisDragging ? "transform" : undefined,
                        transition: isThisDragging ? "none" : "box-shadow 150ms, border-color 150ms",
                        touchAction: "none",
                        zIndex: isSelected || isThisDragging ? 30 : 10,
                      }}
                      onPointerDown={(e) => handleNodePointerDown(e, node)}
                      onClick={(e) => handleNodeClick(e, node.id)}
                      onDoubleClick={(e) => handleNodeDoubleClick(e, node.machineId)}
                      className={cn(
                        "absolute rounded-xl border-2 bg-card shadow-lg cursor-grab active:cursor-grabbing select-none overflow-hidden",
                        isSelected
                          ? "border-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)]"
                          : "border-border hover:border-primary/60",
                        isConnectingSrc && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      )}
                      title="Duplo clique para ver detalhes"
                    >
                      {/* "Photo" area — colored placeholder per machine */}
                      <div
                        className="relative h-[140px] w-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, hsl(${hue} 55% 22%) 0%, hsl(${(hue + 40) % 360} 60% 14%) 100%)`,
                        }}
                      >
                        <ImageIcon className="h-10 w-10 text-white/30" />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white/80 backdrop-blur-sm">
                          {machine.model}
                        </span>
                      </div>

                      {/* Name only */}
                      <div className="px-2.5 py-2 h-[60px] flex items-center">
                        <p className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight">
                          {machine.name}
                        </p>
                      </div>

                      {/* connection handle right */}
                      <button
                        onClick={(e) => startConnection(e, node.id)}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="Conectar a outra máquina"
                        className="absolute -right-2 top-[70px] h-4 w-4 rounded-full bg-primary border-2 border-background hover:scale-125 transition-transform z-10"
                      />
                      {/* input handle left */}
                      <div className="absolute -left-2 top-[70px] h-3 w-3 rounded-full bg-muted border-2 border-background" />

                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20"
                          title="Remover"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state — kept in screen space (not zoomed) */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center max-w-sm">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                      <Wand2 className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">
                      Comece arrastando máquinas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione equipamentos do catálogo à esquerda e solte aqui para montar sua
                      linha. Conecte as máquinas para definir o fluxo de produção.
                    </p>
                  </div>
                </div>
              )}

              {connectingFrom && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none z-40">
                  <Link2 className="h-3 w-3" />
                  Clique em uma máquina para conectar
                </div>
              )}
            </div>

            {/* Floating: reopen left panel */}
            {!leftOpen && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setLeftOpen(true)}
                title="Mostrar catálogo"
                className="absolute top-3 left-3 z-40 h-9 w-9 shadow-lg"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}

            {/* Floating: reopen right panel */}
            {!rightOpen && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setRightOpen(true)}
                title="Mostrar chat do Fagner"
                className="absolute top-3 right-3 z-40 h-9 w-9 shadow-lg"
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
            )}

            {/* Floating: zoom controls */}
            <div className="absolute bottom-4 right-4 z-40 flex flex-col items-center gap-1 rounded-lg border border-border bg-card/95 backdrop-blur shadow-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={zoomIn}
                disabled={zoom >= ZOOM_MAX}
                title="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <button
                onClick={zoomReset}
                className="text-[10px] font-mono text-muted-foreground hover:text-foreground px-1 py-0.5 rounded"
                title="Restaurar zoom (100%)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={zoomOut}
                disabled={zoom <= ZOOM_MIN}
                title="Diminuir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="h-px w-6 bg-border my-0.5" />
              <Button
                variant={panMode ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPanMode((v) => !v)}
                title="Mover tela (Espaço)"
              >
                <Hand className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={zoomReset}
                title="Resetar zoom e posição"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Pan-mode hint */}
            {isPanActive && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
                <Hand className="h-3 w-3" />
                Modo mover ativo {spaceHeld ? "(segurando Espaço)" : "— clique no botão para sair"}
              </div>
            )}
          </main>

          {/* RIGHT: Chat with Fagner */}
          {rightOpen && (
          <aside className="w-[340px] flex-shrink-0 border-l border-border bg-card/30 flex flex-col">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  Fagner
                  <Sparkles className="h-3 w-3 text-primary" />
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Especialista em linhas industriais
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setRightOpen(false)}
                title="Ocultar chat"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <AnimatePresence initial={false}>
                  {chatMessages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2",
                        m.role === "user" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center",
                          m.role === "user"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary/15 text-primary",
                        )}
                      >
                        {m.role === "user" ? (
                          <UserIcon className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-line max-w-[80%]",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatLoading && (
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2.5 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={askFagnerToBuild}
                  className="text-[10px] px-2 py-1 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
                >
                  Sugerir linha
                </button>
                <button
                  onClick={() => setChatInput("Analise meu fluxo atual")}
                  className="text-[10px] px-2 py-1 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
                >
                  Analisar fluxo
                </button>
                <button
                  onClick={() => setChatInput("Quais erros posso prevenir?")}
                  className="text-[10px] px-2 py-1 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors flex items-center gap-1"
                >
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Prevenir erros
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder="Pergunte ao Fagner..."
                  className="h-9 text-xs"
                  disabled={chatLoading}
                />
                <Button size="sm" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </aside>
          )}
        </div>
      </div>

      {/* Machine details modal (reused from Industrial Lines) */}
      <MachineDetailModal
        machine={openMachine}
        moduleName="Fluxo personalizado"
        open={!!openMachine}
        onClose={() => setOpenMachine(null)}
      />
    </PageTransition>
  );
};

const Workflow_Icon = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
    <Wand2 className="h-4 w-4" />
  </div>
);

export default CreateLine;
