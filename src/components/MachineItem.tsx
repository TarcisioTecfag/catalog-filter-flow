import type { Machine } from "@/data/machines";
import { Wrench, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MachineItemProps {
  machine: Machine;
}

const MachineItem = ({ machine }: MachineItemProps) => {
  return (
    <div className="machine-card-hover rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {machine.subcategory}
          </span>
          <h3 className="font-display text-base font-semibold text-foreground">
            {machine.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-3.5 w-3.5" />
            <span>Modelo: {machine.model}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {machine.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button className="rounded-md p-2 hover:bg-accent hover:text-foreground transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button className="rounded-md p-2 hover:bg-destructive/20 hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <button className="rounded-md p-2 hover:bg-accent hover:text-foreground transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineItem;
