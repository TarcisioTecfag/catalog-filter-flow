export interface Category {
  id: string;
  name: string;
  description: string;
  machineCount: number;
  image: string;
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  category: string;
  subcategory: string;
  tags: string[];
}

export const categories: Category[] = [
  { id: "seladoras", name: "Seladoras", description: "Seladoras de caixas, bandejas e embalagens", machineCount: 84, image: "seladoras" },
  { id: "envasadoras", name: "Envasadoras", description: "Envasadoras de líquidos, pastosos e granulados", machineCount: 62, image: "envasadoras" },
  { id: "fechadoras", name: "Fechadoras", description: "Fechadoras de tampas, lacres e capsulas", machineCount: 47, image: "fechadoras" },
  { id: "rosqueadoras", name: "Rosqueadoras", description: "Rosqueadoras automáticas e semi-automáticas", machineCount: 38, image: "rosqueadoras" },
  { id: "esteiras", name: "Esteiras", description: "Esteiras transportadoras e sistemas de transporte", machineCount: 149, image: "esteiras" },
];

export const machines: Machine[] = [
  { id: "1", name: "PAGINADORA ROTATIVA EM ACO INOX", model: "PAMQIPAU007", category: "esteiras", subcategory: "Esteiras Transportadoras", tags: ["aço inox", "rotativa"] },
  { id: "2", name: "FXJ4030 - SELADORA SEMI-AUTOMAT.", model: "PAMQCCSA030", category: "seladoras", subcategory: "Seladoras de Caixas", tags: ["semi-automática"] },
  { id: "3", name: "FXJ4030 - SELADORA SEMI-AUTOMAT. C/ PROTECAO", model: "PAMQCCSA048", category: "seladoras", subcategory: "Seladoras de Caixas", tags: ["semi-automática", "proteção"] },
  { id: "4", name: "ENVASADORA LÍQUIDOS 4 BICOS", model: "PAMQENV004", category: "envasadoras", subcategory: "Envasadoras de Líquidos", tags: ["4 bicos", "líquidos"] },
  { id: "5", name: "ENVASADORA PASTOSOS PISTÃO", model: "PAMQENV012", category: "envasadoras", subcategory: "Envasadoras de Pastosos", tags: ["pistão", "pastosos"] },
  { id: "6", name: "FECHADORA DE TAMPAS PRESS-ON", model: "PAMQFCH001", category: "fechadoras", subcategory: "Fechadoras de Tampas", tags: ["press-on"] },
  { id: "7", name: "FECHADORA INDUÇÃO AUTOMÁTICA", model: "PAMQFCH015", category: "fechadoras", subcategory: "Fechadoras de Tampas", tags: ["indução", "automática"] },
  { id: "8", name: "ROSQUEADORA AUTOMÁTICA LINEAR", model: "PAMQRSQ001", category: "rosqueadoras", subcategory: "Rosqueadoras Automáticas", tags: ["linear", "automática"] },
  { id: "9", name: "ROSQUEADORA SEMI-AUTOMÁTICA DE MESA", model: "PAMQRSQ008", category: "rosqueadoras", subcategory: "Rosqueadoras Semi-Automáticas", tags: ["mesa", "semi-automática"] },
  { id: "10", name: "ESTEIRA TRANSPORTADORA INOX 3M", model: "PAMQEST003", category: "esteiras", subcategory: "Esteiras Transportadoras", tags: ["inox", "3 metros"] },
  { id: "11", name: "ESTEIRA MODULAR CURVA 90°", model: "PAMQEST022", category: "esteiras", subcategory: "Esteiras Transportadoras", tags: ["modular", "curva"] },
  { id: "12", name: "SELADORA DE BANDEJAS AUTOMÁTICA", model: "PAMQCSB010", category: "seladoras", subcategory: "Seladoras de Bandejas", tags: ["automática", "bandejas"] },
];
