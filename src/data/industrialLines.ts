import imgGoma from "@/assets/line-goma.jpg";
import imgSoftgel from "@/assets/line-softgel.jpg";
import imgEncapsulados from "@/assets/line-encapsulados.jpg";
import imgEnvasePastosos from "@/assets/line-envase-pastosos.jpg";
import imgComprimidos from "@/assets/line-comprimidos.jpg";
import imgEnvaseLiquidosLata from "@/assets/line-envase-liquidos-lata.jpg";

export interface MachineSpec {
  label: string;
  value: string;
}

export interface LineMachine {
  name: string;
  model: string;
  description?: string;
  features?: string[];
  specs?: MachineSpec[];
  youtubeUrl?: string;
  images?: string[];
  usageInLine?: string;
  manualUrl?: string;
}

export interface LineModule {
  id: string;
  title: string;
  description: string;
  machines: LineMachine[];
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
          {
            name: "Tanque de Mistura Aquecido 500L",
            model: "PAMQTMQ500",
            description: "O tanque de dissolvimento da calda é um componente essencial na fabricação de gomas e balas. Este equipamento robusto e eficiente é projetado para misturar e dissolver perfeitamente os ingredientes base, criando uma calda homogênea e livre de grumos.",
            features: [
              "Construído em aço inoxidável de alta qualidade",
              "Sistema de agitação otimizado para mistura uniforme",
              "Controle preciso de temperatura para dissolução ideal",
              "Capacidade customizável para atender diferentes escalas de produção",
            ],
            specs: [
              { label: "Volume", value: "220 L" },
              { label: "Diâmetro superior", value: "800 mm" },
              { label: "Potência do motor do misturador", value: "0,75 KW" },
              { label: "Material", value: "Aço Inoxidável 304 (Exceto peças padrão)" },
              { label: "Tamanho da máquina", value: "C 1050 x L 1050 x A 1500 mm" },
              { label: "Peso", value: "200 Kg" },
            ],
            youtubeUrl: "",
            images: [],
            usageInLine: "Na etapa de Preparo e Mistura da Linha de Goma, o tanque de mistura aquecido é responsável por dissolver e homogeneizar a calda base que será utilizada na moldagem das gomas. A temperatura controlada garante a viscosidade ideal para as etapas seguintes.",
          },
          {
            name: "Mixer Rotativo Industrial",
            model: "PAMQMXR001",
            description: "Mixer rotativo de alta performance para homogeneização de ingredientes em processos de produção de gomas e balas.",
            features: [
              "Motor de alta potência para mistura uniforme",
              "Pás de agitação em aço inoxidável",
              "Velocidade variável para diferentes formulações",
              "Design higiênico de fácil limpeza",
            ],
            specs: [
              { label: "Potência do motor", value: "2,2 KW" },
              { label: "Velocidade", value: "50-500 RPM" },
              { label: "Material", value: "Aço Inoxidável 304" },
              { label: "Peso", value: "85 Kg" },
            ],
            usageInLine: "O mixer rotativo atua na homogeneização dos ingredientes adicionados ao tanque, garantindo que corantes, saborizantes e outros aditivos sejam perfeitamente incorporados à calda base.",
          },
          {
            name: "Bomba Dosadora Peristáltica",
            model: "PAMQBDP003",
            description: "Bomba dosadora peristáltica de precisão para transferência controlada de calda e aditivos líquidos.",
            features: [
              "Dosagem precisa e repetível",
              "Sem contato direto com o produto",
              "Fácil troca de mangueiras",
              "Controle digital de vazão",
            ],
            specs: [
              { label: "Vazão máxima", value: "500 L/h" },
              { label: "Pressão máxima", value: "3 bar" },
              { label: "Material da mangueira", value: "Silicone grau alimentício" },
              { label: "Peso", value: "25 Kg" },
            ],
            usageInLine: "A bomba peristáltica é responsável por transferir a calda homogeneizada do tanque de mistura para a depositadora de gomas, garantindo vazão constante e dosagem precisa.",
          },
        ],
      },
      {
        id: "goma-moldagem",
        title: "Módulo 2 — Moldagem",
        description: "Moldagem e deposição da massa em moldes",
        machines: [
          {
            name: "Depositadora de Gomas Rotativa",
            model: "PAMQDGR001",
            description: "Depositadora rotativa de alta velocidade para deposição precisa de massa de goma em moldes de amido ou silicone.",
            features: [
              "Sistema de deposição por pistão de alta precisão",
              "Troca rápida de moldes",
              "Controle de temperatura no cabeçote",
              "Capacidade de até 50 moldes por minuto",
            ],
            specs: [
              { label: "Capacidade", value: "50 moldes/min" },
              { label: "Número de bicos", value: "24" },
              { label: "Potência", value: "3,5 KW" },
              { label: "Material", value: "Aço Inoxidável 304/316" },
              { label: "Peso", value: "1200 Kg" },
            ],
            usageInLine: "A depositadora é o coração do módulo de moldagem, recebendo a calda preparada e depositando-a com precisão nos moldes para formação das gomas.",
          },
          {
            name: "Esteira Transportadora Inox 5M",
            model: "PAMQEST005",
            description: "Esteira transportadora em aço inoxidável de 5 metros para transporte de moldes e produtos entre etapas.",
            specs: [
              { label: "Comprimento", value: "5000 mm" },
              { label: "Largura útil", value: "600 mm" },
              { label: "Velocidade", value: "0,5-15 m/min" },
              { label: "Material", value: "Aço Inoxidável 304" },
            ],
            usageInLine: "Transporta os moldes preenchidos da depositadora até o túnel de resfriamento, mantendo o fluxo contínuo da linha de produção.",
          },
          {
            name: "Túnel de Resfriamento",
            model: "PAMQTRF001",
            description: "Túnel de resfriamento contínuo para solidificação rápida e controlada das gomas nos moldes.",
            specs: [
              { label: "Comprimento", value: "8000 mm" },
              { label: "Temperatura", value: "5-15 °C" },
              { label: "Potência", value: "5,5 KW" },
              { label: "Capacidade", value: "500 Kg/h" },
            ],
            usageInLine: "O túnel de resfriamento garante a solidificação uniforme das gomas após a deposição, preparando-as para a desmoldagem e revestimento.",
          },
        ],
      },
      {
        id: "goma-revestimento",
        title: "Módulo 3 — Revestimento",
        description: "Aplicação de açúcar, ácido e revestimentos",
        machines: [
          {
            name: "Drageadeira Automática",
            model: "PAMQDRA001",
            description: "Drageadeira automática para aplicação uniforme de açúcar, ácido cítrico e outros revestimentos em gomas e balas.",
            features: [
              "Tambor rotativo em aço inox",
              "Sistema de pulverização automático",
              "Controle de velocidade variável",
              "Aquecimento e ventilação integrados",
            ],
            specs: [
              { label: "Capacidade do tambor", value: "150 Kg" },
              { label: "Diâmetro do tambor", value: "1000 mm" },
              { label: "Potência", value: "1,5 KW" },
              { label: "Velocidade de rotação", value: "5-25 RPM" },
              { label: "Material", value: "Aço Inoxidável 304" },
            ],
            usageInLine: "A drageadeira aplica o revestimento de açúcar ou ácido cítrico nas gomas desmoldadas, dando a textura e sabor superficial característicos do produto final.",
          },
          {
            name: "Polidor de Gomas",
            model: "PAMQPLG001",
            description: "Equipamento de polimento para acabamento brilhante em gomas e balas após o processo de drageamento.",
            specs: [
              { label: "Capacidade", value: "100 Kg" },
              { label: "Potência", value: "0,75 KW" },
              { label: "Material", value: "Aço Inoxidável 304" },
              { label: "Peso", value: "120 Kg" },
            ],
            usageInLine: "O polidor finaliza o revestimento das gomas, proporcionando brilho e acabamento premium ao produto antes da etapa de embalagem.",
          },
        ],
      },
      {
        id: "goma-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Embalagem primária e secundária",
        machines: [
          {
            name: "Empacotadora Flow Pack",
            model: "PAMQEFP001",
            description: "Empacotadora automática Flow Pack para embalagem primária individual ou em grupo de gomas e balas.",
            specs: [
              { label: "Velocidade", value: "Até 300 pacotes/min" },
              { label: "Largura do filme", value: "Até 450 mm" },
              { label: "Potência", value: "3 KW" },
              { label: "Peso", value: "800 Kg" },
            ],
            usageInLine: "Realiza a embalagem primária das gomas em sachês ou pacotes individuais, protegendo o produto e preparando para a embalagem secundária.",
          },
          {
            name: "Encartuchadeira Rotativa",
            model: "PAMQECR001",
            description: "Encartuchadeira rotativa automática para inserção de pacotes em caixas de cartão.",
            specs: [
              { label: "Velocidade", value: "Até 120 caixas/min" },
              { label: "Potência", value: "2,2 KW" },
              { label: "Material", value: "Aço Inoxidável / Alumínio" },
              { label: "Peso", value: "1500 Kg" },
            ],
            usageInLine: "A encartuchadeira agrupa os pacotes individuais em caixas de cartão para venda no varejo.",
          },
          {
            name: "Seladora de Caixa Automática",
            model: "PAMQSCA001",
            description: "Seladora automática de caixas de papelão com fita adesiva para fechamento de embalagens secundárias.",
            specs: [
              { label: "Velocidade", value: "Até 20 caixas/min" },
              { label: "Largura da fita", value: "48-75 mm" },
              { label: "Potência", value: "0,37 KW" },
            ],
            usageInLine: "Realiza o fechamento automático das caixas de papelão contendo os displays de gomas para expedição.",
          },
          {
            name: "Datadora Inkjet",
            model: "PAMQDAT001",
            description: "Datadora de impressão a jato de tinta para marcação de lote, validade e dados de rastreabilidade em embalagens.",
            specs: [
              { label: "Velocidade de impressão", value: "Até 10 m/s" },
              { label: "Resolução", value: "300 DPI" },
              { label: "Tipo de tinta", value: "Base solvente / Base água" },
            ],
            usageInLine: "A datadora imprime informações de lote, data de fabricação e validade nas embalagens primárias e secundárias, garantindo rastreabilidade do produto.",
          },
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
          { name: "Tanque Fundidor de Gelatina", model: "PAMQTFG001", description: "Tanque para fusão controlada de gelatina com controle preciso de temperatura.", specs: [{ label: "Capacidade", value: "500 L" }, { label: "Potência", value: "4 KW" }], usageInLine: "Funde a gelatina sólida em massa líquida homogênea para alimentar a encapsuladora." },
          { name: "Desaerador a Vácuo", model: "PAMQDAV001", description: "Remove bolhas de ar da massa de gelatina para cápsulas uniformes.", specs: [{ label: "Pressão de vácuo", value: "-0,8 bar" }, { label: "Capacidade", value: "200 L" }], usageInLine: "Elimina as micro-bolhas da gelatina fundida, garantindo cápsulas transparentes e sem defeitos." },
          { name: "Mixer de Alta Velocidade", model: "PAMQMAV001", description: "Mixer para homogeneização rápida de formulações de gelatina.", specs: [{ label: "Velocidade", value: "3000 RPM" }, { label: "Potência", value: "3 KW" }], usageInLine: "Homogeneíza os aditivos, cores e ingredientes ativos na massa de gelatina preparada." },
        ],
      },
      {
        id: "softgel-encapsulacao",
        title: "Módulo 2 — Encapsulação",
        description: "Formação e preenchimento das cápsulas",
        machines: [
          { name: "Encapsuladora Softgel Rotativa", model: "PAMQESR001", description: "Encapsuladora rotativa de alta velocidade para produção de cápsulas softgel.", specs: [{ label: "Capacidade", value: "Até 50.000 cáps/h" }, { label: "Potência", value: "7,5 KW" }], usageInLine: "Forma e preenche as cápsulas softgel a partir da massa de gelatina e do conteúdo de preenchimento." },
          { name: "Alimentador de Parafuso", model: "PAMQAFP001", description: "Alimentador por parafuso para dosagem precisa de ingredientes em pó.", specs: [{ label: "Capacidade", value: "100 Kg/h" }], usageInLine: "Alimenta ingredientes sólidos ou em pó na encapsuladora de forma contínua e dosada." },
        ],
      },
      {
        id: "softgel-secagem",
        title: "Módulo 3 — Secagem e Inspeção",
        description: "Secagem e controle de qualidade",
        machines: [
          { name: "Secador de Tambor Rotativo", model: "PAMQSTR001", description: "Secador de tambor para secagem controlada de cápsulas softgel.", specs: [{ label: "Capacidade", value: "300 Kg/lote" }, { label: "Temperatura", value: "20-40 °C" }], usageInLine: "Seca as cápsulas softgel recém-formadas, removendo o excesso de umidade da gelatina." },
          { name: "Inspetor Visual Automático", model: "PAMQIVA001", description: "Sistema de inspeção visual por câmera para controle de qualidade de cápsulas.", specs: [{ label: "Velocidade", value: "30.000 cáps/h" }], usageInLine: "Inspeciona cada cápsula individualmente, rejeitando unidades com defeitos visuais." },
          { name: "Esteira de Seleção", model: "PAMQESS001", description: "Esteira com sistema de seleção e rejeição automática.", specs: [{ label: "Comprimento", value: "3000 mm" }], usageInLine: "Transporta e separa as cápsulas aprovadas das rejeitadas após a inspeção visual." },
        ],
      },
      {
        id: "softgel-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Contagem, envase e embalagem final",
        machines: [
          { name: "Contadora Eletrônica", model: "PAMQCEL001", description: "Contadora eletrônica de alta precisão para contagem de cápsulas.", specs: [{ label: "Velocidade", value: "Até 2000 cáps/min" }], usageInLine: "Conta as cápsulas aprovadas e as direciona para envase em frascos." },
          { name: "Envasadora de Frascos", model: "PAMQEVF001", description: "Envasadora automática para envase de cápsulas em frascos.", specs: [{ label: "Velocidade", value: "60 frascos/min" }], usageInLine: "Enche os frascos com a quantidade exata de cápsulas contadas." },
          { name: "Rosqueadora Automática", model: "PAMQRSQ001", description: "Rosqueadora automática para fechamento de frascos com tampa rosca.", specs: [{ label: "Velocidade", value: "60 frascos/min" }], usageInLine: "Aplica e aperta as tampas nos frascos de cápsulas." },
          { name: "Rotuladora Automática", model: "PAMQRTL001", description: "Rotuladora automática para aplicação de rótulos em frascos.", specs: [{ label: "Velocidade", value: "80 frascos/min" }], usageInLine: "Aplica os rótulos nos frascos com informações do produto." },
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
          { name: "Misturador em V", model: "PAMQMSV001", description: "Misturador em V para homogeneização de pós e granulados farmacêuticos.", specs: [{ label: "Capacidade", value: "200 L" }, { label: "Potência", value: "2,2 KW" }], usageInLine: "Homogeneíza os pós e excipientes que serão usados no preenchimento das cápsulas." },
          { name: "Moinho Triturador", model: "PAMQMTR001", description: "Moinho triturador para redução de tamanho de partículas.", specs: [{ label: "Capacidade", value: "100 Kg/h" }], usageInLine: "Reduz o tamanho das partículas para garantir uniformidade e fluidez do pó." },
          { name: "Peneira Vibratória", model: "PAMQPVB001", description: "Peneira vibratória para classificação granulométrica.", specs: [{ label: "Diâmetro", value: "800 mm" }], usageInLine: "Classifica os grânulos por tamanho, garantindo uniformidade no material de enchimento." },
        ],
      },
      {
        id: "encap-encapsulacao",
        title: "Módulo 2 — Encapsulação",
        description: "Preenchimento automático de cápsulas",
        machines: [
          { name: "Encapsuladora Automática", model: "PAMQECA001", description: "Encapsuladora automática de alta velocidade para cápsulas duras.", specs: [{ label: "Capacidade", value: "Até 72.000 cáps/h" }], usageInLine: "Preenche e fecha cápsulas duras com dosagem precisa do pó preparado." },
          { name: "Alimentador Vibratório", model: "PAMQAVB001", description: "Alimentador vibratório para orientação e alimentação de cápsulas vazias.", specs: [{ label: "Capacidade", value: "80.000 cáps/h" }], usageInLine: "Orienta e alimenta as cápsulas vazias na encapsuladora de forma contínua." },
          { name: "Polidor de Cápsulas", model: "PAMQPLC001", description: "Polidor para remoção de pó residual na superfície das cápsulas.", specs: [{ label: "Capacidade", value: "70.000 cáps/h" }], usageInLine: "Remove o excesso de pó da superfície das cápsulas após o enchimento." },
        ],
      },
      {
        id: "encap-inspecao",
        title: "Módulo 3 — Inspeção",
        description: "Controle de peso e visual",
        machines: [
          { name: "Balança Dinâmica", model: "PAMQBLD001", description: "Balança dinâmica para verificação de peso individual de cápsulas em alta velocidade.", specs: [{ label: "Precisão", value: "±0,5 mg" }, { label: "Velocidade", value: "1200 cáps/min" }], usageInLine: "Verifica o peso de cada cápsula individualmente, rejeitando as fora da especificação." },
          { name: "Detector de Metais", model: "PAMQDTM001", description: "Detector de metais para segurança alimentar e farmacêutica.", specs: [{ label: "Sensibilidade Fe", value: "0,5 mm" }], usageInLine: "Detecta contaminações metálicas nos produtos, garantindo a segurança do consumidor." },
        ],
      },
      {
        id: "encap-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Envase em frascos e embalagem final",
        machines: [
          { name: "Contadora Eletrônica", model: "PAMQCEL002", description: "Contadora eletrônica multicanal para contagem de cápsulas.", specs: [{ label: "Canais", value: "16" }, { label: "Velocidade", value: "2500 cáps/min" }], usageInLine: "Conta cápsulas com precisão e as direciona para os frascos." },
          { name: "Envasadora de Frascos", model: "PAMQEVF002", description: "Envasadora automática para envase em frascos PET ou vidro.", specs: [{ label: "Velocidade", value: "80 frascos/min" }], usageInLine: "Enche os frascos com as cápsulas contadas." },
          { name: "Fechadora Indução", model: "PAMQFCI001", description: "Fechadora por selagem de indução para lacre de segurança.", specs: [{ label: "Potência", value: "2 KW" }], usageInLine: "Sela o lacre de alumínio por indução, garantindo inviolabilidade do frasco." },
          { name: "Rotuladora Frontal/Verso", model: "PAMQRTF001", description: "Rotuladora para aplicação de rótulos frente e verso simultaneamente.", specs: [{ label: "Velocidade", value: "100 frascos/min" }], usageInLine: "Aplica rótulos na frente e verso do frasco com informações do produto." },
          { name: "Encartuchadeira", model: "PAMQECR002", description: "Encartuchadeira automática para embalagem em caixas individuais.", specs: [{ label: "Velocidade", value: "80 caixas/min" }], usageInLine: "Embala os frascos em caixas individuais de cartão para venda." },
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
          { name: "Tanque de Mistura c/ Agitador", model: "PAMQTMA001", description: "Tanque de mistura com agitador para preparação de cremes e pastosos.", specs: [{ label: "Capacidade", value: "500 L" }, { label: "Potência", value: "3 KW" }], usageInLine: "Mistura e prepara o produto pastoso antes do envase." },
          { name: "Homogeneizador de Alta Pressão", model: "PAMQHAP001", description: "Homogeneizador para emulsificação e refinamento de produtos pastosos.", specs: [{ label: "Pressão", value: "200 bar" }, { label: "Vazão", value: "500 L/h" }], usageInLine: "Refina a textura do produto, garantindo homogeneidade e estabilidade da emulsão." },
          { name: "Bomba de Transferência", model: "PAMQBTR001", description: "Bomba para transferência suave de produtos viscosos.", specs: [{ label: "Vazão", value: "1000 L/h" }], usageInLine: "Transfere o produto homogeneizado para o sistema de envase." },
        ],
      },
      {
        id: "pastosos-envase",
        title: "Módulo 2 — Envase",
        description: "Dosagem e envase em embalagens",
        machines: [
          { name: "Envasadora Pistão 4 Bicos", model: "PAMQEP4001", description: "Envasadora a pistão com 4 bicos para envase de produtos pastosos.", specs: [{ label: "Bicos", value: "4" }, { label: "Volume", value: "50-500 ml" }, { label: "Velocidade", value: "40 frascos/min" }], usageInLine: "Enche os frascos ou bisnagas com dosagem precisa do produto pastoso." },
          { name: "Mesa Rotativa de Alimentação", model: "PAMQMRA001", description: "Mesa rotativa para alimentação automática de frascos na linha.", specs: [{ label: "Diâmetro", value: "1200 mm" }], usageInLine: "Alimenta os frascos vazios na esteira de forma organizada e contínua." },
          { name: "Esteira Transportadora 3M", model: "PAMQEST003", description: "Esteira transportadora de 3 metros em aço inoxidável.", specs: [{ label: "Comprimento", value: "3000 mm" }], usageInLine: "Conecta os equipamentos do módulo de envase, transportando os frascos entre as etapas." },
        ],
      },
      {
        id: "pastosos-fechamento",
        title: "Módulo 3 — Fechamento",
        description: "Tampagem e vedação",
        machines: [
          { name: "Rosqueadora Automática Linear", model: "PAMQRAL001", description: "Rosqueadora automática linear para aplicação de tampas rosca.", specs: [{ label: "Velocidade", value: "60 frascos/min" }], usageInLine: "Aplica e aperta as tampas nos frascos após o envase." },
          { name: "Fechadora de Tampas Press-On", model: "PAMQFTP001", description: "Fechadora para aplicação de tampas tipo press-on por pressão.", specs: [{ label: "Velocidade", value: "50 frascos/min" }], usageInLine: "Fecha frascos com tampas tipo press-on que não necessitam de rosca." },
          { name: "Seladora por Indução", model: "PAMQSPI001", description: "Seladora por indução eletromagnética para lacres de alumínio.", specs: [{ label: "Potência", value: "2,5 KW" }], usageInLine: "Sela os lacres de alumínio nos frascos por indução, garantindo hermeticidade." },
        ],
      },
      {
        id: "pastosos-rotulagem",
        title: "Módulo 4 — Rotulagem e Final",
        description: "Rotulagem e embalagem secundária",
        machines: [
          { name: "Rotuladora Envolvente", model: "PAMQRTE001", description: "Rotuladora automática envolvente para frascos cilíndricos.", specs: [{ label: "Velocidade", value: "80 frascos/min" }], usageInLine: "Aplica rótulos envolventes nos frascos cilíndricos." },
          { name: "Datadora Laser", model: "PAMQDTL001", description: "Datadora a laser CO2 para marcação permanente em embalagens.", specs: [{ label: "Potência do laser", value: "30W" }, { label: "Velocidade", value: "Até 300 m/min" }], usageInLine: "Grava informações de lote e validade de forma permanente nas embalagens." },
          { name: "Encartuchadeira Automática", model: "PAMQECA002", description: "Encartuchadeira automática para embalagem secundária.", specs: [{ label: "Velocidade", value: "60 caixas/min" }], usageInLine: "Embala os frascos rotulados em caixas de cartão individuais." },
          { name: "Seladora de Caixa", model: "PAMQSDC001", description: "Seladora automática de caixas de papelão para expedição.", specs: [{ label: "Velocidade", value: "15 caixas/min" }], usageInLine: "Fecha as caixas de expedição contendo os produtos embalados." },
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
          { name: "Granulador de Alta Cisalhamento", model: "PAMQGAC001", description: "Granulador de alta cisalhamento para granulação úmida.", specs: [{ label: "Capacidade", value: "300 L" }, { label: "Potência", value: "15 KW" }], usageInLine: "Realiza a granulação úmida dos pós, formando grânulos adequados para compressão." },
          { name: "Secador de Leito Fluidizado", model: "PAMQSLF001", description: "Secador de leito fluidizado para secagem de grânulos.", specs: [{ label: "Capacidade", value: "200 Kg/lote" }, { label: "Temperatura", value: "40-80 °C" }], usageInLine: "Seca os grânulos úmidos até atingir o teor de umidade ideal para compressão." },
          { name: "Calibrador Oscilante", model: "PAMQCOS001", description: "Calibrador oscilante para padronização do tamanho de grânulos.", specs: [{ label: "Capacidade", value: "500 Kg/h" }], usageInLine: "Padroniza o tamanho dos grânulos secos para alimentação uniforme da prensa." },
        ],
      },
      {
        id: "comp-compressao",
        title: "Módulo 2 — Compressão",
        description: "Formação dos comprimidos na prensa rotativa",
        machines: [
          { name: "Prensa Rotativa 35 Estações", model: "PAMQPR35001", description: "Prensa rotativa de alta velocidade com 35 estações para formação de comprimidos.", specs: [{ label: "Estações", value: "35" }, { label: "Capacidade", value: "Até 250.000 comp/h" }, { label: "Força de compressão", value: "100 KN" }], usageInLine: "Comprime os grânulos em comprimidos com dureza e peso controlados." },
          { name: "Alimentador Forçado", model: "PAMQAFF001", description: "Alimentador forçado para dosagem precisa de pó na prensa.", specs: [{ label: "Compatibilidade", value: "Prensas 25-45 estações" }], usageInLine: "Garante alimentação uniforme e constante do pó nas matrizes da prensa." },
          { name: "Despoeirador de Comprimidos", model: "PAMQDPC001", description: "Sistema de remoção de pó residual dos comprimidos após compressão.", specs: [{ label: "Capacidade", value: "300.000 comp/h" }], usageInLine: "Remove o pó superficial dos comprimidos recém-formados." },
        ],
      },
      {
        id: "comp-revestimento",
        title: "Módulo 3 — Revestimento",
        description: "Aplicação de filme e polimento",
        machines: [
          { name: "Drageadeira de Revestimento", model: "PAMQDRV001", description: "Drageadeira perfurada para revestimento de comprimidos com filme ou açúcar.", specs: [{ label: "Capacidade", value: "150 Kg/lote" }, { label: "Diâmetro", value: "1200 mm" }], usageInLine: "Aplica o revestimento de filme nos comprimidos para proteção e liberação controlada." },
          { name: "Sistema de Pulverização", model: "PAMQSPV001", description: "Sistema de pulverização com bombas peristálticas para aplicação de solução de revestimento.", specs: [{ label: "Bicos", value: "4" }], usageInLine: "Pulveriza a solução de revestimento sobre os comprimidos dentro da drageadeira." },
        ],
      },
      {
        id: "comp-embalagem",
        title: "Módulo 4 — Embalagem",
        description: "Blister, envase e embalagem final",
        machines: [
          { name: "Blistadeira Automática", model: "PAMQBLA001", description: "Blistadeira automática para embalagem de comprimidos em blister ALU/PVC.", specs: [{ label: "Velocidade", value: "Até 300 blisters/min" }], usageInLine: "Embala os comprimidos em cartelas blister para proteção individual." },
          { name: "Envasadora de Frascos", model: "PAMQEVF003", description: "Envasadora para envase de comprimidos a granel em frascos.", specs: [{ label: "Velocidade", value: "60 frascos/min" }], usageInLine: "Alternativa ao blister: enche frascos com comprimidos a granel." },
          { name: "Contadora Eletrônica", model: "PAMQCEL003", description: "Contadora eletrônica multicanal para comprimidos.", specs: [{ label: "Velocidade", value: "3000 comp/min" }], usageInLine: "Conta os comprimidos para envase preciso em frascos." },
          { name: "Encartuchadeira Rotativa", model: "PAMQECR003", description: "Encartuchadeira rotativa para embalagem em caixas de cartão.", specs: [{ label: "Velocidade", value: "100 caixas/min" }], usageInLine: "Embala blisters ou frascos em caixas individuais de cartão." },
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
          { name: "Tanque de Preparo 2000L", model: "PAMQTP2000", description: "Tanque de preparo de grande capacidade para preparação de bebidas.", specs: [{ label: "Capacidade", value: "2000 L" }, { label: "Material", value: "Aço Inox 316L" }], usageInLine: "Prepara e armazena o líquido formulado antes do envase." },
          { name: "Sistema CIP Automático", model: "PAMQCIP001", description: "Sistema de limpeza CIP (Clean-In-Place) automático para higienização da linha.", specs: [{ label: "Tanques", value: "3" }, { label: "Vazão", value: "5000 L/h" }], usageInLine: "Realiza a limpeza automática de toda a linha sem necessidade de desmontagem." },
          { name: "Filtro de Linha", model: "PAMQFLT001", description: "Filtro de linha para remoção de impurezas do líquido.", specs: [{ label: "Malha", value: "100 microns" }], usageInLine: "Filtra o líquido preparado antes do envase, removendo partículas indesejadas." },
        ],
      },
      {
        id: "lata-envase",
        title: "Módulo 2 — Envase e Recravação",
        description: "Envase em latas e fechamento",
        machines: [
          { name: "Envasadora Isobárica 12 Válvulas", model: "PAMQEI12001", description: "Envasadora isobárica com 12 válvulas para envase de bebidas carbonatadas em latas.", specs: [{ label: "Válvulas", value: "12" }, { label: "Velocidade", value: "3000 latas/h" }], usageInLine: "Enche as latas com a bebida sob pressão isobárica, evitando perda de carbonatação." },
          { name: "Recravadeira Automática", model: "PAMQRCA001", description: "Recravadeira automática para fechamento hermético de latas.", specs: [{ label: "Velocidade", value: "3000 latas/h" }], usageInLine: "Fecha hermeticamente as latas através do processo de recravação da tampa." },
          { name: "Despaletizadora de Latas", model: "PAMQDPL001", description: "Despaletizadora automática para alimentação de latas vazias na linha.", specs: [{ label: "Capacidade", value: "6000 latas/h" }], usageInLine: "Despaletiza e alimenta as latas vazias no início da linha de envase." },
          { name: "Rinser de Latas", model: "PAMQRLT001", description: "Rinser para lavagem e sanitização de latas vazias antes do envase.", specs: [{ label: "Velocidade", value: "3000 latas/h" }], usageInLine: "Lava e sanitiza as latas vazias antes do envase para garantir higiene." },
        ],
      },
      {
        id: "lata-pasteurizacao",
        title: "Módulo 3 — Pasteurização",
        description: "Tratamento térmico e controle",
        machines: [
          { name: "Túnel de Pasteurização", model: "PAMQTPS001", description: "Túnel de pasteurização contínuo para tratamento térmico de latas.", specs: [{ label: "Comprimento", value: "12000 mm" }, { label: "Temperatura", value: "65-85 °C" }], usageInLine: "Realiza a pasteurização das latas cheias para garantir estabilidade microbiológica." },
          { name: "Tanque de Encolhimento", model: "PAMQTEC001", description: "Tanque de água quente para encolhimento de sleeve em latas.", specs: [{ label: "Temperatura", value: "85-95 °C" }], usageInLine: "Aplica calor para encolher os sleeves de PVC nas latas rotuladas." },
        ],
      },
      {
        id: "lata-embalagem",
        title: "Módulo 4 — Embalagem Final",
        description: "Agrupamento, shrink e paletização",
        machines: [
          { name: "Datadora Inkjet", model: "PAMQDAT002", description: "Datadora inkjet industrial para marcação em alta velocidade.", specs: [{ label: "Velocidade", value: "Até 15 m/s" }], usageInLine: "Imprime lote e validade nas latas durante o transporte na esteira." },
          { name: "Empacotadora Shrink", model: "PAMQESH001", description: "Empacotadora com shrink para agrupamento de latas em packs.", specs: [{ label: "Velocidade", value: "30 packs/min" }], usageInLine: "Agrupa as latas em packs de 6, 12 ou 24 unidades com filme shrink." },
          { name: "Paletizadora Automática", model: "PAMQPAL001", description: "Paletizadora robótica para empilhamento automático de caixas/packs em pallets.", specs: [{ label: "Capacidade", value: "10 pallets/h" }], usageInLine: "Empilha automaticamente os packs de latas nos pallets para expedição." },
          { name: "Aplicador de Stretch", model: "PAMQAST001", description: "Aplicador de filme stretch para fixação da carga no pallet.", specs: [{ label: "Velocidade", value: "25 pallets/h" }], usageInLine: "Envolve os pallets com filme stretch para proteção durante transporte." },
        ],
      },
    ],
  },
];
