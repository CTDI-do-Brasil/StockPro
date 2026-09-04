import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  StockItem, 
  StockMovement, 
  EquipmentLoan, 
  WorkOrder, 
  Supplier, 
  WarehouseLocation, 
  Department, 
  MovementType,
  Category,
  StockAlert,
  StockRequest,
  RequestStatus
} from '../types';
import { 
  INITIAL_ITEMS, 
  INITIAL_MOVEMENTS, 
  INITIAL_LOANS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_LOCATIONS,
  INITIAL_CATEGORIES
} from '../data/initialData';

interface StockContextType {
  items: StockItem[];
  movements: StockMovement[];
  loans: EquipmentLoan[];
  workOrders: WorkOrder[];
  requests: StockRequest[];
  suppliers: Supplier[];
  locations: WarehouseLocation[];
  categories: Category[];
  
  // Selected department filter (null = all)
  selectedDept: Department | 'TODOS';
  setSelectedDept: (dept: Department | 'TODOS') => void;

  // Item Actions
  addItem: (item: Omit<StockItem, 'id' | 'createdAt' | 'lastUpdated'>) => StockItem;
  updateItem: (id: string, item: Partial<StockItem>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => StockItem | undefined;
  getItemByBarcodeOrSku: (query: string) => StockItem | undefined;
  updateItemMinQuantity: (itemId: string, newMin: number) => void;
  updateItemSuggestedQuantity: (itemId: string, newSuggested: number) => void;

  // Categories & Subcategories Actions
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, subcategoryName: string) => void;
  deleteSubcategory: (categoryId: string, subcategoryName: string) => void;
  getCategoriesByDept: (dept?: Department) => Category[];

