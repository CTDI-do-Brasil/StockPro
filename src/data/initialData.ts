import { StockItem, StockMovement, EquipmentLoan, WorkOrder, Supplier, WarehouseLocation, Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  // TI
  {
    id: 'cat-ti-1',
    name: 'Hardware & Equipamentos',
    department: 'TI',
    subcategories: ['Notebooks Corporativos', 'Desktops & Workstations', 'Servidores & Storages', 'Monitores & Displays'],
    description: 'Equipamentos computacionais e estações de trabalho'
  },
  {
    id: 'cat-ti-2',
    name: 'Monitores & Telas',
    department: 'TI',
    subcategories: ['Monitores 4K/QHD', 'Monitores Corporativos FHD', 'Suportes Articulados & Braços', 'Telas de Projeção'],
    description: 'Displays e periféricos visuais'
  },
  {
    id: 'cat-ti-3',
    name: 'Redes & Infraestrutura',
    department: 'TI',
    subcategories: ['Switches Gerenciáveis', 'Roteadores & Firewalls', 'Access Points Wi-Fi', 'Patch Panels & Racks'],
    description: 'Ativos e passivos de rede corporativa e industrial'
  },
  {
    id: 'cat-ti-4',
    name: 'Cabos & Conectores',
    department: 'TI',
    subcategories: ['Cabos UTP Cat6/Cat6A', 'Patch Cords Montados', 'Fibras Ópticas & GBICs', 'Adaptadores de Vídeo & HDMI'],
    description: 'Cabeamento estruturado e conectividade'
  },
  {
    id: 'cat-ti-5',
    name: 'Componentes & Peças',
    department: 'TI',
    subcategories: ['SSDs M.2 & SATA', 'Memórias RAM DDR4/DDR5', 'Fontes de Alimentação ATX', 'Processadores & Coolers'],
    description: 'Peças de reposição e upgrades de estações'
  },
  {
    id: 'cat-ti-6',
    name: 'Suprimentos & Impressão',
    department: 'TI',
    subcategories: ['Toners Laser HP/Lexmark', 'Cartuchos & Fitas', 'Cilindros Fotocondutores', 'Bobinas & Ribbons Térmicos'],
    description: 'Insumos para ilhas de impressão e etiquetas fabris'
  },
  {
    id: 'cat-ti-7',
    name: 'Periféricos & Acessórios',
    department: 'TI',
    subcategories: ['Teclados & Mouses', 'Headsets & Microfones', 'Webcams Corporativas', 'Dockstations USB-C'],
    description: 'Acessórios de produtividade'
  },
  {
    id: 'cat-ti-8',
    name: 'Licenças & Softwares',
    department: 'TI',
    subcategories: ['Sistemas Operacionais', 'Softwares CAD/Engenharia', 'Antivírus & Segurança', 'Chaves Físicas (Dongles)'],
    description: 'Ativos de software e dongles'
  },

  // ENGENHARIA
  {
    id: 'cat-eng-1',
    name: 'Automação & PLCs',
    department: 'ENGENHARIA',
    subcategories: ['CPUs & Controladores CLP', 'Módulos de E/S Digitais', 'Módulos Analógicos (4-20mA/0-10V)', 'Interfaces Homem-Máquina (IHM)'],
    description: 'Controladores lógicos e IHMs para automação'
  },
  {
    id: 'cat-eng-2',
    name: 'Instrumentação & Medição',
    department: 'ENGENHARIA',
    subcategories: ['Multímetros Calibrados RBC', 'Osciloscópios Digitais', 'Alicates Wattimétricos', 'Calibradores de Loop de Corrente'],
    description: 'Instrumentos de precisão e aferição de bancada'
  },
  {
    id: 'cat-eng-3',
    name: 'Sensores & Dispositivos',
    department: 'ENGENHARIA',
    subcategories: ['Sensores Fotoelétricos / Laser', 'Sensores Indutivos & Capacitivos', 'Transmissores de Pressão & Nível', 'Encoders & Tacogeradores'],
    description: 'Sensoriamento para esteiras e linhas fabris'
  },
  {
    id: 'cat-eng-4',
    name: 'Placas & Prototipagem',
    department: 'ENGENHARIA',
    subcategories: ['Microcontroladores ESP32/ARM', 'Shields & Módulos de Relé', 'Placas de Desenvolvimento IoT', 'Bancadas & Protoboards'],
    description: 'Hardware experimental e telemetria fabril'
  },
  {
    id: 'cat-eng-5',
    name: 'Componentes Eletrônicos (SMD/PTH)',
    department: 'ENGENHARIA',
    subcategories: ['CIs & Transistores de Potência', 'Capacitores & Resistores', 'Optoacopladores & Diodos', 'Reguladores de Tensão'],
    description: 'Componentes para reparo em placa eletrônica'
  },
  {
    id: 'cat-eng-6',
    name: 'Fontes & Alimentação',
    department: 'ENGENHARIA',
    subcategories: ['Fontes Chaveadas 24VDC Trilho DIN', 'Conversores DC-DC Industriais', 'Nobreaks para Painéis', 'Filtros de Linha RFI/EMI'],
    description: 'Alimentação estabilizada para sistemas de controle'
  },
  {
    id: 'cat-eng-7',
    name: 'Cabos & Barramentos Industriais',
    department: 'ENGENHARIA',
    subcategories: ['Cabos Blindados Profinet/Profibus', 'Cabos Manga & Controle', 'Bornes Conectores Push-in', 'Conectores M12 / Harting'],
    description: 'Fiação especial e redes de chão de fábrica'
  },
  {
    id: 'cat-eng-8',
    name: 'Automação & Segurança (NR12)',
    department: 'ENGENHARIA',
    subcategories: ['Relés de Segurança Categoria 4', 'Cortinas de Luz de Segurança', 'Chaves Magnéticas de Intertravamento', 'Botões de Parada de Emergência'],
    description: 'Componentes certificados para proteção de operadores'
  },

  // MANUTENÇÃO
  {
    id: 'cat-man-1',
    name: 'Mecânica & Rolamentos',
    department: 'MANUTENCAO',
    subcategories: ['Rolamentos Rígidos de Esferas', 'Rolamentos Autocompensadores', 'Mancais & Buchas de Fixação', 'Retentores & Anéis O-ring'],
    description: 'Elementos de rolamento e suporte mecânico'
  },
  {
    id: 'cat-man-2',
    name: 'Mecânica & Transmissão',
    department: 'MANUTENCAO',
    subcategories: ['Correias Dentadas Sincronizadoras', 'Correias em V Industriais', 'Polias & Engrenagens', 'Correntes de Transmissão & Emendas'],
    description: 'Transmissão de potência mecânica'
  },
  {
    id: 'cat-man-3',
    name: 'Pneumática & Válvulas',
    department: 'MANUTENCAO',
    subcategories: ['Válvulas Solenoides Direcionais', 'Cilindros Pneumáticos ISO/Compactos', 'Conexões Rápidas & Tubos PU', 'Unidades de Tratamento de Ar (FRL)'],
    description: 'Sistemas pneumáticos de ar comprimido'
  },
  {
    id: 'cat-man-4',
    name: 'Hidráulica & Bombas',
    department: 'MANUTENCAO',
    subcategories: ['Bombas de Palheta & Engrenagens', 'Válvulas Proporcionais / Manifolds', 'Mangueiras Hidráulicas Tramadas', 'Filtros & Visores de Óleo'],
    description: 'Sistemas de alta pressão de óleo e bombas'
  },
  {
    id: 'cat-man-5',
    name: 'Elétrica & Painéis',
    department: 'MANUTENCAO',
    subcategories: ['Disjuntores Motor & Termomagnéticos', 'Contatores & Relés Térmicos', 'Inversores de Frequência & Soft-Starters', 'Transformadores de Comando'],
    description: 'Comandos elétricos industriais e acionamentos'
  },
  {
    id: 'cat-man-6',
    name: 'Ferramental & Equipamentos',
    department: 'MANUTENCAO',
    subcategories: ['Ferramentas Elétricas a Bateria', 'Chaves Manuais & Jogos de Soquetes', 'Torquímetros de Precisão', 'Extratores Mecânicos de Rolamentos'],
    description: 'Ferramentas manuais e eletroportáteis de oficina'
  },
  {
    id: 'cat-man-7',
    name: 'Lubrificantes & Químicos',
    department: 'MANUTENCAO',
    subcategories: ['Graxas Sintéticas de Alta Temp.', 'Óleos Lubrificantes ISO VG', 'Desengraxantes & Solventes Industriais', 'Travas Químicas & Silicones'],
    description: 'Químicos de manutenção e lubrificação'
  },
  {
    id: 'cat-man-8',
    name: 'EPIs & Segurança',
    department: 'MANUTENCAO',
    subcategories: ['Luvas de Proteção Mecânica/Anticorte', 'Óculos & Protetores Faciais', 'Protetores Auriculares Tipo Concha', 'Cintos de Segurança & Trava-Quedas'],
    description: 'Equipamentos de proteção individual'
  },
  {
    id: 'cat-man-9',
    name: 'Fixadores & Parafusos',
    department: 'MANUTENCAO',
    subcategories: ['Parafusos Allen Aço 8.8/12.9', 'Porcas & Arruelas Travantes', 'Barras Roscadas & Prisioneiros', 'Rebites & Abraçadeiras Inox'],
    description: 'Elemento de união e fixação de componentes'
  }
];

