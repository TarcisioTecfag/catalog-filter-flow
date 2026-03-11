import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import type { LineMachine, MachineSpec } from "@/data/industrialLines";

interface EditMachineFormProps {
  machine: LineMachine;
  onSave: (machine: LineMachine) => void;
  onCancel: () => void;
}

const EditMachineForm = ({ machine, onSave, onCancel }: EditMachineFormProps) => {
  const [name, setName] = useState(machine.name);
  const [model, setModel] = useState(machine.model);
  const [description, setDescription] = useState(machine.description || "");
  const [youtubeUrl, setYoutubeUrl] = useState(machine.youtubeUrl || "");
  const [manualUrl, setManualUrl] = useState(machine.manualUrl || "");
  const [usageInLine, setUsageInLine] = useState(machine.usageInLine || "");
  const [features, setFeatures] = useState<string[]>(machine.features || []);
  const [specs, setSpecs] = useState<MachineSpec[]>(machine.specs || []);
  const [images, setImages] = useState<string[]>(machine.images || []);

  const handleSave = () => {
    if (!name.trim() || !model.trim()) return;
    onSave({
      name: name.trim(),
      model: model.trim(),
      description: description.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      manualUrl: manualUrl.trim() || undefined,
      usageInLine: usageInLine.trim() || undefined,
      features: features.filter((f) => f.trim()),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      images: images.filter((i) => i.trim()),
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modelo</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} className="mt-1" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL do Vídeo (YouTube)</label>
          <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL do Manual (PDF)</label>
          <Input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://..." className="mt-1" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uso na Linha</label>
        <Textarea value={usageInLine} onChange={(e) => setUsageInLine(e.target.value)} className="mt-1" rows={2} />
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Características</label>
          <Button variant="ghost" size="sm" onClick={() => setFeatures([...features, ""])} className="h-6 text-xs gap-1">
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="space-y-1.5">
          {features.map((f, i) => (
            <div key={i} className="flex gap-1.5">
              <Input value={f} onChange={(e) => { const u = [...features]; u[i] = e.target.value; setFeatures(u); }} className="h-8 text-sm" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => setFeatures(features.filter((_, j) => j !== i))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Especificações</label>
          <Button variant="ghost" size="sm" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="h-6 text-xs gap-1">
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="space-y-1.5">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-1.5">
              <Input placeholder="Label" value={s.label} onChange={(e) => { const u = [...specs]; u[i] = { ...u[i], label: e.target.value }; setSpecs(u); }} className="h-8 text-sm" />
              <Input placeholder="Valor" value={s.value} onChange={(e) => { const u = [...specs]; u[i] = { ...u[i], value: e.target.value }; setSpecs(u); }} className="h-8 text-sm" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URLs das Imagens</label>
          <Button variant="ghost" size="sm" onClick={() => setImages([...images, ""])} className="h-6 text-xs gap-1">
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="space-y-1.5">
          {images.map((img, i) => (
            <div key={i} className="flex gap-1.5">
              <Input value={img} onChange={(e) => { const u = [...images]; u[i] = e.target.value; setImages(u); }} placeholder="https://..." className="h-8 text-sm" />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => setImages(images.filter((_, j) => j !== i))}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={handleSave} className="flex-1 gap-1.5" disabled={!name.trim() || !model.trim()}>
          <Save className="h-3.5 w-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
};

export default EditMachineForm;
