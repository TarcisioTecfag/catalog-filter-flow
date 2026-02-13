import { useNavigate } from "react-router-dom";
import type { Category } from "@/data/machines";
import { Folder } from "lucide-react";

import imgSeladoras from "@/assets/category-seladoras.jpg";
import imgEnvasadoras from "@/assets/category-envasadoras.jpg";
import imgFechadoras from "@/assets/category-fechadoras.jpg";
import imgRosqueadoras from "@/assets/category-rosqueadoras.jpg";
import imgEsteiras from "@/assets/category-esteiras.jpg";
import imgAbastecedorAutomatico from "@/assets/category-abastecedor-automatico.jpg";
import imgAlimentadoresParafuso from "@/assets/category-alimentadores-parafuso.jpg";
import imgAplicadorStretch from "@/assets/category-aplicador-stretch.jpg";
import imgArqueadoras from "@/assets/category-arqueadoras.jpg";
import imgDatadoras from "@/assets/category-datadoras.jpg";
import imgDispensadoresFita from "@/assets/category-dispensadores-fita.jpg";
import imgDosadoras from "@/assets/category-dosadoras.jpg";
import imgEmpacotadoras from "@/assets/category-empacotadoras.jpg";
import imgEncapsuladoras from "@/assets/category-encapsuladoras.jpg";
import imgEncartuchadeira from "@/assets/category-encartuchadeira.jpg";
import imgSeladorasCaixa from "@/assets/category-seladoras-caixa.jpg";
import imgMixersRotativos from "@/assets/category-mixers-rotativos.jpg";
import imgMoinhosTrituradores from "@/assets/category-moinhos-trituradores.jpg";
import imgMontadoras from "@/assets/category-montadoras.jpg";
import imgPrensasRotativas from "@/assets/category-prensas-rotativas.jpg";
import imgRotuladoras from "@/assets/category-rotuladoras.jpg";
import imgTanquesEncolhimento from "@/assets/category-tanques-encolhimento.jpg";
import imgTermoformadoras from "@/assets/category-termoformadoras.jpg";
import imgTuneisEncolhimento from "@/assets/category-tuneis-encolhimento.jpg";

const imageMap: Record<string, string> = {
  seladoras: imgSeladoras,
  envasadoras: imgEnvasadoras,
  fechadoras: imgFechadoras,
  rosqueadoras: imgRosqueadoras,
  esteiras: imgEsteiras,
  "abastecedor-automatico": imgAbastecedorAutomatico,
  "alimentadores-parafuso": imgAlimentadoresParafuso,
  "aplicador-stretch": imgAplicadorStretch,
  arqueadoras: imgArqueadoras,
  datadoras: imgDatadoras,
  "dispensadores-fita": imgDispensadoresFita,
  dosadoras: imgDosadoras,
  empacotadoras: imgEmpacotadoras,
  encapsuladoras: imgEncapsuladoras,
  encartuchadeira: imgEncartuchadeira,
  "seladoras-caixa": imgSeladorasCaixa,
  "mixers-rotativos": imgMixersRotativos,
  "moinhos-trituradores": imgMoinhosTrituradores,
  montadoras: imgMontadoras,
  "prensas-rotativas": imgPrensasRotativas,
  rotuladoras: imgRotuladoras,
  "tanques-encolhimento": imgTanquesEncolhimento,
  termoformadoras: imgTermoformadoras,
  "tuneis-encolhimento": imgTuneisEncolhimento,
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

const CategoryCard = ({ category, index }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/catalogo/${category.id}`)}
      className="category-card-glow group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageMap[category.image]}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {category.machineCount} máquinas
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      </div>
    </button>
  );
};

export default CategoryCard;
