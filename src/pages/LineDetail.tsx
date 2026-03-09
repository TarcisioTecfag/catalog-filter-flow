import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { industrialLines } from "@/data/industrialLines";
import { ArrowLeft, ChevronRight, Layers3, Cog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "./NotFound";

const LineDetail = () => {
  const { lineId } = useParams();
  const navigate = useNavigate();
  const line = industrialLines.find((l) => l.id === lineId);
  const [activeIndex, setActiveIndex] = useState<number>(Math.floor((line?.modules.length ?? 0) / 2));
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  if (!line) return <NotFound />;

  const modules = line.modules;
  const centerIndex = Math.floor(modules.length / 2);

  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    const isActive = index === activeIndex;

    // Fan-out positions
    const rotation = offset * 8;
    const translateX = offset * 120;
    const translateY = Math.abs(offset) * 15;
    const scale = isActive ? 1.05 : 0.9 - Math.abs(offset) * 0.03;
    const zIndex = isActive ? 50 : 40 - Math.abs(offset);
    const opacity = Math.abs(offset) > 2 ? 0.5 : 1;

    return {
      rotation,
      translateX,
      translateY,
      scale,
      zIndex,
      opacity,
    };
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      setExpandedModule(expandedModule === modules[index].id ? null : modules[index].id);
    } else {
      setActiveIndex(index);
      setExpandedModule(null);
    }
  };

  return (
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
          <div className="flex items-center gap-3 mb-2">
            <Layers3 className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              {line.name}
            </h1>
          </div>
          <p className="text-muted-foreground">{line.description}</p>
        </div>

        {/* Fan-out Cards - Desktop */}
        <div className="hidden md:flex items-center justify-center min-h-[500px] relative">
          {modules.map((module, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;
            const isExpanded = expandedModule === module.id;

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
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  mass: 0.8,
                }}
                onClick={() => handleCardClick(index)}
                whileHover={!isActive ? { scale: style.scale + 0.05, y: style.translateY - 10 } : {}}
              >
                <div
                  className={`
                    w-[280px] rounded-xl border bg-card overflow-hidden
                    transition-all duration-300
                    ${isActive 
                      ? "border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)]" 
                      : "border-border hover:border-primary/30"
                    }
                  `}
                >
                  {/* Card Header */}
                  <div className={`p-5 ${isActive ? "bg-primary/5" : ""}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {index + 1}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Etapa {index + 1}
                      </span>
                    </div>
                    <h3 className={`font-display text-base font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {module.title.replace(/^Módulo \d+ — /, "")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.description}
                    </p>
                  </div>

                  {/* Machine List - Shows when active */}
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
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-3">
                            {module.machines.length} máquinas neste módulo
                          </p>
                          <div className="space-y-2">
                            {module.machines.map((machine, mi) => (
                              <motion.div
                                key={mi}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: mi * 0.05 }}
                                className="flex items-start gap-2 rounded-lg bg-secondary/50 p-2.5"
                              >
                                <Cog className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-foreground leading-tight">
                                    {machine.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {machine.model}
                                  </p>
                                </div>
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
                index === activeIndex
                  ? "w-8 bg-primary"
                  : "w-2.5 bg-secondary hover:bg-muted-foreground/30"
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
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
                        {index + 1}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Etapa {index + 1}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-primary">
                      {module.title.replace(/^Módulo \d+ — /, "")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.description}
                    </p>
                  </div>

                  <div className="px-5 pb-5 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-3">
                      {module.machines.length} máquinas
                    </p>
                    <div className="space-y-2">
                      {module.machines.map((machine, mi) => (
                        <div
                          key={mi}
                          className="flex items-start gap-2 rounded-lg bg-secondary/50 p-2.5"
                        >
                          <Cog className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground leading-tight">
                              {machine.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {machine.model}
                            </p>
                          </div>
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
                  className={`
                    rounded-lg border px-4 py-2.5 text-sm font-medium transition-all
                    ${index === activeIndex
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }
                  `}
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
    </div>
  );
};

export default LineDetail;
