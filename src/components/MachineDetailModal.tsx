import { useState, useRef } from "react";
import { X, Play, ChevronLeft, ChevronRight, Cog, Info, Image as ImageIcon, Video, Wrench, FileText, Download, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LineMachine } from "@/data/industrialLines";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface MachineDetailModalProps {
  machine: LineMachine | null;
  moduleName?: string;
  open: boolean;
  onClose: () => void;
}

const MachineDetailModal = ({ machine, moduleName, open, onClose }: MachineDetailModalProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"info" | "specs" | "usage">("info");
  const galleryRef = useRef<HTMLDivElement>(null);

  if (!machine) return null;

  const hasVideo = machine.youtubeUrl && machine.youtubeUrl.length > 0;
  const hasImages = machine.images && machine.images.length > 0;
  const hasSpecs = machine.specs && machine.specs.length > 0;
  const hasFeatures = machine.features && machine.features.length > 0;

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const scrollGallery = (direction: "left" | "right") => {
    if (!galleryRef.current) return;
    const scrollAmount = 220;
    galleryRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const tabs = [
    { id: "info" as const, label: "Informações", icon: Info },
    { id: "specs" as const, label: "Especificações", icon: Wrench },
    { id: "usage" as const, label: "Uso na Linha", icon: Cog },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-card border-border overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                {machine.model}
              </p>
              <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                {machine.name}
              </h2>
              {moduleName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {moduleName}
                </p>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* YouTube Video - Compact */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Vídeo
                </h3>
              </div>
              {hasVideo ? (
                <div className="relative w-full max-w-xl mx-auto aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
                  <iframe
                    src={getYoutubeEmbedUrl(machine.youtubeUrl!)}
                    title={`Vídeo - ${machine.name}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative w-full max-w-xl mx-auto aspect-video rounded-lg overflow-hidden bg-secondary/50 border border-border border-dashed flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Vídeo em breve</p>
                  </div>
                </div>
              )}
            </section>

            {/* Netflix-style Gallery */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Galeria de Imagens
                </h3>
              </div>
              {hasImages ? (
                <div className="relative group">
                  {/* Scroll buttons */}
                  <button
                    onClick={() => scrollGallery("left")}
                    className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-card to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </div>
                  </button>
                  <button
                    onClick={() => scrollGallery("right")}
                    className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-card to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </div>
                  </button>

                  {/* Scrollable row */}
                  <div
                    ref={galleryRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {machine.images!.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`shrink-0 snap-start rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                          i === activeImageIndex
                            ? "border-primary shadow-md shadow-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${machine.name} - Imagem ${i + 1}`}
                          className="w-[200px] h-[140px] object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <div className="shrink-0 w-[200px] h-[140px] rounded-lg bg-secondary/50 border border-border border-dashed flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-30" />
                      <p className="text-xs">Em breve</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected image preview */}
              {hasImages && (
                <div className="mt-3 relative w-full aspect-[16/9] max-w-xl mx-auto rounded-lg overflow-hidden bg-secondary border border-border">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={machine.images![activeImageIndex]}
                      alt={`${machine.name} - Imagem ${activeImageIndex + 1}`}
                      className="w-full h-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground">
                    {activeImageIndex + 1} / {machine.images!.length}
                  </div>
                </div>
              )}
            </section>

            {/* Manual / Documentation */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Manual da Máquina
                </h3>
              </div>
              {machine.manualUrl ? (
                <a
                  href={machine.manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Baixar Manual</p>
                    <p className="text-xs text-muted-foreground">PDF com especificações completas e instruções de operação</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border border-dashed bg-secondary/20">
                  <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                    <Upload className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Manual não disponível</p>
                    <p className="text-xs text-muted-foreground/70">O manual desta máquina será adicionado em breve</p>
                  </div>
                </div>
              )}
            </section>

            <Separator />

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "info" && (
                  <div className="space-y-4">
                    {machine.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {machine.description}
                        </p>
                      </div>
                    )}
                    {hasFeatures && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Características Principais</h4>
                        <ul className="space-y-1.5">
                          {machine.features!.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!machine.description && !hasFeatures && (
                      <p className="text-sm text-muted-foreground italic">Informações detalhadas em breve.</p>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div>
                    {hasSpecs ? (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-secondary/50">
                              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                                Especificação
                              </th>
                              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {machine.specs!.map((spec, i) => (
                              <tr
                                key={i}
                                className={`border-t border-border ${i % 2 === 0 ? "" : "bg-secondary/20"}`}
                              >
                                <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                                  {spec.label}
                                </td>
                                <td className="px-4 py-2.5 text-sm text-muted-foreground">
                                  {spec.value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Especificações técnicas em breve.</p>
                    )}
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Cog className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          Uso na Etapa da Linha
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {machine.usageInLine || "Informações sobre o uso desta máquina na etapa serão adicionadas em breve."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MachineDetailModal;
