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
  { id: "esteiras", name: "Esteira Transportadora", description: "Esteiras transportadoras e sistemas de transporte", machineCount: 149, image: "esteiras" },
  { id: "seladoras", name: "Seladoras", description: "Seladoras de caixas, bandejas e embalagens", machineCount: 84, image: "seladoras" },
  { id: "abastecedor-automatico", name: "Abastecedor Automático", description: "Abastecedores automáticos para linhas de produção", machineCount: 12, image: "abastecedor-automatico" },
  { id: "alimentadores-parafuso", name: "Alimentadores de Parafuso", description: "Alimentadores de parafuso para dosagem e transporte", machineCount: 8, image: "alimentadores-parafuso" },
  { id: "aplicador-stretch", name: "Aplicador de Stretch", description: "Aplicadores de filme stretch para paletização", machineCount: 15, image: "aplicador-stretch" },
  { id: "arqueadoras", name: "Arqueadoras", description: "Arqueadoras automáticas e semi-automáticas", machineCount: 22, image: "arqueadoras" },
  { id: "datadoras", name: "Datadoras", description: "Datadoras e codificadoras de embalagens", machineCount: 31, image: "datadoras" },
  { id: "dispensadores-fita", name: "Dispensadores de Fita", description: "Dispensadores de fita adesiva para embalagens", machineCount: 18, image: "dispensadores-fita" },
  { id: "dosadoras", name: "Dosadoras", description: "Dosadoras de líquidos, pós e granulados", machineCount: 27, image: "dosadoras" },
  { id: "empacotadoras", name: "Empacotadoras", description: "Empacotadoras automáticas e semi-automáticas", machineCount: 35, image: "empacotadoras" },
  { id: "encapsuladoras", name: "Encapsuladoras", description: "Encapsuladoras para cápsulas e comprimidos", machineCount: 14, image: "encapsuladoras" },
  { id: "encartuchadeira", name: "Encartuchadeira Rotativa", description: "Encartuchadeiras rotativas para embalagens", machineCount: 9, image: "encartuchadeira" },
  { id: "envasadoras", name: "Envasadoras", description: "Envasadoras de líquidos, pastosos e granulados", machineCount: 62, image: "envasadoras" },
  { id: "fechadoras", name: "Fechadoras", description: "Fechadoras de tampas, lacres e cápsulas", machineCount: 47, image: "fechadoras" },
  { id: "seladoras-caixa", name: "Seladoras de Caixa", description: "Seladoras específicas para caixas de papelão", machineCount: 29, image: "seladoras-caixa" },
  { id: "mixers-rotativos", name: "Mixers Rotativos", description: "Mixers rotativos para mistura industrial", machineCount: 11, image: "mixers-rotativos" },
  { id: "moinhos-trituradores", name: "Moinhos Trituradores", description: "Moinhos e trituradores industriais", machineCount: 16, image: "moinhos-trituradores" },
  { id: "montadoras", name: "Montadoras", description: "Montadoras de caixas e embalagens", machineCount: 20, image: "montadoras" },
  { id: "prensas-rotativas", name: "Prensas Rotativas", description: "Prensas rotativas para compactação e moldagem", machineCount: 13, image: "prensas-rotativas" },
  { id: "rosqueadoras", name: "Rosqueadoras", description: "Rosqueadoras automáticas e semi-automáticas", machineCount: 38, image: "rosqueadoras" },
  { id: "rotuladoras", name: "Rotuladoras", description: "Rotuladoras automáticas para garrafas e frascos", machineCount: 24, image: "rotuladoras" },
  { id: "tanques-encolhimento", name: "Tanques de Encolhimento", description: "Tanques de encolhimento térmico para embalagens", machineCount: 10, image: "tanques-encolhimento" },
  { id: "termoformadoras", name: "Termoformadoras", description: "Termoformadoras para embalagens plásticas", machineCount: 19, image: "termoformadoras" },
  { id: "tuneis-encolhimento", name: "Túneis de Encolhimento", description: "Túneis de encolhimento térmico para embalagens", machineCount: 17, image: "tuneis-encolhimento" },
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
