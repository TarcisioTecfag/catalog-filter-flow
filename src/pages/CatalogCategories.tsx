import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { categories, machines } from "@/data/machines";
import CategoryCard from "@/components/CategoryCard";
import MachineItem from "@/components/MachineItem";
import { Settings, FolderOpen, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

const CatalogCategories = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const totalMachines = categories.reduce((sum, c) => sum + c.machineCount, 0);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return machines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  const isSearching = search.trim().length > 0;

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao menu
        </button>
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="h-8 w-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Catálogo de Máquinas
              </h1>
            </div>
            <p className="text-muted-foreground">
              {totalMachines} equipamentos em {categories.length} categorias
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Settings className="h-4 w-4" />
            Gerenciar Tags
          </button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar máquinas em todas as categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {isSearching ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
            </p>
            {searchResults.map((machine) => (
              <div
                key={machine.id}
                className="cursor-pointer"
                onClick={() => navigate(`/catalogo/${machine.category}?highlight=${machine.id}`)}
              >
                <MachineItem machine={machine} />
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhuma máquina encontrada.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
};

export default CatalogCategories;