export const INITIAL_LOCATIONS: WarehouseLocation[] = [
  { id: 'loc-1', code: 'ALM-TI-01', name: 'Almoxarifado TI - Sala Servidores', department: 'TI', type: 'Almoxarifado', capacityNotes: 'Armários fechados com controle de acesso' },
  { id: 'loc-2', code: 'ALM-ENG-01', name: 'Laboratório & Almoxarifado de Engenharia', department: 'ENGENHARIA', type: 'Oficina', capacityNotes: 'Bancadas antiestáticas (ESD) e gaveteiros' },
  { id: 'loc-3', code: 'ALM-MAN-01', name: 'Almoxarifado Geral de Manutenção Mecânica/Elétrica', department: 'MANUTENCAO', type: 'Almoxarifado', capacityNotes: 'Prateleiras pesadas e área de químicos' },
  { id: 'loc-4', code: 'ALM-OFIC-02', name: 'Oficina de Manutenção de Campo', department: 'MANUTENCAO', type: 'Oficina', capacityNotes: 'Armários de ferramentas e bancada de ajustes' },
  { id: 'loc-5', code: 'ALM-CENTRAL', name: 'Almoxarifado Central da Fábrica', department: 'GERAL', type: 'Almoxarifado', capacityNotes: 'Recepção e triagem de notas fiscais' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Dell Computadores do Brasil Ltda',
    cnpj: '72.381.189/0001-10',
    contact: 'Carlos Eduardo (Key Account)',
    email: 'vendas.corporativo@dell.com',
    phone: '(11) 4004-0100',
    departments: ['TI'],
    categories: ['Hardware & Equipamentos', 'Monitores & Telas'],
    rating: 5,
    notes: 'Contrato corporativo com garantia ProSupport 24x7 no local'
  },
  {
    id: 'sup-2',
    name: 'Siemens Automação e Soluções Industriais',
    cnpj: '61.063.386/0001-44',
    contact: 'Eng. Marcelo Antunes',
    email: 'comercial.automacao@siemens.com',
    phone: '(11) 3817-3000',
    departments: ['ENGENHARIA', 'MANUTENCAO'],
    categories: ['Automação & PLCs', 'Sensores & Dispositivos', 'Elétrica & Painéis'],
    rating: 5,
    notes: 'Fornecedor homologado para painéis elétricos e automação fabril'
  },
  {
    id: 'sup-3',
    name: 'SKF do Brasil Rolamentos & Vedações',
    cnpj: '61.456.789/0001-92',
    contact: 'Renata Silveira',
    email: 'pedidos@skfdistribuidor.com.br',
    phone: '(19) 3888-2000',
    departments: ['MANUTENCAO'],
    categories: ['Mecânica & Rolamentos', 'Lubrificantes & Químicos'],
    rating: 4.8,
    notes: 'Entrega rápida em até 24h para itens de curva A'
  },
  {
    id: 'sup-4',
    name: 'Festo Pneumática e Automação Ltda',
    cnpj: '61.123.456/0001-78',
    contact: 'Lucas Mendes',
    email: 'atendimento@festo.com.br',
    phone: '(11) 5013-1600',
    departments: ['ENGENHARIA', 'MANUTENCAO'],
    categories: ['Pneumática & Válvulas', 'Automação & PLCs'],
    rating: 4.9,
    notes: 'Linha pneumática padronizada'
  },
  {
    id: 'sup-5',
    name: 'Kabum & Furukawa Conectividade & TI',
    cnpj: '05.570.714/0001-59',
    contact: 'Central B2B Corporativo',
    email: 'corporativo@kabum.com.br',
    phone: '(19) 2114-4444',
    departments: ['TI', 'ENGENHARIA'],
    categories: ['Cabos & Conectores', 'Componentes & Peças', 'Periféricos & Acessórios'],
    rating: 4.7
  }
];

