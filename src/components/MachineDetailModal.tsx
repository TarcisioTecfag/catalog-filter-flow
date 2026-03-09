import { useState } from "react";
import { X, Play, ChevronLeft, ChevronRight, Cog, Info, Image as ImageIcon, Video, Wrench, ExternalLink } from "lucide-react";
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

  if (!machine) return null;

  const hasVideo = machine.youtubeUrl && machine.youtubeUrl.length > 0;
  const hasImages = machine.images && machine.images.length > 0;
  const hasSpecs = machine.specs && machine.specs.length > 0;
  const hasFeatures = machine.features && machine.features.length > 0;

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const tabs = [
    { id: "info" as const, label: "Informações", icon: Info },
    { id: "specs" as const, label: "Especificações", icon: Wrench },
    { id: "usage" as const, label: "Uso na Linha", icon: Cog },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 bg-card border-border overflow-hidden max-h-[90vh]">
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
            {/* YouTube Video */}
            {hasVideo && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Vídeo
                  </h3>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
                  <iframe
                    src={getYoutubeEmbedUrl(machine.youtubeUrl!)}
                    title={`Vídeo - ${machine.name}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Video placeholder when no video */}
            {!hasVideo && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Vídeo
                  </h3>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary/50 border border-border border-dashed flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Vídeo em breve</p>
                  </div>
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Galeria de Imagens
                </h3>
              </div>
              {hasImages ? (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-secondary border border-border">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        src={machine.images![activeImageIndex]}
                        alt={`${machine.name} - Imagem ${activeImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </AnimatePresence>
                    {machine.images!.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex((i) => (i - 1 + machine.images!.length) % machine.images!.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex((i) => (i + 1) % machine.images!.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {machine.images!.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {machine.images!.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                            i === activeImageIndex ? "border-primary" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img src={img} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-lg bg-secondary/50 border border-border border-dashed flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Imagens em breve</p>
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
