import { useNavigate } from "react-router-dom";
import { Settings2, Layers3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="mx-auto max-w-5xl w-full py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Catálogo <span className="text-primary">Tec I.A</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione como deseja explorar nossos equipamentos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/catalogo")}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-10 text-left transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings2 className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Máquinas no Geral
                </h2>
              </div>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Explore todas as máquinas organizadas por categorias individuais. Ideal para buscar equipamentos específicos.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span>Explorar categorias</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => navigate("/linhas-industriais")}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-10 text-left transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers3 className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Linhas Industriais
                </h2>
              </div>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Veja linhas de produção completas com todas as etapas e máquinas integradas. Ideal para projetos turnkey.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span>Ver linhas completas</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Index;
