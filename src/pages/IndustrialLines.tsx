import { useNavigate } from "react-router-dom";
import { industrialLines } from "@/data/industrialLines";
import { Layers3, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const IndustrialLines = () => {
  const navigate = useNavigate();

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

          <div className="flex items-center gap-3 mb-2">
            <Layers3 className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Linhas Industriais
            </h1>
          </div>
          <p className="text-muted-foreground">
            {industrialLines.length} linhas de produção completas
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industrialLines.map((line, i) => (
            <motion.button
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => navigate(`/linhas-industriais/${line.id}`)}
              className="category-card-glow group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={line.image}
                  alt={line.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
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
            </motion.button>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default IndustrialLines;
