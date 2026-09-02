export type Department = 'TI' | 'ENGENHARIA' | 'MANUTENCAO';

export type StockStatus = 'disponivel' | 'baixo' | 'critico' | 'esgotado' | 'em_manutencao' | 'em_cautela';

export type MovementType = 
  | 'ENTRADA' 
  | 'SAIDA' 
  | 'AJUSTE' 
  | 'CAUTELA_RETIRADA' 
  | 'CAUTELA_DEVOLUCAO' 
  | 'BAIXA_MANUTENCAO';

export type UnitType = 'un' | 'm' | 'kg' | 'l' | 'kit' | 'cx' | 'par' | 'rolo';

export interface PhysicalLocation {
  warehouse: string; // Ex: Almoxarifado Central, Sala de Servidores TI, Oficina de Manutenção
  aisleRack: string;  // Ex: Corredor B - Rack 04
  shelfBin: string;   // Ex: Prateleira 3 - Gaveta 12
}

export interface Category {
  id: string;
  name: string;
  department: Department;
  subcategories: string[];
  description?: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  department: Department;
  category: string;
  subcategory?: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: UnitType;
  unitPrice: number;
  location: PhysicalLocation;
  severity: 'CRITICO' | 'BAIXO';
  suggestedPurchaseQty: number;
}

export interface StockItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  department: Department;
  category: string;
  subcategory?: string;
  description: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: UnitType;
  unitPrice: number;
  location: PhysicalLocation;
  supplier: string;
  manufacturer: string;
  partNumber?: string;
  serialNumbers?: string[];
  isEquipment: boolean; // Equipamento rastreável sujeito a cautela/empréstimo
  activeLoansCount?: number;
  tags: string[];
  createdAt: string;
  lastUpdated: string;
  notes?: string;
  specs?: Record<string, string>;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  department: Department;
  type: MovementType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reason: string;
  requester: string;
  workOrderId?: string;
  costCenter?: string;
  date: string;
  responsibleUser: string;
  serialNumber?: string;
  notes?: string;
}

export interface EquipmentLoan {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  serialNumber?: string;
  department: Department;
  borrowerName: string;
  borrowerBadge: string; // Matrícula / Registro
  borrowerDept: string;  // Setor de destino
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'ATIVO' | 'DEVOLVIDO' | 'ATRASADO';
  conditionOnBorrow: string;
  conditionOnReturn?: string;
  workOrderId?: string;
  notes?: string;
}

export type WorkOrderPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type WorkOrderStatus = 'ABERTA' | 'EM_ANDAMENTO' | 'AGUARDANDO_PECA' | 'CONCLUIDA';

export interface WorkOrderItem {
  itemId: string;
  sku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  department: Department;
  equipmentOrSystem: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  requester: string;
  assignedTechnician: string;
  createdAt: string;
  updatedAt: string;
  itemsRequested: WorkOrderItem[];
  totalCost: number;
  description: string;
  solutionNotes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  departments: Department[];
  categories: string[];
  rating: number;
  notes?: string;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  department: Department | 'GERAL';
  type: 'Almoxarifado' | 'Oficina' | 'Sala Técnica' | 'Bancada' | 'Armário';
  capacityNotes?: string;
}

export type UserRole = 'ADMIN' | 'GERENTE' | 'TECNICO' | 'OPERADOR';

export interface User {
  id: string;
  name: string;
  email: string;
  department: Department;
  role: UserRole;
  badge?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
  databaseSource?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: Department;
  role: UserRole;
  badge?: string;
  phone?: string;
}

