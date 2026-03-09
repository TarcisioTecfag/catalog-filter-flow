import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { categories, machines } from "@/data/machines";
import MachineItem from "@/components/MachineItem";
import { ArrowLeft, Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageTransition from "@/components/PageTransition";

const CatalogMachines = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [search, setSearch] = useState("");
  const highlightRef = useRef<HTMLDivElement>(null);

  const category = categories.find((c) => c.id === categoryId);

  const filtered = useMemo(() => {
    const byCategory = machines.filter((m) => m.category === categoryId);
    if (!search.trim()) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q)
    );
  }, [categoryId, search]);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightId]);

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Categoria não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </button>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {category.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {filtered.length} equipamentos
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Adicionar Máquina
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modelo ou subcategoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((machine) => (
            <div
              key={machine.id}
              ref={machine.id === highlightId ? highlightRef : undefined}
              className={`rounded-lg transition-all duration-700 ${
                machine.id === highlightId
                  ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                  : ""
              }`}
            >
              <MachineItem machine={machine} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Filter className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma máquina encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogMachines;
