import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Layers3 } from "lucide-react";
import type { IndustrialLine } from "@/data/industrialLines";

interface EditLineModalProps {
  open: boolean;
  onClose: () => void;
  line?: IndustrialLine | null;
  onSave: (data: { id: string; name: string; description: string; image: string }) => void;
}

const EditLineModal = ({ open, onClose, line, onSave }: EditLineModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (line) {
      setName(line.name);
      setDescription(line.description);
      setImage(line.image);
    } else {
      setName("");
      setDescription("");
      setImage("");
    }
  }, [line, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    const id = line?.id || `linha-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    onSave({ id, name: name.trim(), description: description.trim(), image: image.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers3 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">
            {line ? "Editar Linha" : "Nova Linha Industrial"}
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Linha de Goma" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da linha..." className="mt-1" rows={3} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL da Imagem</label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1" disabled={!name.trim()}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLineModal;
