import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIndustrialLines } from "@/contexts/IndustrialLinesContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Layers3, ArrowLeft, ArrowRight, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import EditLineModal from "@/components/EditLineModal";
import type { IndustrialLine } from "@/data/industrialLines";

const IndustrialLines = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { lines, addLine, updateLine, deleteLine } = useIndustrialLines();
  const [editingLine, setEditingLine] = useState<IndustrialLine | null>(null);
  const [showNewLine, setShowNewLine] = useState(false);

  const handleSaveLine = (data: { id: string; name: string; description: string; image: string }) => {
    if (editingLine) {
      updateLine(editingLine.id, { name: data.name, description: data.description, image: data.image });
    } else {
      addLine({ ...data, modules: [] });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao menu
            </button>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Layers3 className="h-8 w-8 text-primary" />
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    Linhas Industriais
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  {lines.length} linhas de produção completas
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowNewLine(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Nova Linha
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((line, i) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative group"
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingLine(line); }}
                      className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary border border-border transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm("Excluir esta linha?")) deleteLine(line.id); }}
                      className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-destructive border border-border transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/linhas-industriais/${line.id}`)}
                  className="category-card-glow w-full flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left"
                >
                  <div className="relative h-48 overflow-hidden">
                    {line.image ? (
                      <img src={line.image} alt={line.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-secondary flex items-center justify-center">
                        <Layers3 className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <Layers3 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {line.modules.length} módulos
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {line.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">
                      {line.description}
                    </p>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium mt-3">
                      <span>Ver etapas</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <EditLineModal
        open={showNewLine || !!editingLine}
        onClose={() => { setShowNewLine(false); setEditingLine(null); }}
        line={editingLine}
        onSave={handleSaveLine}
      />
    </PageTransition>
  );
};

export default IndustrialLines;
