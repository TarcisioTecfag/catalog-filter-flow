import { categories } from "@/data/machines";
import CategoryCard from "@/components/CategoryCard";
import { Settings, FolderOpen } from "lucide-react";

const CatalogCategories = () => {
  const totalMachines = categories.reduce((sum, c) => sum + c.machineCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogCategories;