export const INITIAL_ITEMS: StockItem[] = [
  // ==================== TI (Information Technology) ====================
  {
    id: 'item-ti-01',
    sku: 'TI-NOTE-5440',
    barcode: '7891001001018',
    name: 'Notebook Dell Latitude 5440 Core i7 16GB SSD 512GB',
    department: 'TI',
    category: 'Hardware & Equipamentos',
    subcategory: 'Notebooks Corporativos',
    description: 'Notebook corporativo padrão para engenheiros e analistas. Acompanha carregador USB-C 65W.',
    quantity: 4,
    minQuantity: 2,
    maxQuantity: 15,
    unit: 'un',
    unitPrice: 5850.00,
    location: {
      warehouse: 'Almoxarifado TI - Sala Servidores',
      aisleRack: 'Rack 02',
      shelfBin: 'Prateleira A - Gaveta 01'
    },
    supplier: 'Dell Computadores do Brasil Ltda',
    manufacturer: 'Dell',
    partNumber: 'LAT-5440-BR',
    serialNumbers: ['BR-LAT-90412', 'BR-LAT-90413', 'BR-LAT-90414', 'BR-LAT-90415'],
    isEquipment: true,
    activeLoansCount: 2,
    tags: ['laptop', 'notebook', 'dell', 'i7', 'cautela'],
    createdAt: '2026-01-15T09:00:00Z',
    lastUpdated: '2026-08-25T14:30:00Z',
    notes: 'Equipamento sujeito a termo de cautela obrigatório.'
  },
  {
    id: 'item-ti-02',
    sku: 'TI-MON-P2723',
    barcode: '7891001001025',
    name: 'Monitor Dell 27" 4K IPS P2723QE USB-C Hub',
    department: 'TI',
    category: 'Monitores & Telas',
    subcategory: 'Monitores 4K/QHD',
    description: 'Monitor profissional com hub USB-C, rede RJ-45 integrada e carregamento Power Delivery 90W.',
    quantity: 8,
    minQuantity: 3,
    maxQuantity: 20,
    unit: 'un',
    unitPrice: 2490.00,
    location: {
      warehouse: 'Almoxarifado TI - Sala Servidores',
      aisleRack: 'Corredor 01',
      shelfBin: 'Prateleira B - Estante 03'
    },
    supplier: 'Dell Computadores do Brasil Ltda',
    manufacturer: 'Dell',
    partNumber: 'P2723QE-4K',
    isEquipment: true,
    activeLoansCount: 0,
    tags: ['monitor', '4k', 'dell', 'usb-c', 'display'],
    createdAt: '2026-02-10T10:00:00Z',
    lastUpdated: '2026-08-20T11:15:00Z'
  },
  {
    id: 'item-ti-03',
    sku: 'TI-SW-C9200',
    barcode: '7891001001032',
    name: 'Switch Cisco Catalyst C9200L 24 Portas Gigabit PoE+',
    department: 'TI',
    category: 'Redes & Infraestrutura',
    subcategory: 'Switches Gerenciáveis',
    description: 'Switch gerenciável de borda com 24 portas PoE+ e 4 uplinks 10G SFP+. Backup quente da fábrica.',
    quantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    unit: 'un',
    unitPrice: 14200.00,
    location: {
      warehouse: 'Almoxarifado TI - Sala Servidores',
      aisleRack: 'Rack TI-Core',
      shelfBin: 'Bandeja Reserva 01'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'Cisco',
    partNumber: 'C9200L-24P-4X-E',
    isEquipment: true,
    activeLoansCount: 0,
    tags: ['cisco', 'switch', 'rede', 'poe', 'gigabit', 'infra'],
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-08-10T16:00:00Z',
    notes: 'Manter sempre 1 unidade para swap imediato em caso de pane no Data Center.'
  },
  {
    id: 'item-ti-04',
    sku: 'TI-CAB-CAT6-F',
    barcode: '7891001001049',
    name: 'Cabo de Rede Cat6 Furukawa SohoPlus 100% Cobre (Caixa 305m)',
    department: 'TI',
    category: 'Cabos & Conectores',
    subcategory: 'Cabos UTP Cat6/Cat6A',
    description: 'Cabo UTP 4 pares CMX homologado Anatel para cabeamento estruturado e manutenção de pontos de rede.',
    quantity: 2,
    minQuantity: 3,
    maxQuantity: 10,
    unit: 'cx',
    unitPrice: 680.00,
    location: {
      warehouse: 'Almoxarifado TI - Sala Servidores',
      aisleRack: 'Corredor 01',
      shelfBin: 'Piso Palete 04'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'Furukawa',
    partNumber: 'SOHO-CAT6-BL',
    isEquipment: false,
    tags: ['cabo', 'cat6', 'furukawa', 'rede', 'utp', 'baixo_estoque'],
    createdAt: '2026-03-01T11:00:00Z',
    lastUpdated: '2026-08-28T09:40:00Z'
  },
  {
    id: 'item-ti-05',
    sku: 'TI-SSD-1TB-NV2',
    barcode: '7891001001056',
    name: 'SSD M.2 NVMe 1TB Kingston NV2 PCIe 4.0',
    department: 'TI',
    category: 'Componentes & Peças',
    subcategory: 'SSDs M.2 & SATA',
    description: 'Armazenamento rápido para upgrades de estações de trabalho e substituição de discos danificados.',
    quantity: 12,
    minQuantity: 5,
    maxQuantity: 30,
    unit: 'un',
    unitPrice: 420.00,
    location: {
      warehouse: 'Almoxarifado TI - Sala Servidores',
      aisleRack: 'Gaveteiro Eletrônicos',
      shelfBin: 'Gaveta 03 - Peças'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'Kingston',
    partNumber: 'SNV2S/1000G',
    isEquipment: false,
    tags: ['ssd', 'nvme', 'kingston', 'armazenamento', 'upgrade'],
    createdAt: '2026-04-12T13:20:00Z',
    lastUpdated: '2026-08-29T10:10:00Z'
  },
  {
    id: 'item-ti-06',
    sku: 'TI-TON-W105A',
    barcode: '7891001001063',
    name: 'Cartucho de Toner HP LaserJet 105A Preto Original',
    department: 'TI',
    category: 'Suprimentos & Impressão',
    subcategory: 'Toners Laser HP/Lexmark',
    description: 'Toner original para impressoras das ilhas de expedição e manutenção da fábrica.',
    quantity: 1,
    minQuantity: 4,
    maxQuantity: 16,
    unit: 'un',
    unitPrice: 295.00,
    location: {
      warehouse: 'Almoxarifado TI - Sala Servidores',
      aisleRack: 'Armário Suprimentos',
      shelfBin: 'Prateleira 02'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'HP',
    partNumber: 'W105A',
    isEquipment: false,
    tags: ['toner', 'hp', 'impressao', 'critico', 'baixo_estoque'],
    createdAt: '2026-02-18T15:00:00Z',
    lastUpdated: '2026-08-30T17:00:00Z'
  },

  // ==================== ENGENHARIA ====================
  {
    id: 'item-eng-01',
    sku: 'ENG-CLP-1214C',
    barcode: '7892002002015',
    name: 'CLP Siemens Simatic S7-1200 CPU 1214C DC/DC/DC',
    department: 'ENGENHARIA',
    category: 'Automação & PLCs',
    subcategory: 'CPUs & Controladores CLP',
    description: 'Controlador Lógico Programável industrial com 14 entradas 24VDC, 10 saídas a transistor e 2 entradas analógicas 0-10V.',
    quantity: 3,
    minQuantity: 1,
    maxQuantity: 6,
    unit: 'un',
    unitPrice: 3890.00,
    location: {
      warehouse: 'Laboratório & Almoxarifado de Engenharia',
      aisleRack: 'Armário ESD-01',
      shelfBin: 'Prateleira 03 - Módulos CLP'
    },
    supplier: 'Siemens Automação e Soluções Industriais',
    manufacturer: 'Siemens',
    partNumber: '6ES7214-1AG40-0XB0',
    serialNumbers: ['SIE-CLP-7701', 'SIE-CLP-7702', 'SIE-CLP-7703'],
    isEquipment: true,
    activeLoansCount: 1,
    tags: ['clp', 'plc', 'siemens', 's7-1200', 'automacao', 'profinet'],
    createdAt: '2026-01-10T14:00:00Z',
    lastUpdated: '2026-08-22T08:30:00Z'
  },
  {
    id: 'item-eng-02',
    sku: 'ENG-INST-FLUKE179',
    barcode: '7892002002022',
    name: 'Multímetro Digital Industrial Fluke 179 True RMS com Calibração RBC',
    department: 'ENGENHARIA',
    category: 'Instrumentação & Medição',
    subcategory: 'Multímetros Calibrados RBC',
    description: 'Multímetro de alta precisão com termopar integrado, backlight e certificado RBC válido até 12/2026.',
    quantity: 5,
    minQuantity: 2,
    maxQuantity: 8,
    unit: 'un',
    unitPrice: 3150.00,
    location: {
      warehouse: 'Laboratório & Almoxarifado de Engenharia',
      aisleRack: 'Armário de Instrumentos Calibrados',
      shelfBin: 'Nicho 02 - Maleta Fluke'
    },
    supplier: 'Siemens Automação e Soluções Industriais',
    manufacturer: 'Fluke',
    partNumber: 'FLUKE-179-EFSP',
    serialNumbers: ['FLK-179-0941', 'FLK-179-0942', 'FLK-179-0943', 'FLK-179-0944', 'FLK-179-0945'],
    isEquipment: true,
    activeLoansCount: 3,
    tags: ['multimetro', 'fluke', 'calibrado', 'cautela', 'medicao', 'true-rms'],
    createdAt: '2026-02-05T09:30:00Z',
    lastUpdated: '2026-08-31T08:00:00Z',
    notes: 'Exige devolução diária ou cautela nominal assinada pelo técnico.'
  },
  {
    id: 'item-eng-03',
    sku: 'ENG-INST-RIGOL',
    barcode: '7892002002039',
    name: 'Osciloscópio Digital Rigol DS1054Z 50MHz 4 Canais',
    department: 'ENGENHARIA',
    category: 'Instrumentação & Medição',
    subcategory: 'Osciloscópios Digitais',
    description: 'Osciloscópio digital 4 canais 1GSa/s com tecnologia UltraVision para análise de sinais e barramentos industriais.',
    quantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    unit: 'un',
    unitPrice: 4800.00,
    location: {
      warehouse: 'Laboratório & Almoxarifado de Engenharia',
      aisleRack: 'Bancada de Testes 01',
      shelfBin: 'Prateleira Superior'
    },
    supplier: 'Siemens Automação e Soluções Industriais',
    manufacturer: 'Rigol',
    partNumber: 'DS1054Z',
    serialNumbers: ['RGL-DS-4410', 'RGL-DS-4411'],
    isEquipment: true,
    activeLoansCount: 1,
    tags: ['osciloscopio', 'rigol', '4canais', 'laboratorio', 'cautela'],
    createdAt: '2026-01-28T16:00:00Z',
    lastUpdated: '2026-08-27T10:00:00Z'
  },
  {
    id: 'item-eng-04',
    sku: 'ENG-SEN-QS18',
    barcode: '7892002002046',
    name: 'Sensor Fotoelétrico Industrial Banner QS18VP6FP 24V PNP',
    department: 'ENGENHARIA',
    category: 'Sensores & Dispositivos',
    subcategory: 'Sensores Fotoelétricos / Laser',
    description: 'Sensor óptico retroreflexivo com supressão de fundo para esteiras de embalagem e montagem.',
    quantity: 9,
    minQuantity: 4,
    maxQuantity: 25,
    unit: 'un',
    unitPrice: 430.00,
    location: {
      warehouse: 'Laboratório & Almoxarifado de Engenharia',
      aisleRack: 'Gaveteiro Sensores',
      shelfBin: 'Gaveta 04 - Ópticos'
    },
    supplier: 'Siemens Automação e Soluções Industriais',
    manufacturer: 'Banner Engineering',
    partNumber: 'QS18VP6FP',
    isEquipment: false,
    tags: ['sensor', 'fotoeletrico', 'banner', 'pnp', 'esteira', 'optico'],
    createdAt: '2026-03-15T11:30:00Z',
    lastUpdated: '2026-08-20T15:20:00Z'
  },
  {
    id: 'item-eng-05',
    sku: 'ENG-ESP32-DEV',
    barcode: '7892002002053',
    name: 'Placa Microcontroladora ESP32 NodeMCU 38 Pinos WiFi/BLE',
    department: 'ENGENHARIA',
    category: 'Placas & Prototipagem',
    subcategory: 'Microcontroladores ESP32/ARM',
    description: 'Módulo de desenvolvimento IoT para telemetria de vibração e temperatura em motores da linha 3.',
    quantity: 18,
    minQuantity: 5,
    maxQuantity: 40,
    unit: 'un',
    unitPrice: 48.00,
    location: {
      warehouse: 'Laboratório & Almoxarifado de Engenharia',
      aisleRack: 'Gaveteiro IoT',
      shelfBin: 'Gaveta 01 - Placas'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'Espressif',
    partNumber: 'ESP-WROOM-32',
    isEquipment: false,
    tags: ['esp32', 'iot', 'wifi', 'prototipagem', 'telemetria'],
    createdAt: '2026-04-05T14:00:00Z',
    lastUpdated: '2026-08-26T16:45:00Z'
  },
  {
    id: 'item-eng-06',
    sku: 'ENG-REL-PNOZ',
    barcode: '7892002002060',
    name: 'Relé de Segurança Pilz PNOZ X3 24VAC/DC 3NA 1NF',
    department: 'ENGENHARIA',
    category: 'Automação & Segurança (NR12)',
    subcategory: 'Relés de Segurança Categoria 4',
    description: 'Relé de segurança para intertravamento de portas de máquinas e botões de parada de emergência categoria 4.',
    quantity: 0,
    minQuantity: 2,
    maxQuantity: 8,
    unit: 'un',
    unitPrice: 1650.00,
    location: {
      warehouse: 'Laboratório & Almoxarifado de Engenharia',
      aisleRack: 'Armário Segurança NR12',
      shelfBin: 'Prateleira 01'
    },
    supplier: 'Siemens Automação e Soluções Industriais',
    manufacturer: 'Pilz',
    partNumber: '774310',
    isEquipment: false,
    tags: ['nr12', 'seguranca', 'pilz', 'rele', 'emergencia', 'esgotado'],
    createdAt: '2026-02-12T10:00:00Z',
    lastUpdated: '2026-08-31T07:15:00Z',
    notes: 'URGENTE: Estoque zerado! Peça crítica para segurança operacional de máquinas.'
  },

  // ==================== MANUTENÇÃO ====================
  {
    id: 'item-man-01',
    sku: 'MAN-ROL-6205',
    barcode: '7893003003012',
    name: 'Rolamento Rígido de Esferas SKF 6205-2RSH/C3',
    department: 'MANUTENCAO',
    category: 'Mecânica & Rolamentos',
    subcategory: 'Rolamentos Rígidos de Esferas',
    description: 'Rolamento com vedação de borracha sintética nas duas faces e folga radial C3 para motores elétricos trifásicos.',
    quantity: 24,
    minQuantity: 8,
    maxQuantity: 60,
    unit: 'un',
    unitPrice: 74.50,
    location: {
      warehouse: 'Almoxarifado Geral de Manutenção Mecânica/Elétrica',
      aisleRack: 'Corredor Mecânica 03',
      shelfBin: 'Prateleira B - Gaveta 6205'
    },
    supplier: 'SKF do Brasil Rolamentos & Vedações',
    manufacturer: 'SKF',
    partNumber: '6205-2RSH/C3',
    isEquipment: false,
    tags: ['rolamento', 'skf', '6205', 'motor', 'mecanica'],
    createdAt: '2026-01-08T08:30:00Z',
    lastUpdated: '2026-08-28T11:20:00Z'
  },
  {
    id: 'item-man-02',
    sku: 'MAN-VALV-CPE14',
    barcode: '7893003003029',
    name: 'Válvula Solenoide Pneumática Festo CPE14-M1BH-5J-1/8',
    department: 'MANUTENCAO',
    category: 'Pneumática & Válvulas',
    subcategory: 'Válvulas Solenoides Direcionais',
    description: 'Válvula 5/2 vias monoestável acionamento elétrico 24VDC com retorno por mola mecânica para atuadores pneumáticos.',
    quantity: 6,
    minQuantity: 3,
    maxQuantity: 15,
    unit: 'un',
    unitPrice: 520.00,
    location: {
      warehouse: 'Almoxarifado Geral de Manutenção Mecânica/Elétrica',
      aisleRack: 'Corredor Pneumática 01',
      shelfBin: 'Prateleira C - Caixa 14'
    },
    supplier: 'Festo Pneumática e Automação Ltda',
    manufacturer: 'Festo',
    partNumber: 'CPE14-M1BH-5J-1/8',
    isEquipment: false,
    tags: ['festo', 'pneumatica', 'valvula', 'solenoide', 'cilindro'],
    createdAt: '2026-02-22T13:40:00Z',
    lastUpdated: '2026-08-25T15:00:00Z'
  },
  {
    id: 'item-man-03',
    sku: 'MAN-GRAX-SHC220',
    barcode: '7893003003036',
    name: 'Graxa Sintética Mobilith SHC 220 Cartucho 400g',
    department: 'MANUTENCAO',
    category: 'Lubrificantes & Químicos',
    subcategory: 'Graxas Sintéticas de Alta Temp.',
    description: 'Graxa sintética de alta performance com espessante de complexo de lítio para altas temperaturas (-40°C a +150°C).',
    quantity: 14,
    minQuantity: 6,
    maxQuantity: 48,
    unit: 'un',
    unitPrice: 89.00,
    location: {
      warehouse: 'Almoxarifado Geral de Manutenção Mecânica/Elétrica',
      aisleRack: 'Armário Antifogo Químicos',
      shelfBin: 'Prateleira 02'
    },
    supplier: 'SKF do Brasil Rolamentos & Vedações',
    manufacturer: 'Mobil',
    partNumber: 'MOBILITH-220-400G',
    isEquipment: false,
    tags: ['graxa', 'lubrificante', 'mobil', 'shc220', 'quimico'],
    createdAt: '2026-03-10T10:00:00Z',
    lastUpdated: '2026-08-29T14:10:00Z'
  },
  {
    id: 'item-man-04',
    sku: 'MAN-FER-BOSCH18V',
    barcode: '7893003003043',
    name: 'Parafusadeira e Furadeira de Impacto Bosch GSB 18V-50 Brushless Kit 2 Baterias',
    department: 'MANUTENCAO',
    category: 'Ferramental & Equipamentos',
    subcategory: 'Ferramentas Elétricas a Bateria',
    description: 'Ferramenta a bateria com motor sem escovas de carvão, torque de 50Nm, mandril metálico 13mm e maleta L-BOXX.',
    quantity: 4,
    minQuantity: 1,
    maxQuantity: 6,
    unit: 'kit',
    unitPrice: 1450.00,
    location: {
      warehouse: 'Oficina de Manutenção de Campo',
      aisleRack: 'Armário de Ferramentas Elétricas',
      shelfBin: 'Prateleira 01 - Maletas Bosch'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'Bosch',
    partNumber: 'GSB-18V-50-KIT',
    serialNumbers: ['BSH-18V-0101', 'BSH-18V-0102', 'BSH-18V-0103', 'BSH-18V-0104'],
    isEquipment: true,
    activeLoansCount: 2,
    tags: ['bosch', 'parafusadeira', 'furadeira', '18v', 'ferramenta', 'cautela'],
    createdAt: '2026-01-05T09:00:00Z',
    lastUpdated: '2026-08-30T08:15:00Z',
    notes: 'Exige termo de cautela no empréstimo com verificação do estado das 2 baterias e carregador.'
  },
  {
    id: 'item-man-05',
    sku: 'MAN-EPI-CUT5',
    barcode: '7893003003050',
    name: 'Luva de Proteção Anticorte Nível 5 Volk com Banho Nitrílico (Par)',
    department: 'MANUTENCAO',
    category: 'EPIs & Segurança',
    subcategory: 'Luvas de Proteção Mecânica/Anticorte',
    description: 'Luva de segurança tricotada em fios de HPPE e fibra de vidro com banho em borracha nitrílica. CA 41.520.',
    quantity: 35,
    minQuantity: 15,
    maxQuantity: 100,
    unit: 'par',
    unitPrice: 32.00,
    location: {
      warehouse: 'Almoxarifado Central da Fábrica',
      aisleRack: 'Corredor EPI 02',
      shelfBin: 'Prateleira 01 - Caixa Luvas'
    },
    supplier: 'Kabum & Furukawa Conectividade & TI',
    manufacturer: 'Volk do Brasil',
    partNumber: 'VLK-CUT5-G',
    isEquipment: false,
    tags: ['epi', 'luva', 'anticorte', 'seguranca', 'ca'],
    createdAt: '2026-04-01T08:00:00Z',
    lastUpdated: '2026-08-27T16:00:00Z'
  },
  {
    id: 'item-man-06',
    sku: 'MAN-COR-HTD8M',
    barcode: '7893003003067',
    name: 'Correia Sincronizadora Continental ContiTech HTD 8M-1200 Largura 30mm',
    department: 'MANUTENCAO',
    category: 'Mecânica & Transmissão',
    subcategory: 'Correias Dentadas Sincronizadoras',
    description: 'Correia dentada de borracha de alta resistência para redutores e esteiras transportadoras principais.',
    quantity: 1,
    minQuantity: 3,
    maxQuantity: 12,
    unit: 'un',
    unitPrice: 285.00,
    location: {
      warehouse: 'Almoxarifado Geral de Manutenção Mecânica/Elétrica',
      aisleRack: 'Corredor Mecânica 01',
      shelfBin: 'Ganchos Correias - Posição 08'
    },
    supplier: 'SKF do Brasil Rolamentos & Vedações',
    manufacturer: 'Continental',
    partNumber: 'HTD-1200-8M-30',
    isEquipment: false,
    tags: ['correia', 'dentada', 'sincronizadora', 'continental', 'baixo_estoque'],
    createdAt: '2026-03-20T11:00:00Z',
    lastUpdated: '2026-08-29T15:30:00Z'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-001',
    itemId: 'item-ti-01',
    itemSku: 'TI-NOTE-5440',
    itemName: 'Notebook Dell Latitude 5440 Core i7 16GB SSD 512GB',
    department: 'TI',
    type: 'CAUTELA_RETIRADA',
    quantity: 1,
    unitPrice: 5850.00,
    totalValue: 5850.00,
    reason: 'Cautela para Engenheiro de Automação em viagem técnica à filial Curitiba',
    requester: 'Eng. Fernando Diniz (Matr. 4088)',
    costCenter: 'CC-310 Engenharia de Projetos',
    date: '2026-08-25T14:30:00Z',
    responsibleUser: 'Lucas Silva (TI Almoxarifado)',
    serialNumber: 'BR-LAT-90412',
    notes: 'Acompanha mochila e carregador 65W original'
  },
  {
    id: 'mov-002',
    itemId: 'item-eng-02',
    itemSku: 'ENG-INST-FLUKE179',
    itemName: 'Multímetro Digital Industrial Fluke 179 True RMS',
    department: 'ENGENHARIA',
    type: 'CAUTELA_RETIRADA',
    quantity: 1,
    unitPrice: 3150.00,
    totalValue: 3150.00,
    reason: 'Comissionamento do novo painel elétrico da Linha de Envasamento 04',
    requester: 'Tec. Eletrotécnica Juliana Rios (Matr. 5120)',
    workOrderId: 'OS-2026-089',
    costCenter: 'CC-204 Manutenção Elétrica',
    date: '2026-08-31T08:00:00Z',
    responsibleUser: 'Marcos Paulo (Gestor Almoxarifado)',
    serialNumber: 'FLK-179-0941'
  },
  {
    id: 'mov-003',
    itemId: 'item-man-01',
    itemSku: 'MAN-ROL-6205',
    itemName: 'Rolamento Rígido de Esferas SKF 6205-2RSH/C3',
    department: 'MANUTENCAO',
    type: 'SAIDA',
    quantity: 4,
    unitPrice: 74.50,
    totalValue: 298.00,
    reason: 'Manutenção preventiva com troca de rolamentos do motor da Bomba Hidráulica 02',
    requester: 'Mecânico Rodrigo Gomes',
    workOrderId: 'OS-2026-087',
    costCenter: 'CC-201 Manutenção Mecânica',
    date: '2026-08-28T11:20:00Z',
    responsibleUser: 'Marcos Paulo (Gestor Almoxarifado)'
  },
  {
    id: 'mov-004',
    itemId: 'item-ti-05',
    itemSku: 'TI-SSD-1TB-NV2',
    itemName: 'SSD M.2 NVMe 1TB Kingston NV2 PCIe 4.0',
    department: 'TI',
    type: 'ENTRADA',
    quantity: 10,
    unitPrice: 420.00,
    totalValue: 4200.00,
    reason: 'Recebimento de compra NF-e #44890 - Reposição de estoque programada',
    requester: 'TI Compras',
    costCenter: 'CC-101 TI Infraestrutura',
    date: '2026-08-29T10:10:00Z',
    responsibleUser: 'Lucas Silva (TI Almoxarifado)'
  },
  {
    id: 'mov-005',
    itemId: 'item-eng-06',
    itemSku: 'ENG-REL-PNOZ',
    itemName: 'Relé de Segurança Pilz PNOZ X3 24VAC/DC',
    department: 'ENGENHARIA',
    type: 'SAIDA',
    quantity: 2,
    unitPrice: 1650.00,
    totalValue: 3300.00,
    reason: 'Atendimento emergencial de queima de relé de segurança na Prensa Hidráulica 03',
    requester: 'Eng. Rafael Costa',
    workOrderId: 'OS-2026-088',
    costCenter: 'CC-310 Engenharia de Projetos',
    date: '2026-08-31T07:15:00Z',
    responsibleUser: 'Marcos Paulo (Gestor Almoxarifado)'
  },
  {
    id: 'mov-006',
    itemId: 'item-man-04',
    itemSku: 'MAN-FER-BOSCH18V',
    itemName: 'Parafusadeira e Furadeira Bosch GSB 18V-50 Kit',
    department: 'MANUTENCAO',
    type: 'CAUTELA_RETIRADA',
    quantity: 1,
    unitPrice: 1450.00,
    totalValue: 1450.00,
    reason: 'Instalação de novas canaletas no Galpão 02',
    requester: 'Eletricista Bruno Martins (Matr. 3911)',
    workOrderId: 'OS-2026-090',
    costCenter: 'CC-204 Manutenção Predial',
    date: '2026-08-30T08:15:00Z',
    responsibleUser: 'Marcos Paulo (Gestor Almoxarifado)',
    serialNumber: 'BSH-18V-0101'
  }
];

export const INITIAL_LOANS: EquipmentLoan[] = [
  {
    id: 'loan-01',
    itemId: 'item-ti-01',
    itemSku: 'TI-NOTE-5440',
    itemName: 'Notebook Dell Latitude 5440 Core i7 16GB SSD 512GB',
    serialNumber: 'BR-LAT-90412',
    department: 'TI',
    borrowerName: 'Eng. Fernando Diniz',
    borrowerBadge: 'MAT-4088',
    borrowerDept: 'Engenharia de Automação',
    borrowDate: '2026-08-25T14:30:00Z',
    expectedReturnDate: '2026-09-05T18:00:00Z',
    status: 'ATIVO',
    conditionOnBorrow: 'Novo, com lacre intacto, mochila e carregador 65W USB-C',
    notes: 'Configurado com TIA Portal V18 e softwares de engenharia'
  },
  {
    id: 'loan-02',
    itemId: 'item-eng-02',
    itemSku: 'ENG-INST-FLUKE179',
    itemName: 'Multímetro Digital Fluke 179 True RMS Calibrado',
    serialNumber: 'FLK-179-0941',
    department: 'ENGENHARIA',
    borrowerName: 'Juliana Rios',
    borrowerBadge: 'MAT-5120',
    borrowerDept: 'Manutenção Elétrica Industrial',
    borrowDate: '2026-08-31T08:00:00Z',
    expectedReturnDate: '2026-08-31T18:00:00Z',
    status: 'ATIVO',
    conditionOnBorrow: 'Calibração em dia, pontas de prova de silicone sem avarias',
    workOrderId: 'OS-2026-089',
    notes: 'Uso no Painel da Linha 04'
  },
  {
    id: 'loan-03',
    itemId: 'item-man-04',
    itemSku: 'MAN-FER-BOSCH18V',
    itemName: 'Parafusadeira de Impacto Bosch GSB 18V-50 Kit',
    serialNumber: 'BSH-18V-0101',
    department: 'MANUTENCAO',
    borrowerName: 'Bruno Martins',
    borrowerBadge: 'MAT-3911',
    borrowerDept: 'Manutenção Predial & Fabril',
    borrowDate: '2026-08-28T08:15:00Z',
    expectedReturnDate: '2026-08-29T17:00:00Z',
    status: 'ATRASADO',
    conditionOnBorrow: 'Completo com maleta e 2 baterias 2.0Ah carregadas',
    workOrderId: 'OS-2026-090',
    notes: 'Alerta: Prazo de devolução expirou há 2 dias. Cobrar técnico.'
  },
  {
    id: 'loan-04',
    itemId: 'item-eng-03',
    itemSku: 'ENG-INST-RIGOL',
    itemName: 'Osciloscópio Digital Rigol DS1054Z 50MHz',
    serialNumber: 'RGL-DS-4410',
    department: 'ENGENHARIA',
    borrowerName: 'Lucas Arantes',
    borrowerBadge: 'MAT-4299',
    borrowerDept: 'P&D Eletrônica',
    borrowDate: '2026-08-27T10:00:00Z',
    expectedReturnDate: '2026-09-03T17:00:00Z',
    status: 'ATIVO',
    conditionOnBorrow: 'Acompanha 4 pontas de prova 10X e cabo de força',
    notes: 'Análise de jitter em barramento CAN da bancada experimental'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'OS-2026-089',
    title: 'Comissionamento e Teste de Carga Painel Elétrico Linha 04',
    department: 'ENGENHARIA',
    equipmentOrSystem: 'Painel Geral Linha de Envasamento 04',
    priority: 'ALTA',
    status: 'EM_ANDAMENTO',
    requester: 'Gerência de Produção',
    assignedTechnician: 'Juliana Rios (Eletrotécnica)',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-31T08:00:00Z',
    itemsRequested: [
      { itemId: 'item-eng-02', sku: 'ENG-INST-FLUKE179', itemName: 'Multímetro Digital Fluke 179 True RMS', quantity: 1, unitPrice: 3150.00 }
    ],
    totalCost: 3150.00,
    description: 'Validação de tensão e corrente de partida dos 6 motores trifásicos após instalação dos novos inversores de frequência.'
  },
  {
    id: 'OS-2026-088',
    title: 'Substituição de Relé de Parada de Emergência Prensa 03',
    department: 'MANUTENCAO',
    equipmentOrSystem: 'Prensa Hidráulica Mecalor 50T - Prensa 03',
    priority: 'CRITICA',
    status: 'CONCLUIDA',
    requester: 'Supervisão de Segurança do Trabalho',
    assignedTechnician: 'Rafael Costa (Engenheiro de Manutenção)',
    createdAt: '2026-08-31T06:30:00Z',
    updatedAt: '2026-08-31T08:30:00Z',
    itemsRequested: [
      { itemId: 'item-eng-06', sku: 'ENG-REL-PNOZ', itemName: 'Relé de Segurança Pilz PNOZ X3', quantity: 2, unitPrice: 1650.00 }
    ],
    totalCost: 3300.00,
    description: 'Prensa parada em falha de redundância nos canais de emergência. Necessária substituição imediata para liberação da linha.',
    solutionNotes: 'Substituídos os 2 módulos Pilz com teste de desacionamento bem-sucedido. Máquina liberada.'
  },
  {
    id: 'OS-2026-090',
    title: 'Instalação de Cabeamento e Pontos de Rede TI Galpão 02',
    department: 'TI',
    equipmentOrSystem: 'Infraestrutura de Rede e Câmeras Galpão 02',
    priority: 'MEDIA',
    status: 'AGUARDANDO_PECA',
    requester: 'Logística & Expedição',
    assignedTechnician: 'Lucas Silva (Infraestrutura TI)',
    createdAt: '2026-08-28T14:00:00Z',
    updatedAt: '2026-08-30T17:00:00Z',
    itemsRequested: [
      { itemId: 'item-ti-04', sku: 'TI-CAB-CAT6-F', itemName: 'Cabo de Rede Cat6 Furukawa 305m', quantity: 2, unitPrice: 680.00 },
      { itemId: 'item-man-04', sku: 'MAN-FER-BOSCH18V', itemName: 'Parafusadeira Bosch 18V Kit', quantity: 1, unitPrice: 1450.00 }
    ],
    totalCost: 2810.00,
    description: 'Lançamento de 16 novos pontos de dados para coletores de código de barras e balanças de expedição.'
  }
];
