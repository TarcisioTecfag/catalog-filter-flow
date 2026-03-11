import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIndustrialLines } from "@/contexts/IndustrialLinesContext";
import { useAdmin } from "@/contexts/AdminContext";
import type { LineMachine } from "@/data/industrialLines";
import { ArrowLeft, ChevronRight, Layers3, Cog, Plus, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import MachineDetailModal from "@/components/MachineDetailModal";
import EditStageModal from "@/components/EditStageModal";
import NotFound from "./NotFound";

const LineDetail = () => {
  const { lineId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { lines, addModule, updateModule, deleteModule, addMachine, deleteMachine } = useIndustrialLines();

  const line = lines.find((l) => l.id === lineId);
  const [activeIndex, setActiveIndex] = useState<number>(Math.floor((line?.modules.length ?? 0) / 2));
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<LineMachine | null>(null);
  const [selectedModuleName, setSelectedModuleName] = useState<string>("");
  const [selectedMachineIndex, setSelectedMachineIndex] = useState<number>(-1);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  // Stage editing
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<typeof line extends undefined ? never : NonNullable<typeof line>["modules"][0] | null>(null);

  if (!line) return <NotFound />;

  const modules = line.modules;

  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    const isActive = index === activeIndex;
    const rotation = offset * 8;
    const translateX = offset * 120;
    const translateY = Math.abs(offset) * 15;
    const scale = isActive ? 1.05 : 0.9 - Math.abs(offset) * 0.03;
    const zIndex = isActive ? 50 : 40 - Math.abs(offset);
    const opacity = Math.abs(offset) > 2 ? 0.5 : 1;
    return { rotation, translateX, translateY, scale, zIndex, opacity };
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      setExpandedModule(expandedModule === modules[index].id ? null : modules[index].id);
    } else {
      setActiveIndex(index);
      setExpandedModule(null);
    }
  };

  const handleMachineClick = (machine: LineMachine, moduleName: string, moduleId: string, machineIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMachine(machine);
    setSelectedModuleName(moduleName);
    setSelectedMachineIndex(machineIdx);
    setSelectedModuleId(moduleId);
  };

  const handleSaveStage = (data: { id: string; title: string; description: string }) => {
    if (editingModule) {
      updateModule(line.id, editingModule.id, { title: data.title, description: data.description });
    } else {
      addModule(line.id, { id: data.id, title: data.title, description: data.description, machines: [] });
    }
  };

  const handleAddMachine = (moduleId: string) => {
    const newMachine: LineMachine = { name: "Nova Máquina", model: "MODELO" };
    addMachine(line.id, moduleId, newMachine);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/linhas-industriais")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar às linhas
            </button>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Layers3 className="h-8 w-8 text-primary" />
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    {line.name}
                  </h1>
                </div>
                <p className="text-muted-foreground">{line.description}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => { setEditingModule(null); setStageModalOpen(true); }}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Nova Etapa
                </button>
              )}
            </div>
          </div>

          {/* Fan-out Cards - Desktop */}
          <div className="hidden md:flex items-center justify-center min-h-[500px] relative">
            {modules.map((module, index) => {
              const style = getCardStyle(index);
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={module.id}
                  className="absolute cursor-pointer"
                  initial={false}
                  animate={{
                    rotateZ: style.rotation,
                    x: style.translateX,
                    y: style.translateY,
                    scale: style.scale,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
                  onClick={() => handleCardClick(index)}
                  whileHover={!isActive ? { scale: style.scale + 0.05, y: style.translateY - 10 } : {}}
                >
                  <div
                    className={`w-[280px] rounded-xl border bg-card overflow-hidden transition-all duration-300 ${
                      isActive
                        ? "border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)]"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`p-5 ${isActive ? "bg-primary/5" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                            {index + 1}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Etapa {index + 1}
                          </span>
                        </div>
                        {isAdmin && isActive && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingModule(module); setStageModalOpen(true); }}
                              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm("Excluir esta etapa?")) deleteModule(line.id, module.id); }}
                              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <h3 className={`font-display text-base font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                        {module.title.replace(/^Módulo \d+ — /, "")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border">
                            <div className="flex items-center justify-between mt-4 mb-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {module.machines.length} máquinas neste módulo
                              </p>
                              {isAdmin && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddMachine(module.id); }}
                                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                  <Plus className="h-3 w-3" /> Máquina
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {module.machines.map((machine, mi) => (
                                <motion.div
                                  key={mi}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: mi * 0.05 }}
                                  className="flex items-center gap-1"
                                >
                                  <button
                                    onClick={(e) => handleMachineClick(machine, module.title, module.id, mi, e)}
                                    className="flex-1 flex items-start gap-2 rounded-lg bg-secondary/50 p-2.5 text-left hover:bg-secondary/80 hover:border-primary/30 border border-transparent transition-all group/machine"
                                  >
                                    <Cog className="h-4 w-4 text-primary mt-0.5 shrink-0 group-hover/machine:animate-spin" style={{ animationDuration: '2s' }} />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground leading-tight group-hover/machine:text-primary transition-colors">
                                        {machine.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{machine.model}</p>
                                    </div>
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0 group-hover/machine:text-primary transition-colors" />
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); if (confirm("Excluir máquina?")) deleteMachine(line.id, module.id, mi); }}
                                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation dots - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-2 mt-6">
            {modules.map((_, index) => (
              <button
                key={index}
                onClick={() => { setActiveIndex(index); setExpandedModule(null); }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-8 bg-primary" : "w-2.5 bg-secondary hover:bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Mobile - Horizontal scroll with snap */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="snap-center shrink-0 w-[85vw] max-w-[320px]"
                >
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-5 bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
                            {index + 1}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Etapa {index + 1}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingModule(module); setStageModalOpen(true); }} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { if (confirm("Excluir?")) deleteModule(line.id, module.id); }} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <h3 className="font-display text-base font-semibold text-primary">
                        {module.title.replace(/^Módulo \d+ — /, "")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>

                    <div className="px-5 pb-5 border-t border-border">
                      <div className="flex items-center justify-between mt-4 mb-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {module.machines.length} máquinas
                        </p>
                        {isAdmin && (
                          <button onClick={() => handleAddMachine(module.id)} className="flex items-center gap-1 text-xs text-primary font-medium">
                            <Plus className="h-3 w-3" /> Máquina
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {module.machines.map((machine, mi) => (
                          <div key={mi} className="flex items-center gap-1">
                            <button
                              onClick={() => handleMachineClick(machine, module.title, module.id, mi, { stopPropagation: () => {} } as React.MouseEvent)}
                              className="flex-1 flex items-start gap-2 rounded-lg bg-secondary/50 p-2.5 text-left hover:bg-secondary/80 transition-all group/machine"
                            >
                              <Cog className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground leading-tight group-hover/machine:text-primary transition-colors">
                                  {machine.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{machine.model}</p>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                            </button>
                            {isAdmin && (
                              <button onClick={() => { if (confirm("Excluir?")) deleteMachine(line.id, module.id, mi); }} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Flow diagram below fan */}
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              Fluxo da Linha
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {modules.map((module, index) => (
                <div key={module.id} className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveIndex(index); setExpandedModule(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      index === activeIndex
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {module.title.replace(/^Módulo \d+ — /, "")}
                  </button>
                  {index < modules.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Machine Detail Modal */}
        <MachineDetailModal
          machine={selectedMachine}
          moduleName={selectedModuleName}
          open={!!selectedMachine}
          onClose={() => setSelectedMachine(null)}
          lineId={line.id}
          moduleId={selectedModuleId}
          machineIndex={selectedMachineIndex}
        />

        {/* Stage Edit Modal */}
        <EditStageModal
          open={stageModalOpen}
          onClose={() => { setStageModalOpen(false); setEditingModule(null); }}
          module={editingModule}
          stageNumber={modules.length + 1}
          onSave={handleSaveStage}
        />
      </div>
    </PageTransition>
  );
};

export default LineDetail;
