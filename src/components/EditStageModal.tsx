import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";
import type { LineModule } from "@/data/industrialLines";

interface EditStageModalProps {
  open: boolean;
  onClose: () => void;
  module?: LineModule | null;
  stageNumber?: number;
  onSave: (data: { id: string; title: string; description: string }) => void;
}

const EditStageModal = ({ open, onClose, module, stageNumber, onSave }: EditStageModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (module) {
      setTitle(module.title);
      setDescription(module.description);
    } else {
      setTitle(stageNumber ? `Módulo ${stageNumber} — ` : "");
      setDescription("");
    }
  }, [module, stageNumber, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    const id = module?.id || `stage-${Date.now()}`;
    onSave({ id, title: title.trim(), description: description.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">
            {module ? "Editar Etapa" : "Nova Etapa"}
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Módulo 1 — Preparo" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da etapa..." className="mt-1" rows={3} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1" disabled={!title.trim()}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageModal;
