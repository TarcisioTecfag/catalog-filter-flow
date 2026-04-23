import { useNavigate } from "react-router-dom";
import { Settings2, Layers3, Workflow, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  const navigate = useNavigate();

  const cards = [
    {
      icon: Settings2,
      title: "Máquinas no Geral",
      description:
        "Explore todas as máquinas organizadas por categorias individuais. Ideal para buscar equipamentos específicos.",
      cta: "Explorar categorias",
      route: "/catalogo",
    },
    {
      icon: Workflow,
      title: "Crie sua própria Linha",
      description:
        "Monte fluxos visuais arrastando máquinas do nosso catálogo. Conecte etapas e converse com Fagner para criar a linha ideal.",
      cta: "Começar a criar",
      route: "/criar-linha",
      highlight: true,
    },
    {
      icon: Layers3,
      title: "Linhas Industriais",
      description:
        "Veja linhas de produção completas com todas as etapas e máquinas integradas. Ideal para projetos turnkey.",
      cta: "Ver linhas completas",
      route: "/linhas-industriais",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="mx-auto max-w-7xl w-full py-16">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.route}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  onClick={() => navigate(card.route)}
                  className={`group relative overflow-hidden rounded-xl border bg-card p-8 text-left transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)] ${
                    card.highlight
                      ? "border-primary/40 shadow-[0_0_30px_-15px_hsl(var(--primary)/0.5)] hover:border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {card.highlight && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/30">
                        Novo
                      </span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground mb-8 leading-relaxed text-sm lg:text-base">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      <span>{card.cta}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
