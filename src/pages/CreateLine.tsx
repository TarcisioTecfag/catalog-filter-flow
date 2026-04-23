import { useState, useRef, useMemo, useCallback, DragEvent, MouseEvent } from "react";
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
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories, machines, type Machine } from "@/data/machines";
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

const NODE_W = 200;
const NODE_H = 88;

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
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    const x = e.clientX - rect.left - NODE_W / 2;
    const y = e.clientY - rect.top - NODE_H / 2;
    const newNode: FlowNode = {
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      machineId,
      x: Math.max(10, x),
      y: Math.max(10, y),
    };
    setNodes((prev) => [...prev, newNode]);
    toast.success("Máquina adicionada ao fluxo");
  };

  // ===== Move existing node =====
  const handleNodeMouseDown = (e: MouseEvent<HTMLDivElement>, node: FlowNode) => {
    if (connectingFrom) return; // don't drag while connecting
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    });
    setSelectedNodeId(node.id);
  };

  const handleCanvasMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!draggingNodeId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeId
          ? { ...n, x: Math.max(0, Math.min(rect.width - NODE_W, newX)), y: Math.max(0, Math.min(rect.height - NODE_H, newY)) }
          : n,
      ),
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

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
      // create edge if not exists
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
      const x1 = src.x + NODE_W;
      const y1 = src.y + NODE_H / 2;
      const x2 = tgt.x;
      const y2 = tgt.y + NODE_H / 2;
      const dx = Math.abs(x2 - x1) * 0.5;
      const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      return (
        <g key={edge.id}>
          <path
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

  // ===== Chat with Fagner (mock) =====
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
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      role: "user",
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    // simulate Fagner thinking
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

        {/* Main 3-column layout */}
        <div className="flex-1 flex min-h-0">
          {/* LEFT: Catalog */}
          <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card/30 flex flex-col">
            <div className="p-3 border-b border-border space-y-2">
              <h2 className="font-display font-semibold text-sm flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-primary" />
                Catálogo de Máquinas
              </h2>
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
                💡 Arraste para o canvas
              </p>
            </div>
          </aside>

          {/* CENTER: Canvas */}
          <main className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:24px_24px]">
            <div
              ref={canvasRef}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onClick={handleCanvasClick}
              className="absolute inset-0"
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

              {/* Empty state */}
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

              {/* Nodes */}
              {nodes.map((node) => {
                const machine = machineMap.get(node.machineId);
                if (!machine) return null;
                const isSelected = selectedNodeId === node.id;
                const isConnectingSrc = connectingFrom === node.id;
                return (
                  <div
                    key={node.id}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_W,
                      height: NODE_H,
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    className={cn(
                      "absolute rounded-lg border-2 bg-card shadow-lg cursor-move select-none transition-all",
                      isSelected
                        ? "border-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]"
                        : "border-border hover:border-primary/50",
                      isConnectingSrc && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    <div className="p-2.5 h-full flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight">
                          {machine.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                          {machine.model}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground truncate">
                          {machine.subcategory}
                        </span>
                      </div>
                    </div>
                    {/* connection handle right */}
                    <button
                      onClick={(e) => startConnection(e, node.id)}
                      onMouseDown={(e) => e.stopPropagation()}
                      title="Conectar a outra máquina"
                      className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-2 border-background hover:scale-125 transition-transform"
                    />
                    {/* input handle left */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-muted border-2 border-background" />

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                        title="Remover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {connectingFrom && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
                  <Link2 className="h-3 w-3" />
                  Clique em uma máquina para conectar
                </div>
              )}
            </div>
          </main>

          {/* RIGHT: Chat with Fagner */}
          <aside className="w-[340px] flex-shrink-0 border-l border-border bg-card/30 flex flex-col">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
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
        </div>
      </div>
    </PageTransition>
  );
};

const Workflow_Icon = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
    <Wand2 className="h-4 w-4" />
  </div>
);

export default CreateLine;
