import { StockItem, StockMovement, EquipmentLoan, WorkOrder, Supplier, WarehouseLocation, Category } from '../types';

export const DEFAULT_SYSTEM_CATEGORIES: Category[] = [
  // TI
  {
    id: 'cat-ti-01',
    name: 'Hardware & Equipamentos',
    department: 'TI',
    description: 'Equipamentos de informática e computação',
    subcategories: ['Notebooks', 'Monitores', 'Desktops', 'Servidores', 'Periféricos']
  },
  {
    id: 'cat-ti-02',
    name: 'Redes & Infraestrutura',
    department: 'TI',
    description: 'Equipamentos e insumos para conectividade e infraestrutura de rede',
    subcategories: ['Switches', 'Roteadores', 'Cabos de Rede', 'Patch Cords', 'Racks & Organizadores', 'Conectores RJ45']
  },
  {
    id: 'cat-ti-03',
    name: 'Acessórios & Cabos',
    department: 'TI',
    description: 'Cabos de vídeo, energia e adaptadores diversos',
    subcategories: ['Cabos HDMI/DisplayPort', 'Adaptadores', 'Fontes & Carregadores', 'Teclados & Mouses', 'Filtros de Linha']
  },
  {
    id: 'cat-ti-04',
    name: 'Armazenamento & Memória',
    department: 'TI',
    description: 'Dispositivos de armazenamento e expansão de memória',
    subcategories: ['SSDs M.2 / SATA', 'Memórias RAM', 'HDs Externos', 'Pendrives']
  },
  {
    id: 'cat-ti-05',
    name: 'Impressão & Suprimentos',
    department: 'TI',
    description: 'Insumos e suprimentos para impressoras e rotuladoras',
    subcategories: ['Toners', 'Cartuchos', 'Etiquetas Térmicas', 'Fitas de Rotuladora']
  },
  {
    id: 'cat-ti-06',
    name: 'Geral',
    department: 'TI',
    description: 'Itens diversos de TI',
    subcategories: ['Diversos']
  },

  // ENGENHARIA
  {
    id: 'cat-eng-01',
    name: 'Instrumentação & Medição',
    department: 'ENGENHARIA',
    description: 'Instrumentos calibrados e equipamentos de bancada técnica',
    subcategories: ['Multímetros Digitais', 'Osciloscópios', 'Alicates Amperímetros', 'Calibradores de Processo', 'Termovisores']
  },
  {
    id: 'cat-eng-02',
    name: 'Automação & CLP',
    department: 'ENGENHARIA',
    description: 'Componentes de controle lógico programável e automação fabril',
    subcategories: ['CLPs & CPUs', 'Módulos de E/S', 'IHMs Touchscreen', 'Inversores de Frequência', 'Soft-Starters']
  },
  {
    id: 'cat-eng-03',
    name: 'Sensores & Transmissores',
    department: 'ENGENHARIA',
    description: 'Sensores industriais para detecção e telemetria',
    subcategories: ['Sensores Ópticos', 'Sensores Indutivos', 'Sensores Capacitivos', 'Transmissores de Pressão', 'Termopares / PT100']
  },
  {
    id: 'cat-eng-04',
    name: 'Componentes Eletrônicos & Painel',
    department: 'ENGENHARIA',
    description: 'Módulos de segurança e componentes de comando',
    subcategories: ['Relés de Segurança', 'Fontes Chaveadas 24VDC', 'Bornes & Conectores', 'Fusíveis Industriais']
  },
  {
    id: 'cat-eng-05',
    name: 'Geral',
    department: 'ENGENHARIA',
    description: 'Itens diversos de Engenharia',
    subcategories: ['Diversos']
  },

  // MANUTENCAO
  {
    id: 'cat-man-01',
    name: 'Ferramentas Manuais & Elétricas',
    department: 'MANUTENCAO',
    description: 'Ferramental para oficina mecânica e elétrica',
    subcategories: ['Parafusadeiras & Furadeiras', 'Chaves Combinadas/Allen', 'Alicates Diversos', 'Serras & Discos', 'Torquímetros']
  },
  {
    id: 'cat-man-02',
    name: 'Mecânica, Rolamentos & Vedações',
    department: 'MANUTENCAO',
    description: 'Peças de desgaste mecânico, transmissão e vedação',
    subcategories: ['Rolamentos Rígidos de Esferas', 'Correias & Polias', 'Retentores & Gaxetas', 'Acoplamentos Flexíveis', 'Mancais']
  },
  {
    id: 'cat-man-03',
    name: 'Elétrica & Iluminação',
    department: 'MANUTENCAO',
    description: 'Materiais elétricos industriais e prediais',
    subcategories: ['Disjuntores Termomagnéticos', 'Contatores & Relés Térmicos', 'Lâmpadas & Refletores LED', 'Cabos Flexíveis & Barramentos']
  },
  {
    id: 'cat-man-04',
    name: 'Pneumática & Hidráulica',
    department: 'MANUTENCAO',
    description: 'Válvulas, atuadores e conexões para linhas de ar comprimido e fluídos',
    subcategories: ['Válvulas Solenoide', 'Cilindros Pneumáticos', 'Conexões Instantâneas', 'Mangueiras PU/Nylon', 'Manômetros']
  },
  {
    id: 'cat-man-05',
    name: 'EPIs & Segurança do Trabalho',
    department: 'MANUTENCAO',
    description: 'Equipamentos de proteção individual e sinalização',
    subcategories: ['Luvas de Proteção', 'Óculos de Segurança', 'Protetores Auriculares', 'Capacetes & Botinas', 'Travamentos LOTO']
  },
  {
    id: 'cat-man-06',
    name: 'Geral',
    department: 'MANUTENCAO',
    description: 'Insumos gerais de Manutenção',
    subcategories: ['Parafusos & Porcas', 'Lubrificantes & Desengripantes', 'Fitas Adesivas/Isolantes']
  }
];

export const INITIAL_CATEGORIES: Category[] = DEFAULT_SYSTEM_CATEGORIES;
export const INITIAL_LOCATIONS: WarehouseLocation[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_ITEMS: StockItem[] = [];
export const INITIAL_MOVEMENTS: StockMovement[] = [];
export const INITIAL_LOANS: EquipmentLoan[] = [];
export const INITIAL_WORK_ORDERS: WorkOrder[] = [];