  // Movements & Quick Actions
  registerMovement: (movement: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    requester: string;
    workOrderId?: string;
    costCenter?: string;
    responsibleUser: string;
    serialNumber?: string;
    notes?: string;
    unitPrice?: number;
  }) => StockMovement | null;
  getMovementsByItemId: (itemId: string) => StockMovement[];

  // Equipment Loans (Cautela)
  createLoan: (loan: Omit<EquipmentLoan, 'id' | 'status'>) => EquipmentLoan | null;
  returnLoan: (loanId: string, conditionOnReturn: string, notes?: string) => void;

  // Work Orders (Ordens de Serviço)
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'totalCost'>) => WorkOrder;
  updateWorkOrder: (id: string, order: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;

  // Requests (Solicitações de Compras: Uso Imediato vs Reposição de Estoque)
  createRequest: (data: Omit<StockRequest, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status'>) => StockRequest;
  updateRequestStatus: (id: string, status: RequestStatus, responsibleUser?: string, invoiceNumber?: string, notes?: string) => void;
  deleteRequest: (id: string) => void;

  // Suppliers & Locations
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  addLocation: (location: Omit<WarehouseLocation, 'id'>) => void;
  deleteLocation: (id: string) => void;

  // Stock Alerts
  alerts: StockAlert[];

  // Metrics & Stats
  stats: {
    totalItems: number;
    totalStockValue: number;
    lowStockCount: number;
    criticalStockCount: number;
    activeLoansCount: number;
    openWorkOrdersCount: number;
    pendingRequestsCount: number;
    departmentBreakdown: Record<Department, { count: number; value: number; lowStock: number }>;
  };

  // Utilities
  resetToDefaultData: () => void;
  exportDataToJSON: () => string;
  importDataFromJSON: (jsonData: string) => boolean;
  exportToCSV: (type: 'items' | 'movements' | 'loans' | 'alerts') => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ITEMS: 'gestao_estoque_items_v3_clean',
  MOVEMENTS: 'gestao_estoque_movements_v3_clean',
  LOANS: 'gestao_estoque_loans_v3_clean',
  WORK_ORDERS: 'gestao_estoque_work_orders_v3_clean',
  REQUESTS: 'gestao_estoque_requests_v3_clean',
  SUPPLIERS: 'gestao_estoque_suppliers_v3_clean',
  LOCATIONS: 'gestao_estoque_locations_v3_clean',
  CATEGORIES: 'gestao_estoque_categories_v3_clean',
};

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ITEMS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CATEGORIES;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MOVEMENTS;
  });

  const [loans, setLoans] = useState<EquipmentLoan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LOANS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_WORK_ORDERS;
  });

  const [requests, setRequests] = useState<StockRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((r: any) => ({
            ...r,
            status: r.status === 'CANCELADA' ? 'CANCELADO' : r.status === 'PENDENTE' ? 'SOLICITADO' : (r.status || 'SOLICITADO')
          }));
        }
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SUPPLIERS;
  });

  const [locations, setLocations] = useState<WarehouseLocation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LOCATIONS;
  });

  const [selectedDept, setSelectedDept] = useState<Department | 'TODOS'>('TODOS');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  }, [locations]);

  // Item Actions
  const addItem = (itemData: Omit<StockItem, 'id' | 'createdAt' | 'lastUpdated'>): StockItem => {
    const now = new Date().toISOString();
    const newItem: StockItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      lastUpdated: now,
      activeLoansCount: 0
    };

    setItems(prev => [newItem, ...prev]);

    // Register initial entry movement if quantity > 0
    if (newItem.quantity > 0) {
      const initMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        itemId: newItem.id,
        itemSku: newItem.sku,
        itemName: newItem.name,
        department: newItem.department,
        type: 'ENTRADA',
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice,
        totalValue: newItem.quantity * newItem.unitPrice,
        reason: 'Cadastro Inicial de Estoque',
        requester: 'Sistema / Almoxarife',
        date: now,
        responsibleUser: 'Administrador'
      };
      setMovements(prev => [initMovement, ...prev]);
    }

    return newItem;
  };

  const updateItem = (id: string, itemData: Partial<StockItem>) => {
    const now = new Date().toISOString();
    const currentItem = items.find(i => i.id === id);

    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...itemData,
          lastUpdated: now
        };
      }
      return item;
    }));

    // Sincronização inteligente de valores:
    // Se o preço unitário ou dados cadastrais do item foram ajustados:
    // 1) Pedidos anteriores/finalizados (RECEBIDO ou CANCELADO) MANTÊM seus valores históricos originais intactos.
    // 2) Pedidos atuais em aberto (SOLICITADO, EM_COTACAO, COMPRADO) são atualizados para refletir o novo valor ajustado.
    if (itemData.unitPrice !== undefined || itemData.name !== undefined) {
      setRequests(prevRequests => prevRequests.map(req => {
        // Pedidos finalizados ou cancelados não sofrem alterações retroativas
        const isClosed = req.status === 'RECEBIDO' || req.status === 'CANCELADO' || (req.status as any) === 'CANCELADA';
        if (isClosed) {
          return req;
        }

        let hasMatchingItem = false;
        const updatedItems = req.items.map(reqItem => {
          const isMatch = reqItem.itemId === id || (currentItem?.sku && reqItem.sku === currentItem.sku);
          if (isMatch) {
            hasMatchingItem = true;
            const newUnitPrice = itemData.unitPrice !== undefined ? Math.max(0, Number(itemData.unitPrice)) : (reqItem.estimatedUnitPrice || 0);
            const newTotal = (reqItem.quantity || 0) * newUnitPrice;
            return {
              ...reqItem,
              ...(itemData.name ? { itemName: itemData.name } : {}),
              ...(itemData.unit ? { unit: itemData.unit } : {}),
              estimatedUnitPrice: newUnitPrice,
              totalEstimatedPrice: newTotal
            };
          }
          return reqItem;
        });

        if (!hasMatchingItem) {
          return req;
        }

        // Recalcula o total estimado do pedido em aberto
        const newTotalEstimatedValue = updatedItems.reduce(
          (acc, curr) => acc + (curr.totalEstimatedPrice || 0), 
          0
        );

        return {
          ...req,
          items: updatedItems,
          totalEstimatedValue: newTotalEstimatedValue,
          updatedAt: now
        };
      }));
    }
  };

  const updateItemMinQuantity = (itemId: string, newMin: number) => {
    const validMin = Math.max(0, newMin);
    updateItem(itemId, { minQuantity: validMin });
  };

  const updateItemSuggestedQuantity = (itemId: string, newSuggested: number) => {
    const validSuggested = Math.max(1, newSuggested);
    const item = items.find(i => i.id === itemId);
    const newMax = item ? Math.max(item.maxQuantity, item.quantity + validSuggested) : validSuggested;
    updateItem(itemId, { 
      suggestedPurchaseQty: validSuggested,
      maxQuantity: newMax
    });
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getItemById = (id: string) => items.find(item => item.id === id);

  const getItemByBarcodeOrSku = (query: string) => {
    const clean = query.trim().toLowerCase();
    return items.find(item => 
      item.sku.toLowerCase() === clean || 
      item.barcode.toLowerCase() === clean ||
      item.id === clean ||
      (item.partNumber && item.partNumber.toLowerCase() === clean) ||
      (item.serialNumbers && item.serialNumbers.some(sn => sn.toLowerCase() === clean))
    );
  };

  // Categories Actions
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subcategories: categoryData.subcategories || []
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === id) {
        const updated = { ...cat, ...categoryData };
        // If category name changed, update items using old category name
        if (categoryData.name && categoryData.name !== cat.name) {
          setItems(prevItems => prevItems.map(item => 
            item.category === cat.name && item.department === cat.department 
              ? { ...item, category: categoryData.name! } 
              : item
          ));
        }
        return updated;
      }
      return cat;
    }));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addSubcategory = (categoryId: string, subcategoryName: string) => {
    const trimmed = subcategoryName.trim();
    if (!trimmed) return;
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        if (cat.subcategories.includes(trimmed)) return cat;
        return {
          ...cat,
          subcategories: [...cat.subcategories, trimmed]
        };
      }
      return cat;
    }));
  };

  const deleteSubcategory = (categoryId: string, subcategoryName: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter(s => s !== subcategoryName)
        };
      }
      return cat;
    }));
  };

  const getCategoriesByDept = (dept?: Department) => {
    if (!dept || dept === 'TODOS' as any) return categories;
    return categories.filter(c => c.department === dept);
  };

  // Register Stock Movement with immediate quantity balance adjustment
  const registerMovement = (params: {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    requester: string;
    workOrderId?: string;
    costCenter?: string;
    responsibleUser: string;
    serialNumber?: string;
    notes?: string;
    unitPrice?: number;
  }): StockMovement | null => {
    const item = getItemById(params.itemId);
    if (!item) return null;

    const qty = Math.max(1, params.quantity);
    let newQty = item.quantity;
    const now = new Date().toISOString();

    if (params.type === 'ENTRADA' || params.type === 'CAUTELA_DEVOLUCAO') {
      newQty += qty;
    } else if (params.type === 'SAIDA' || params.type === 'CAUTELA_RETIRADA' || params.type === 'BAIXA_MANUTENCAO') {
      newQty = Math.max(0, newQty - qty);
    } else if (params.type === 'AJUSTE') {
      newQty = qty; // In AJUSTE, the input quantity represents the new inventory count
    }

    const price = params.unitPrice !== undefined ? params.unitPrice : item.unitPrice;
    const effectiveQty = params.type === 'AJUSTE' ? Math.abs(qty - item.quantity) : qty;

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      department: item.department,
      type: params.type,
      quantity: params.type === 'AJUSTE' ? qty : qty,
      unitPrice: price,
      totalValue: effectiveQty * price,
      reason: params.reason,
      requester: params.requester,
      workOrderId: params.workOrderId,
      costCenter: params.costCenter,
      date: now,
      responsibleUser: params.responsibleUser || 'Operador Almoxarifado',
      serialNumber: params.serialNumber,
      notes: params.notes
    };

    // Update item quantity
    updateItem(item.id, { quantity: newQty });
    setMovements(prev => [newMovement, ...prev]);

    return newMovement;
  };

  const getMovementsByItemId = (itemId: string) => {
    return movements.filter(m => m.itemId === itemId);
  };

  // Create Loan / Cautela
  const createLoan = (loanData: Omit<EquipmentLoan, 'id' | 'status'>): EquipmentLoan | null => {
    const item = getItemById(loanData.itemId);
    if (!item) return null;

    const now = new Date().toISOString();
    const newLoan: EquipmentLoan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      status: 'ATIVO'
    };

    // Deduct stock or mark loan
    const newStock = Math.max(0, item.quantity - 1);
    const activeCount = (item.activeLoansCount || 0) + 1;
    
    updateItem(item.id, {
      quantity: newStock,
      activeLoansCount: activeCount
    });

    // Record movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      department: item.department,
      type: 'CAUTELA_RETIRADA',
      quantity: 1,
      unitPrice: item.unitPrice,
      totalValue: item.unitPrice,
      reason: `Cautela/Empréstimo para ${loanData.borrowerName} (${loanData.borrowerBadge || 'Setor: ' + loanData.borrowerDept})`,
      requester: loanData.borrowerName,
      workOrderId: loanData.workOrderId,
      date: now,
      responsibleUser: 'Responsável Cautela',
      serialNumber: loanData.serialNumber,
      notes: loanData.conditionOnBorrow
    };

    setLoans(prev => [newLoan, ...prev]);
    setMovements(prev => [newMovement, ...prev]);

    return newLoan;
  };

  // Return Loan / Baixa de Cautela
  const returnLoan = (loanId: string, conditionOnReturn: string, notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const now = new Date().toISOString();
    const item = getItemById(loan.itemId);

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'DEVOLVIDO',
          actualReturnDate: now,
          conditionOnReturn,
          notes: notes ? `${l.notes || ''} | Devolução: ${notes}` : l.notes
        };
      }
      return l;
    }));

    if (item) {
      updateItem(item.id, {
        quantity: item.quantity + 1,
        activeLoansCount: Math.max(0, (item.activeLoansCount || 1) - 1)
      });

      const returnMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        department: item.department,
        type: 'CAUTELA_DEVOLUCAO',
        quantity: 1,
        unitPrice: item.unitPrice,
        totalValue: item.unitPrice,
        reason: `Devolução de Cautela por ${loan.borrowerName} - Estado: ${conditionOnReturn}`,
        requester: loan.borrowerName,
        workOrderId: loan.workOrderId,
        date: now,
        responsibleUser: 'Responsável Almoxarifado',
        serialNumber: loan.serialNumber,
        notes
      };

      setMovements(prev => [returnMovement, ...prev]);
    }
  };

  // Work Orders
  const createWorkOrder = (orderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'totalCost'>): WorkOrder => {
    const now = new Date().toISOString();
    const totalCost = orderData.itemsRequested.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    
    const count = workOrders.length + 1;
    const year = new Date().getFullYear();
    const formattedId = `OS-${year}-${String(count).padStart(3, '0')}`;

    const newOrder: WorkOrder = {
      ...orderData,
      id: formattedId,
      createdAt: now,
      updatedAt: now,
      totalCost
    };

    setWorkOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateWorkOrder = (id: string, data: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const updated = { ...wo, ...data, updatedAt: new Date().toISOString() };
        if (data.itemsRequested) {
          updated.totalCost = data.itemsRequested.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
        }
        return updated;
      }
      return wo;
    }));
  };

  const deleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
  };

  // Requests (Solicitações de Compras: Uso Imediato vs Reposição de Estoque)
  const createRequest = (data: Omit<StockRequest, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status'>): StockRequest => {
    const now = new Date().toISOString();
    const count = requests.length + 1;
    const year = new Date().getFullYear();
    const prefix = data.destination === 'REPOSICAO_ESTOQUE' ? 'SC-EST' : 'SC-DIR';
    const code = `${prefix}-${year}-${String(count).padStart(3, '0')}`;

    const newRequest: StockRequest = {
      ...data,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      status: 'SOLICITADO',
      createdAt: now,
      updatedAt: now
    };

    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const updateRequestStatus = (
    id: string, 
    status: RequestStatus | 'CANCELADA', 
    responsibleUser?: string, 
    invoiceNumber?: string,
    notes?: string
  ) => {
    const canonicalStatus: RequestStatus = (status as any) === 'CANCELADA' ? 'CANCELADO' : (status as RequestStatus);
    const now = new Date().toISOString();

    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;

      // Se a compra for marcada como RECEBIDO e ainda não tiver sido recebida:
      if (canonicalStatus === 'RECEBIDO' && req.status !== 'RECEBIDO') {
        // Se a finalidade for REPOSIÇÃO DE ESTOQUE, dá ENTRADA AUTOMÁTICA no saldo do estoque
        if (req.destination === 'REPOSICAO_ESTOQUE') {
          req.items.forEach(reqItem => {
            if (reqItem.itemId) {
              // Item já existente no inventário
              setItems(currentItems => currentItems.map(item => {
                if (item.id === reqItem.itemId) {
                  return {
                    ...item,
                    quantity: item.quantity + reqItem.quantity,
                    unitPrice: reqItem.estimatedUnitPrice && reqItem.estimatedUnitPrice > 0 ? reqItem.estimatedUnitPrice : item.unitPrice,
                    lastUpdated: now
                  };
                }
                return item;
              }));

              const movNow = new Date().toISOString();
              const newMovement: StockMovement = {
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                itemId: reqItem.itemId,
                itemSku: reqItem.sku || 'N/A',
                itemName: reqItem.itemName,
                department: req.department,
                type: 'ENTRADA',
                quantity: reqItem.quantity,
                unitPrice: reqItem.estimatedUnitPrice || 0,
                totalValue: reqItem.quantity * (reqItem.estimatedUnitPrice || 0),
                reason: `Recebimento de Compra #${req.code} (Reposição de Estoque)${invoiceNumber ? ` - NF: ${invoiceNumber}` : ''}`,
                requester: req.requester,
                date: movNow,
                responsibleUser: responsibleUser || 'Almoxarife'
              };
              setMovements(curMovements => [newMovement, ...curMovements]);
            } else {
              // Item novo ainda não cadastrado no inventário: cadastra automaticamente e dá entrada
              const newItemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              const generatedSku = reqItem.sku || `SKU-${Date.now().toString().slice(-6)}`;
              const newItem: StockItem = {
                id: newItemId,
                name: reqItem.itemName,
                sku: generatedSku,
                barcode: '',
                department: req.department,
                category: 'Geral',
                description: `Material adquirido via Solicitação de Compra #${req.code}`,
                quantity: reqItem.quantity,
                minQuantity: 1,
                maxQuantity: reqItem.quantity * 2,
                unit: reqItem.unit || 'un',
                unitPrice: reqItem.estimatedUnitPrice || 0,
                location: { warehouse: 'Almoxarifado Principal', aisleRack: 'Geral', shelfBin: 'A-01' },
                supplier: reqItem.supplierSuggested || '',
                manufacturer: '',
                isEquipment: false,
                tags: ['compra_nova'],
                createdAt: now,
                lastUpdated: now
              };
              setItems(currentItems => [newItem, ...currentItems]);

              const movNow = new Date().toISOString();
              const newMovement: StockMovement = {
                id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                itemId: newItemId,
                itemSku: generatedSku,
                itemName: reqItem.itemName,
                department: req.department,
                type: 'ENTRADA',
                quantity: reqItem.quantity,
                unitPrice: reqItem.estimatedUnitPrice || 0,
                totalValue: reqItem.quantity * (reqItem.estimatedUnitPrice || 0),
                reason: `Recebimento e Cadastro de Novo Item #${req.code}${invoiceNumber ? ` - NF: ${invoiceNumber}` : ''}`,
                requester: req.requester,
                date: movNow,
                responsibleUser: responsibleUser || 'Almoxarife'
              };
              setMovements(curMovements => [newMovement, ...curMovements]);
            }
          });
        }
        // Se a finalidade for USO_IMEDIATO: a mercadoria vai direto para o solicitante/aplicação, não altera o saldo de estoque
      }

      return {
        ...req,
        status: canonicalStatus,
        purchasedAt: canonicalStatus === 'COMPRADO' ? now : req.purchasedAt,
        receivedAt: canonicalStatus === 'RECEBIDO' ? now : req.receivedAt,
        receivedBy: canonicalStatus === 'RECEBIDO' ? (responsibleUser || 'Almoxarife') : req.receivedBy,
        invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : req.invoiceNumber,
        notes: notes !== undefined ? notes : req.notes,
        updatedAt: now
      };
    }));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  // Suppliers & Locations
  const addSupplier = (sup: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...sup, id: `sup-${Date.now()}` };
    setSuppliers(prev => [...prev, newSup]);
  };

  const updateSupplier = (id: string, sup: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...sup } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addLocation = (loc: Omit<WarehouseLocation, 'id'>) => {
    const newLoc: WarehouseLocation = { ...loc, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLoc]);
  };

  const deleteLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  // Computed Stock Alerts (Items <= minQuantity)
  const alerts = useMemo<StockAlert[]>(() => {
    const result: StockAlert[] = [];

    items.forEach(item => {
      if (item.quantity <= item.minQuantity) {
        const isCritical = item.quantity === 0;
        const suggested = item.suggestedPurchaseQty !== undefined && item.suggestedPurchaseQty > 0
          ? item.suggestedPurchaseQty
          : Math.max(item.maxQuantity - item.quantity, (item.minQuantity * 2) - item.quantity, 1);

        result.push({
          id: `alert-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          itemSku: item.sku,
          department: item.department,
          category: item.category,
          subcategory: item.subcategory,
          currentQuantity: item.quantity,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          location: item.location,
          severity: isCritical ? 'CRITICO' : 'BAIXO',
          suggestedPurchaseQty: suggested
        });
      }
    });

    // Sort critical first, then by ratio of stock to minQuantity
    return result.sort((a, b) => {
      if (a.severity === 'CRITICO' && b.severity !== 'CRITICO') return -1;
      if (b.severity === 'CRITICO' && a.severity !== 'CRITICO') return 1;
      return (a.currentQuantity / (a.minQuantity || 1)) - (b.currentQuantity / (b.minQuantity || 1));
    });
  }, [items]);

  // Calculate Metrics
  const stats = useMemo(() => {
    const filteredItems = selectedDept === 'TODOS' 
      ? items 
      : items.filter(i => i.department === selectedDept);

    let totalStockValue = 0;
    let lowStockCount = 0;
    let criticalStockCount = 0;

    const deptBreakdown: Record<Department, { count: number; value: number; lowStock: number }> = {
      TI: { count: 0, value: 0, lowStock: 0 },
      ENGENHARIA: { count: 0, value: 0, lowStock: 0 },
      MANUTENCAO: { count: 0, value: 0, lowStock: 0 },
    };

    items.forEach(item => {
      const val = item.quantity * item.unitPrice;
      const isLow = item.quantity <= item.minQuantity && item.quantity > 0;
      const isCritical = item.quantity === 0;

      deptBreakdown[item.department].count += 1;
      deptBreakdown[item.department].value += val;
      if (isLow || isCritical) {
        deptBreakdown[item.department].lowStock += 1;
      }
    });

    filteredItems.forEach(item => {
      totalStockValue += item.quantity * item.unitPrice;
      if (item.quantity === 0) {
        criticalStockCount += 1;
      } else if (item.quantity <= item.minQuantity) {
        lowStockCount += 1;
      }
    });

    const activeLoans = loans.filter(l => l.status === 'ATIVO' || l.status === 'ATRASADO');
    const openOrders = workOrders.filter(w => w.status !== 'CONCLUIDA');
    const pendingReqs = requests.filter(r => r.status === 'SOLICITADO' || r.status === 'EM_COTACAO' || r.status === 'COMPRADO');

    return {
      totalItems: filteredItems.length,
      totalStockValue,
      lowStockCount,
      criticalStockCount,
      activeLoansCount: activeLoans.length,
      openWorkOrdersCount: openOrders.length,
      pendingRequestsCount: pendingReqs.length,
      departmentBreakdown: deptBreakdown
    };
  }, [items, loans, workOrders, requests, selectedDept]);

  // Reset to default sample
  const resetToDefaultData = () => {
    setItems(INITIAL_ITEMS);
    setCategories(INITIAL_CATEGORIES);
    setMovements(INITIAL_MOVEMENTS);
    setLoans(INITIAL_LOANS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setRequests([]);
    setSuppliers(INITIAL_SUPPLIERS);
    setLocations(INITIAL_LOCATIONS);
    localStorage.clear();
  };

  // Export JSON
  const exportDataToJSON = () => {
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      items,
      categories,
      movements,
      loans,
      workOrders,
      requests,
      suppliers,
      locations
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  // Import JSON
  const importDataFromJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.items && Array.isArray(parsed.items)) {
        setItems(parsed.items);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.movements) setMovements(parsed.movements);
        if (parsed.loans) setLoans(parsed.loans);
        if (parsed.workOrders) setWorkOrders(parsed.workOrders);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.locations) setLocations(parsed.locations);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // Export CSV
  const exportToCSV = (type: 'items' | 'movements' | 'loans' | 'alerts') => {
    let csvContent = '';
    let filename = '';

    if (type === 'items') {
      filename = `estoque_ti_eng_manutencao_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['ID', 'SKU', 'Codigo_Barras', 'Nome', 'Departamento', 'Categoria', 'Subcategoria', 'Quantidade', 'Unidade', 'Estoque_Min', 'Preco_Unitario_BRL', 'Valor_Total_BRL', 'Almoxarifado', 'Corredor_Rack', 'Prateleira_Gaveta', 'Fornecedor', 'Fabricante', 'Part_Number', 'Equipamento'];
      const rows = items.map(i => [
        `"${i.id}"`,
        `"${i.sku}"`,
        `"${i.barcode}"`,
        `"${i.name.replace(/"/g, '""')}"`,
        `"${i.department}"`,
        `"${i.category}"`,
        `"${i.subcategory || ''}"`,
        i.quantity,
        `"${i.unit}"`,
        i.minQuantity,
        i.unitPrice.toFixed(2),
        (i.quantity * i.unitPrice).toFixed(2),
        `"${i.location.warehouse}"`,
        `"${i.location.aisleRack}"`,
        `"${i.location.shelfBin}"`,
        `"${i.supplier}"`,
        `"${i.manufacturer}"`,
        `"${i.partNumber || ''}"`,
        i.isEquipment ? 'SIM' : 'NAO'
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'movements') {
      filename = `movimentacoes_estoque_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['ID_Mov', 'Data', 'Tipo', 'SKU', 'Item', 'Departamento', 'Quantidade', 'Valor_Unit_BRL', 'Valor_Total_BRL', 'Motivo', 'Requisitante', 'Ordem_Servico', 'Centro_Custo', 'Responsavel_Almox'];
      const rows = movements.map(m => [
        `"${m.id}"`,
        `"${new Date(m.date).toLocaleString('pt-BR')}"`,
        `"${m.type}"`,
        `"${m.itemSku}"`,
        `"${m.itemName.replace(/"/g, '""')}"`,
        `"${m.department}"`,
        m.quantity,
        m.unitPrice.toFixed(2),
        m.totalValue.toFixed(2),
        `"${m.reason.replace(/"/g, '""')}"`,
        `"${m.requester}"`,
        `"${m.workOrderId || ''}"`,
        `"${m.costCenter || ''}"`,
        `"${m.responsibleUser}"`
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'loans') {
      filename = `cautelas_emprestimos_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['ID_Cautela', 'Status', 'Item', 'SKU', 'Num_Serie', 'Colaborador', 'Matricula', 'Setor', 'Data_Retirada', 'Data_Prevista_Devolucao', 'Data_Efetiva_Devolucao', 'Estado_Retirada', 'Estado_Devolucao'];
      const rows = loans.map(l => [
        `"${l.id}"`,
        `"${l.status}"`,
        `"${l.itemName.replace(/"/g, '""')}"`,
        `"${l.itemSku}"`,
        `"${l.serialNumber || ''}"`,
        `"${l.borrowerName}"`,
        `"${l.borrowerBadge}"`,
        `"${l.borrowerDept}"`,
        `"${new Date(l.borrowDate).toLocaleDateString('pt-BR')}"`,
        `"${new Date(l.expectedReturnDate).toLocaleDateString('pt-BR')}"`,
        `"${l.actualReturnDate ? new Date(l.actualReturnDate).toLocaleDateString('pt-BR') : ''}"`,
        `"${l.conditionOnBorrow.replace(/"/g, '""')}"`,
        `"${(l.conditionOnReturn || '').replace(/"/g, '""')}"`
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    } else if (type === 'alerts') {
      filename = `alertas_estoque_baixo_reposicao_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['SKU', 'Item', 'Departamento', 'Categoria', 'Subcategoria', 'Estoque_Atual', 'Estoque_Minimo', 'Estoque_Maximo', 'Unidade', 'Preco_Unit_BRL', 'Qtd_Sugerida_Compra', 'Custo_Estimado_Reposicao_BRL', 'Localizacao', 'Severidade'];
      const rows = alerts.map(a => [
        `"${a.itemSku}"`,
        `"${a.itemName.replace(/"/g, '""')}"`,
        `"${a.department}"`,
        `"${a.category}"`,
        `"${a.subcategory || ''}"`,
        a.currentQuantity,
        a.minQuantity,
        a.maxQuantity,
        `"${a.unit}"`,
        a.unitPrice.toFixed(2),
        a.suggestedPurchaseQty,
        (a.suggestedPurchaseQty * a.unitPrice).toFixed(2),
        `"${a.location.warehouse} - ${a.location.aisleRack} (${a.location.shelfBin})"`,
        `"${a.severity}"`
      ]);
      csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <StockContext.Provider value={{
      items,
      categories,
      movements,
      loans,
      workOrders,
      suppliers,
      locations,
      selectedDept,
      setSelectedDept,
      addItem,
      updateItem,
      updateItemMinQuantity,
      updateItemSuggestedQuantity,
      deleteItem,
      getItemById,
      getItemByBarcodeOrSku,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubcategory,
      deleteSubcategory,
      getCategoriesByDept,
      registerMovement,
      getMovementsByItemId,
      createLoan,
      returnLoan,
      createWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
      requests,
      createRequest,
      updateRequestStatus,
      deleteRequest,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addLocation,
      deleteLocation,
      alerts,
      stats,
      resetToDefaultData,
      exportDataToJSON,
      importDataFromJSON,
      exportToCSV
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
