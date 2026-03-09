import imgGoma from "@/assets/line-goma.jpg";
import imgSoftgel from "@/assets/line-softgel.jpg";
import imgEncapsulados from "@/assets/line-encapsulados.jpg";
import imgEnvasePastosos from "@/assets/line-envase-pastosos.jpg";
import imgComprimidos from "@/assets/line-comprimidos.jpg";
import imgEnvaseLiquidosLata from "@/assets/line-envase-liquidos-lata.jpg";

export interface LineModule {
  id: string;
  title: string;
  description: string;
  machines: { name: string; model: string }[];
}

export interface IndustrialLine {
  id: string;
  name: string;
  description: string;
  image: string;
  modules: LineModule[];
}

export const industrialLines: IndustrialLine[] = [
  {
    id: "linha-goma",
    name: "Linha de Goma",
    description: "Linha completa para produção de gomas e balas gelatinosas com dosagem, moldagem e embalagem.",
    image: imgGoma,
    modules: [
      {
        id: "goma-preparo",
        title: "Módulo 1 — Preparo e Mistura",
        description: "Mistura e aquecimento das matérias-primas",
        machines: [
          { name: "Tanque de Mistura Aquecido 500L", model: "PAMQTMQ500" },
          { name: "Mixer Rotativo Industrial", model: "PAMQMXR001" },
          { name: "Bomba Dosadora Peristáltica", model: "PAMQBDP003" },
        ],
      },
      {
        id: "goma-moldagem",
        title: "Módulo 2 — Moldagem",
        description: "Moldagem e deposição da massa em moldes",
        machines: [
          { name: "Depositadora de Gomas Rotativa", model: "PAMQDGR001" },
          { name: "Esteira Transportadora Inox 5M", model: "PAMQEST005" },
          { name: "Túnel de Resfriamento", model: "PAMQTRF001" },
        ],
      },
      {
        id: "goma-revestimento",
        title: "Módulo 3 — Revestimento",
        description: "Aplicação de açúcar, ácido e revestimentos",
        machines: [
          { name: "Drageadeira Automática", model: "PAMQDRA001" },
          { name: "Polidor de Gomas", model: "PAMQPLG001" },
        ],
      },
      {
        id: "goma-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Embalagem primária e secundária",
        machines: [
          { name: "Empacotadora Flow Pack", model: "PAMQEFP001" },
          { name: "Encartuchadeira Rotativa", model: "PAMQECR001" },
          { name: "Seladora de Caixa Automática", model: "PAMQSCA001" },
          { name: "Datadora Inkjet", model: "PAMQDAT001" },
        ],
      },
    ],
  },
  {
    id: "linha-softgel",
    name: "Linha de Softgel",
    description: "Linha automatizada para produção de cápsulas softgel com encapsulação e inspeção.",
    image: imgSoftgel,
    modules: [
      {
        id: "softgel-preparo",
        title: "Módulo 1 — Preparo de Gelatina",
        description: "Fusão e preparação da massa de gelatina",
        machines: [
          { name: "Tanque Fundidor de Gelatina", model: "PAMQTFG001" },
          { name: "Desaerador a Vácuo", model: "PAMQDAV001" },
          { name: "Mixer de Alta Velocidade", model: "PAMQMAV001" },
        ],
      },
      {
        id: "softgel-encapsulacao",
        title: "Módulo 2 — Encapsulação",
        description: "Formação e preenchimento das cápsulas",
        machines: [
          { name: "Encapsuladora Softgel Rotativa", model: "PAMQESR001" },
          { name: "Alimentador de Parafuso", model: "PAMQAFP001" },
        ],
      },
      {
        id: "softgel-secagem",
        title: "Módulo 3 — Secagem e Inspeção",
        description: "Secagem e controle de qualidade",
        machines: [
          { name: "Secador de Tambor Rotativo", model: "PAMQSTR001" },
          { name: "Inspetor Visual Automático", model: "PAMQIVA001" },
          { name: "Esteira de Seleção", model: "PAMQESS001" },
        ],
      },
      {
        id: "softgel-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Contagem, envase e embalagem final",
        machines: [
          { name: "Contadora Eletrônica", model: "PAMQCEL001" },
          { name: "Envasadora de Frascos", model: "PAMQEVF001" },
          { name: "Rosqueadora Automática", model: "PAMQRSQ001" },
          { name: "Rotuladora Automática", model: "PAMQRTL001" },
        ],
      },
    ],
  },
  {
    id: "linha-encapsulados",
    name: "Linha de Encapsulados",
    description: "Linha para produção de cápsulas duras com dosagem precisa e encapsulação automatizada.",
    image: imgEncapsulados,
    modules: [
      {
        id: "encap-preparo",
        title: "Módulo 1 — Preparo do Pó",
        description: "Mistura e granulação do material",
        machines: [
          { name: "Misturador em V", model: "PAMQMSV001" },
          { name: "Moinho Triturador", model: "PAMQMTR001" },
          { name: "Peneira Vibratória", model: "PAMQPVB001" },
        ],
      },
      {
        id: "encap-encapsulacao",
        title: "Módulo 2 — Encapsulação",
        description: "Preenchimento automático de cápsulas",
        machines: [
          { name: "Encapsuladora Automática", model: "PAMQECA001" },
          { name: "Alimentador Vibratório", model: "PAMQAVB001" },
          { name: "Polidor de Cápsulas", model: "PAMQPLC001" },
        ],
      },
      {
        id: "encap-inspecao",
        title: "Módulo 3 — Inspeção",
        description: "Controle de peso e visual",
        machines: [
          { name: "Balança Dinâmica", model: "PAMQBLD001" },
          { name: "Detector de Metais", model: "PAMQDTM001" },
        ],
      },
      {
        id: "encap-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Envase em frascos e embalagem final",
        machines: [
          { name: "Contadora Eletrônica", model: "PAMQCEL002" },
          { name: "Envasadora de Frascos", model: "PAMQEVF002" },
          { name: "Fechadora Indução", model: "PAMQFCI001" },
          { name: "Rotuladora Frontal/Verso", model: "PAMQRTF001" },
          { name: "Encartuchadeira", model: "PAMQECR002" },
        ],
      },
    ],
  },
  {
    id: "linha-envase-pastosos",
    name: "Linha de Envase Pastosos",
    description: "Linha dedicada ao envase de cremes, pomadas, géis e produtos pastosos em geral.",
    image: imgEnvasePastosos,
    modules: [
      {
        id: "pastosos-preparo",
        title: "Módulo 1 — Preparo",
        description: "Mistura e homogeneização do produto",
        machines: [
          { name: "Tanque de Mistura c/ Agitador", model: "PAMQTMA001" },
          { name: "Homogeneizador de Alta Pressão", model: "PAMQHAP001" },
          { name: "Bomba de Transferência", model: "PAMQBTR001" },
        ],
      },
      {
        id: "pastosos-envase",
        title: "Módulo 2 — Envase",
        description: "Dosagem e envase em embalagens",
        machines: [
          { name: "Envasadora Pistão 4 Bicos", model: "PAMQEP4001" },
          { name: "Mesa Rotativa de Alimentação", model: "PAMQMRA001" },
          { name: "Esteira Transportadora 3M", model: "PAMQEST003" },
        ],
      },
      {
        id: "pastosos-fechamento",
        title: "Módulo 3 — Fechamento",
        description: "Tampagem e vedação",
        machines: [
          { name: "Rosqueadora Automática Linear", model: "PAMQRAL001" },
          { name: "Fechadora de Tampas Press-On", model: "PAMQFTP001" },
          { name: "Seladora por Indução", model: "PAMQSPI001" },
        ],
      },
      {
        id: "pastosos-rotulagem",
        title: "Módulo 4 — Rotulagem e Final",
        description: "Rotulagem e embalagem secundária",
        machines: [
          { name: "Rotuladora Envolvente", model: "PAMQRTE001" },
          { name: "Datadora Laser", model: "PAMQDTL001" },
          { name: "Encartuchadeira Automática", model: "PAMQECA002" },
          { name: "Seladora de Caixa", model: "PAMQSDC001" },
        ],
      },
    ],
  },
  {
    id: "linha-comprimidos",
    name: "Linha de Comprimidos",
    description: "Linha completa para fabricação de comprimidos com prensa rotativa e revestimento.",
    image: imgComprimidos,
    modules: [
      {
        id: "comp-granulacao",
        title: "Módulo 1 — Granulação",
        description: "Mistura e granulação úmida ou seca",
        machines: [
          { name: "Granulador de Alta Cisalhamento", model: "PAMQGAC001" },
          { name: "Secador de Leito Fluidizado", model: "PAMQSLF001" },
          { name: "Calibrador Oscilante", model: "PAMQCOS001" },
        ],
      },
      {
        id: "comp-compressao",
        title: "Módulo 2 — Compressão",
        description: "Formação dos comprimidos na prensa rotativa",
        machines: [
          { name: "Prensa Rotativa 35 Estações", model: "PAMQPR35001" },
          { name: "Alimentador Forçado", model: "PAMQAFF001" },
          { name: "Despoeirador de Comprimidos", model: "PAMQDPC001" },
        ],
      },
      {
        id: "comp-revestimento",
        title: "Módulo 3 — Revestimento",
        description: "Aplicação de filme e polimento",
        machines: [
          { name: "Drageadeira de Revestimento", model: "PAMQDRV001" },
          { name: "Sistema de Pulverização", model: "PAMQSPV001" },
        ],
      },
      {
        id: "comp-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Blister, envase e embalagem final",
        machines: [
          { name: "Blistadeira Automática", model: "PAMQBLA001" },
          { name: "Envasadora de Frascos", model: "PAMQEVF003" },
          { name: "Contadora Eletrônica", model: "PAMQCEL003" },
          { name: "Encartuchadeira Rotativa", model: "PAMQECR003" },
        ],
      },
    ],
  },
  {
    id: "linha-envase-liquidos-lata",
    name: "Linha de Envase Líquidos Lata",
    description: "Linha automatizada para envase de bebidas e líquidos em latas com recravação e pasteurização.",
    image: imgEnvaseLiquidosLata,
    modules: [
      {
        id: "lata-preparo",
        title: "Módulo 1 — Preparo e CIP",
        description: "Preparação do líquido e limpeza CIP",
        machines: [
          { name: "Tanque de Preparo 2000L", model: "PAMQTP2000" },
          { name: "Sistema CIP Automático", model: "PAMQCIP001" },
          { name: "Filtro de Linha", model: "PAMQFLT001" },
        ],
      },
      {
        id: "lata-envase",
        title: "Módulo 2 — Envase e Recravação",
        description: "Envase em latas e fechamento",
        machines: [
          { name: "Envasadora Isobárica 12 Válvulas", model: "PAMQEI12001" },
          { name: "Recravadeira Automática", model: "PAMQRCA001" },
          { name: "Despaletizadora de Latas", model: "PAMQDPL001" },
          { name: "Rinser de Latas", model: "PAMQRLT001" },
        ],
      },
      {
        id: "lata-pasteurizacao",
        title: "Módulo 3 — Pasteurização",
        description: "Tratamento térmico e controle",
        machines: [
          { name: "Túnel de Pasteurização", model: "PAMQTPS001" },
          { name: "Tanque de Encolhimento", model: "PAMQTEC001" },
        ],
      },
      {
        id: "lata-embalagem",
        title: "Módulo 4 — Embalagem Final",
        description: "Agrupamento, shrink e paletização",
        machines: [
          { name: "Datadora Inkjet", model: "PAMQDAT002" },
          { name: "Empacotadora Shrink", model: "PAMQESH001" },
          { name: "Paletizadora Automática", model: "PAMQPAL001" },
          { name: "Aplicador de Stretch", model: "PAMQAST001" },
        ],
      },
    ],
  },
];
