import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { StockItem, Department } from '../types';
import { BarcodeRenderer, QRCodeRenderer } from './BarcodeRenderer';
import { 
  FolderTree, 
  Tag, 
  BellRing, 
  AlertTriangle, 
  AlertOctagon, 
  Search, 
  SlidersHorizontal,
  Plus,
  Download,
  Camera,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Edit2,
  Trash2,
  Link2,
  ExternalLink,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { CategoriesModal } from './CategoriesModal';
import { AlertsModal } from './AlertsModal';

interface InventoryViewProps {
  onOpenNewItem: (dept?: Department) => void;
  onEditItem: (item: StockItem) => void;
  onQuickMove: (item: StockItem, type: 'ENTRADA' | 'SAIDA') => void;
  onPrintLabel: (item: StockItem) => void;
  onOpenLoan: (item: StockItem) => void;
  onOpenScanner: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewItem,
  onEditItem,
  onQuickMove,
  onPrintLabel,
  onOpenLoan,
  onOpenScanner
}) => {
  const { items, updateItem, deleteItem, selectedDept, setSelectedDept, exportToCSV, categories, alerts } = useStock();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('TODAS');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'CRITICAL' | 'AVAILABLE' | 'EQUIPMENT'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedItemDetail, setSelectedItemDetail] = useState<StockItem | null>(null);

  // Reference Link state
  const [editingLinkItem, setEditingLinkItem] = useState<StockItem | null>(null);
  const [linkInput, setLinkInput] = useState('');

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const handleOpenLink = (url: string) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEditLink = (item: StockItem) => {
    setEditingLinkItem(item);
    setLinkInput(item.referenceLink || '');
  };

  const handleSaveLink = () => {
    if (!editingLinkItem) return;
    const trimmed = linkInput.trim();
    const finalUrl = trimmed ? (trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`) : undefined;
    updateItem(editingLinkItem.id, {
      referenceLink: finalUrl
    });

    // If detail modal is open with this item, update its state too
    if (selectedItemDetail && selectedItemDetail.id === editingLinkItem.id) {
      setSelectedItemDetail(prev => prev ? { ...prev, referenceLink: finalUrl } : null);
    }

    setEditingLinkItem(null);
  };

  // Available categories for the currently active department
  const availableCategories = useMemo(() => {
    const relevantItems = selectedDept === 'TODOS' ? items : items.filter(i => i.department === selectedDept);
    const cats = Array.from(new Set(relevantItems.map(i => i.category)));
    return ['TODAS', ...cats];
  }, [items, selectedDept]);

  // Available subcategories for the currently active category / dept
  const availableSubcategories = useMemo(() => {
    let relevantItems = selectedDept === 'TODOS' ? items : items.filter(i => i.department === selectedDept);
    if (selectedCategory !== 'TODAS') {
      relevantItems = relevantItems.filter(i => i.category === selectedCategory);
    }
    const subcats = Array.from(
      new Set(
        relevantItems
          .map(i => i.subcategory)
          .filter((s): s is string => Boolean(s && s.trim().length > 0))
      )
    );
    return ['TODAS', ...subcats];
  }, [items, selectedDept, selectedCategory]);

  // Filtered and searched items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Department match
      if (selectedDept !== 'TODOS' && item.department !== selectedDept) {
        return false;
      }

      // Category match
      if (selectedCategory !== 'TODAS' && item.category !== selectedCategory) {
        return false;
      }

      // Subcategory match
      if (selectedSubcategory !== 'TODAS') {
        if (selectedSubcategory === 'SEM_SUBCATEGORIA') {
          if (item.subcategory && item.subcategory.trim().length > 0) return false;
        } else if (item.subcategory !== selectedSubcategory) {
          return false;
        }
      }

      // Stock status filter
      if (stockStatusFilter === 'CRITICAL' && item.quantity !== 0) return false;
      if (stockStatusFilter === 'LOW' && (item.quantity === 0 || item.quantity > item.minQuantity)) return false;
      if (stockStatusFilter === 'AVAILABLE' && item.quantity === 0) return false;
      if (stockStatusFilter === 'EQUIPMENT' && !item.isEquipment) return false;

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesBarcode = item.barcode.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesSubcategory = item.subcategory?.toLowerCase().includes(query);
        const matchesMfr = item.manufacturer.toLowerCase().includes(query);
        const matchesSupplier = item.supplier.toLowerCase().includes(query);
        const matchesLocation = `${item.location.warehouse} ${item.location.aisleRack} ${item.location.shelfBin}`.toLowerCase().includes(query);
        const matchesPartNum = item.partNumber?.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        const matchesSerials = item.serialNumbers?.some(s => s.toLowerCase().includes(query));

        if (!matchesName && !matchesSku && !matchesBarcode && !matchesCategory && !matchesSubcategory && !matchesMfr && !matchesSupplier && !matchesLocation && !matchesPartNum && !matchesTags && !matchesSerials) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedDept, selectedCategory, selectedSubcategory, stockStatusFilter, searchTerm]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o item "${name}" do estoque?`)) {
      deleteItem(id);
      if (selectedItemDetail?.id === id) {
        setSelectedItemDetail(null);
      }
    }
  };

  const deptAlertCount = useMemo(() => {
    if (selectedDept === 'TODOS') return alerts.length;
    return alerts.filter(a => a.department === selectedDept).length;
  }, [alerts, selectedDept]);

  return (
    <div className="space-y-5">
      
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        
        {/* Search & Actions Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por item, código de barras, categoria, subcategoria, fabricante ou localização..."
              className="w-full bg-slate-100 border-none rounded-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Alerts Trigger Button */}
            <button
              onClick={() => setIsAlertsModalOpen(true)}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
                deptAlertCount > 0 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Central de Alertas de Estoque Baixo"
            >
              <BellRing className={`w-3.5 h-3.5 ${deptAlertCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`} />
              <span>Alertas</span>
              {deptAlertCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                  {deptAlertCount}
                </span>
              )}
            </button>

            {/* Categories Management Button */}
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              title="Gerenciar Categorias e Subcategorias"
            >
              <FolderTree className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Categorias</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              title="Ler código com câmera ou leitor"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Escanear</span>
            </button>

            <button
              onClick={() => exportToCSV('items')}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              title="Exportar dados para planilha CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={() => onOpenNewItem(selectedDept !== 'TODOS' ? selectedDept : 'TI')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Item</span>
            </button>
          </div>

        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['TODOS', 'TI', 'ENGENHARIA', 'MANUTENCAO'] as const).map(dept => (
              <button
                key={dept}
                onClick={() => { 
                  setSelectedDept(dept); 
                  setSelectedCategory('TODAS'); 
                  setSelectedSubcategory('TODAS');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {dept === 'MANUTENCAO' ? 'MANUTENÇÃO' : dept}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Category Dropdown */}
            <div className="flex items-center gap-1">
              <FolderTree className="w-3 h-3 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('TODAS');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 outline-hidden focus:border-blue-500"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'TODAS' ? 'Todas as Categorias' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Dropdown */}
            {availableSubcategories.length > 1 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-400" />
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-indigo-50/50 border border-indigo-200 text-indigo-900 text-xs rounded-xl px-2.5 py-1.5 outline-hidden focus:border-indigo-500"
                >
                  <option value="TODAS">Todas as Subcategorias</option>
                  {availableSubcategories.filter(s => s !== 'TODAS').map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="SEM_SUBCATEGORIA">(Sem Subcategoria)</option>
                </select>
              </div>
            )}

            {/* Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 outline-hidden focus:border-blue-500"
            >
              <option value="ALL">Todos os Níveis</option>
              <option value="AVAILABLE">Disponíveis (&gt; 0)</option>
              <option value="LOW">Estoque Baixo (≤ Mín)</option>
              <option value="CRITICAL">Estoque Crítico (Zerado)</option>
              <option value="EQUIPMENT">Equipamentos / Cautela</option>
            </select>

            {/* Grid/Table Switch */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização em Tabela"
              >
                ☰
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização em Grade"
              >
                ☵
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Items Count and Filter Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong className="text-slate-900">{filteredItems.length}</strong> itens catalogados
          {selectedCategory !== 'TODAS' && (
            <span> em <strong className="text-blue-700">{selectedCategory}</strong></span>
          )}
          {selectedSubcategory !== 'TODAS' && (
            <span> › <strong className="text-indigo-700">{selectedSubcategory}</strong></span>
          )}
        </span>
        {(searchTerm || selectedCategory !== 'TODAS' || selectedSubcategory !== 'TODAS' || stockStatusFilter !== 'ALL' || selectedDept !== 'TODOS') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('TODAS');
              setSelectedSubcategory('TODAS');
              setStockStatusFilter('ALL');
              setSelectedDept('TODOS');
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Main Content Area: Table or Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <span className="text-4xl text-slate-300 block">📦</span>
          <h3 className="text-base font-bold text-slate-800">Nenhum item encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não encontramos nenhum item correspondente aos filtros atuais. Tente ajustar os termos de busca ou cadastrar um novo item.
          </p>
          <button
            onClick={() => onOpenNewItem()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
          >
            Cadastrar Novo Item
          </button>
        </div>
      ) : viewMode === 'table' ? (
        
        /* High-Density Data Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patrimônio / Item</th>
                  <th className="px-4 py-4">Setor</th>
                  <th className="px-4 py-4">Categoria & Subcategoria</th>
                  <th className="px-4 py-4">Localização</th>
                  <th className="px-6 py-4 text-right">Qtd. / Nível Mín</th>
                  <th className="px-6 py-4 text-right">Preço Unit.</th>
                  <th className="px-6 py-4 text-right">Valor Total</th>
                  <th className="px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredItems.map(item => {
                  const isZero = item.quantity === 0;
                  const isLow = item.quantity <= item.minQuantity && !isZero;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 transition-colors group ${
                        isZero ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Item & SKU */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedItemDetail(item)}
                              className="font-medium text-slate-900 text-left hover:text-blue-600 transition-colors line-clamp-1"
                            >
                              {item.name}
                            </button>

                            {/* Botão de Link ao lado do nome */}
                            {item.referenceLink ? (
                              <div className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50/80 p-0.5 shrink-0 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenLink(item.referenceLink!);
                                  }}
                                  className="p-1 hover:bg-blue-100 text-blue-700 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                                  title={`Abrir no navegador: ${item.referenceLink}`}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-semibold hidden sm:inline">Link</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditLink(item);
                                  }}
                                  className="p-1 hover:bg-blue-100 text-blue-500 hover:text-blue-800 rounded-md transition-colors cursor-pointer border-l border-blue-200"
                                  title="Editar link de referência"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditLink(item);
                                }}
                                className="p-1 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Adicionar link de referência (URL do produto / fornecedor)"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {item.isEquipment && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full font-medium">
                                Cautela
                              </span>
                            )}
                            {item.partNumber && (
                              <span className="text-[11px] text-slate-400 font-mono">PN: {item.partNumber}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          item.department === 'TI' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
                          item.department === 'ENGENHARIA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                          'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}>
                          {item.department === 'MANUTENCAO' ? 'MANUT' : item.department}
                        </span>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="px-4 py-4 text-slate-600 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-800 block">{item.category}</span>
                          {item.subcategory && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                              <Tag className="w-2.5 h-2.5" /> {item.subcategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4 text-slate-500 font-mono text-xs">
                        <span className="truncate max-w-[160px] block" title={item.location?.warehouse ? `${item.location.warehouse} | ${item.location.aisleRack} » ${item.location.shelfBin}` : ''}>
                          {(item.location?.aisleRack || item.location?.shelfBin) ? `${item.location.aisleRack || ''} • ${item.location.shelfBin || ''}` : '-'}
                        </span>
                      </td>

                      {/* Stock Level with Pill & Min Indicator */}
                      <td className="px-6 py-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-bold ${
                            isZero ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs text-slate-400">/ {item.minQuantity} {item.unit}</span>
                        </div>
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5">
                            <AlertOctagon className="w-2.5 h-2.5" /> Esgotado
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Baixo (Mín: {item.minQuantity})
                          </span>
                        ) : (
                          <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-right font-mono text-slate-600 text-xs">
                        {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Total Value */}
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900 text-xs">
                        {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onQuickMove(item, 'ENTRADA')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200/60"
                            title="Entrada de Estoque"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onQuickMove(item, 'SAIDA')}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200/60"
                            title="Saída / Baixa de Estoque"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          </button>
                          {item.isEquipment && (
                            <button
                              onClick={() => onOpenLoan(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200/60"
                              title="Termo de Cautela / Empréstimo"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Editar Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg transition-colors"
                            title="Excluir Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* Grid View of Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const isZero = item.quantity === 0;
            const isLow = item.quantity <= item.minQuantity && !isZero;

            return (
              <div 
                key={item.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all group ${
                  isZero 
                    ? 'border-rose-300 hover:border-rose-400 bg-rose-50/10' 
                    : isLow 
                    ? 'border-amber-300 hover:border-amber-400 bg-amber-50/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        item.department === 'TI' ? 'bg-blue-100 text-blue-700' :
                        item.department === 'ENGENHARIA' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.department}
                      </span>
                      {item.isEquipment && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full font-medium">
                          Cautela
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className={`text-base font-bold font-mono ${
                        isZero ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                      </div>
                      <span className={`text-[10px] block ${isLow || isZero ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                        Mín: {item.minQuantity} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Item Name */}
                  <div className="flex items-center justify-between gap-1.5 mt-2">
                    <h4 
                      onClick={() => setSelectedItemDetail(item)}
                      className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1 flex-1"
                    >
                      {item.name}
                    </h4>

                    {/* Botão de Link ao lado do nome */}
                    {item.referenceLink ? (
                      <div className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50/80 p-0.5 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLink(item.referenceLink!);
                          }}
                          className="p-1 hover:bg-blue-100 text-blue-700 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          title={`Abrir no navegador: ${item.referenceLink}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditLink(item);
                          }}
                          className="p-1 hover:bg-blue-100 text-blue-500 hover:text-blue-800 rounded-md transition-colors cursor-pointer border-l border-blue-200"
                          title="Editar link de referência"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditLink(item);
                        }}
                        className="p-1 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Adicionar link de referência (URL do produto / fornecedor)"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Specs & Location */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Categoria:</span>
                      <span className="text-slate-700 font-medium">{item.category}</span>
                    </div>
                    {item.subcategory && (
                      <div className="flex items-center justify-between">
                        <span>Subcategoria:</span>
                        <span className="text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.2 rounded text-[11px]">
                          {item.subcategory}
                        </span>
                      </div>
                    )}
                    {(item.manufacturer || item.partNumber) && (
                      <div className="flex items-center justify-between">
                        <span>Fabricante:</span>
                        <span className="text-slate-700 truncate max-w-[150px]">
                          {item.manufacturer} {item.partNumber ? `(${item.partNumber})` : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Localização:</span>
                      <span className="text-slate-700 font-mono text-[11px]">
                        {(item.location?.aisleRack || item.location?.shelfBin) ? `${item.location.aisleRack || ''} • ${item.location.shelfBin || ''}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Price & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Preço Unitário</span>
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onQuickMove(item, 'ENTRADA')}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-medium transition-colors"
                      title="Entrada"
                    >
                      + Ent
                    </button>
                    <button
                      onClick={() => onQuickMove(item, 'SAIDA')}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-lg text-xs font-medium transition-colors"
                      title="Saída"
                    >
                      - Saí
                    </button>
                    {item.isEquipment && (
                      <button
                        onClick={() => onOpenLoan(item)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-lg text-xs font-medium transition-colors"
                        title="Cautela"
                      >
                        📋
                      </button>
                    )}

                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs cursor-pointer"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      )}

      {/* Item Detail Modal / Drawer */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedItemDetail.department === 'TI' ? 'bg-blue-100 text-blue-700' :
                  selectedItemDetail.department === 'ENGENHARIA' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedItemDetail.department}
                </span>
                <h3 className="text-base font-bold text-slate-900 truncate max-w-sm">
                  {selectedItemDetail.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItemDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              
              {/* Top summary row */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Saldo em Estoque</span>
                  <span className={`text-xl font-bold font-mono ${
                    selectedItemDetail.quantity === 0 ? 'text-rose-600' : 
                    selectedItemDetail.quantity <= selectedItemDetail.minQuantity ? 'text-amber-600' : 
                    'text-slate-900'
                  }`}>
                    {selectedItemDetail.quantity} <span className="text-xs font-normal text-slate-500">{selectedItemDetail.unit}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Nível Mínimo (Alerta)</span>
                  <span className="text-xl font-bold text-amber-600 font-mono">
                    {selectedItemDetail.minQuantity} <span className="text-xs font-normal text-slate-500">{selectedItemDetail.unit}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Valor Total Estocado</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono">
                    {(selectedItemDetail.quantity * selectedItemDetail.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              {/* Detailed specs */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Código de Barras:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedItemDetail.barcode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Categoria:</span>
                    <span className="font-semibold text-slate-900">{selectedItemDetail.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Subcategoria:</span>
                    <span className="font-semibold text-indigo-700">{selectedItemDetail.subcategory || 'Não definida'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fabricante:</span>
                    <span className="font-semibold text-slate-900">{selectedItemDetail.manufacturer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Part Number:</span>
                    <span className="font-mono text-slate-900">{selectedItemDetail.partNumber || 'Não especificado'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Localização Física:</span>
                    <span className="font-mono text-blue-700 font-medium">
                      {selectedItemDetail.location.warehouse} » {selectedItemDetail.location.aisleRack} » {selectedItemDetail.location.shelfBin}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Fornecedor:</span>
                    <span className="font-semibold text-slate-900">{selectedItemDetail.supplier}</span>
                  </div>

                  {/* Link de Referência */}
                  <div className="col-span-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-slate-500 block text-[11px] font-semibold">Link de Referência / Compra:</span>
                      {selectedItemDetail.referenceLink ? (
                        <a
                          href={selectedItemDetail.referenceLink.startsWith('http') ? selectedItemDetail.referenceLink : `https://${selectedItemDetail.referenceLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-blue-600 hover:underline text-xs truncate block mt-0.5"
                          title={selectedItemDetail.referenceLink}
                        >
                          {selectedItemDetail.referenceLink}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs block mt-0.5">Nenhum link cadastrado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedItemDetail.referenceLink && (
                        <button
                          type="button"
                          onClick={() => handleOpenLink(selectedItemDetail.referenceLink!)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditLink(selectedItemDetail)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{selectedItemDetail.referenceLink ? 'Editar' : 'Adicionar Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {selectedItemDetail.description && (
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Descrição:</span>
                    <p className="text-slate-700 text-xs leading-relaxed">{selectedItemDetail.description}</p>
                  </div>
                )}

                {selectedItemDetail.serialNumbers && selectedItemDetail.serialNumbers.length > 0 && (
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">Números de Série:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItemDetail.serialNumbers.map(sn => (
                        <span key={sn} className="font-mono text-[11px] bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                          {sn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Codes Rendering */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-around">
                  <div className="flex flex-col items-center">
                    <BarcodeRenderer value={selectedItemDetail.barcode || selectedItemDetail.sku} width={180} height={42} />
                  </div>
                  <div className="flex flex-col items-center">
                    <QRCodeRenderer value={`ITEM|${selectedItemDetail.sku}|${selectedItemDetail.barcode}`} size={64} />
                    <span className="text-[10px] font-mono text-slate-500 mt-1">QR Code</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onPrintLabel(selectedItemDetail);
                  setSelectedItemDetail(null);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                🏷️ Imprimir Etiqueta
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onQuickMove(selectedItemDetail, 'ENTRADA');
                    setSelectedItemDetail(null);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow-xs flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Entrada
                </button>
                <button
                  onClick={() => {
                    onQuickMove(selectedItemDetail, 'SAIDA');
                    setSelectedItemDetail(null);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow-xs flex items-center gap-1"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> Saída
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Categories modal */}
      <CategoriesModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        initialDept={selectedDept !== 'TODOS' ? selectedDept : undefined}
      />

      {/* Alerts modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        onOpenQuickMove={(item, type) => {
          setIsAlertsModalOpen(false);
          onQuickMove(item, type);
        }}
      />

      {/* Reference Link Edit Modal */}
      {editingLinkItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Link de Referência</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[260px]">{editingLinkItem.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLinkItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Insira ou edite a URL do produto (Mercado Livre, fornecedor, ficha técnica ou cotação).
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL / Link de Referência:</label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="https://exemplo.com.br/produto..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 outline-hidden focus:border-blue-500 font-mono pr-20"
                    autoFocus
                  />
                  {linkInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleOpenLink(linkInput)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Testar e abrir em nova aba"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Testar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              {editingLinkItem.referenceLink && (
                <button
                  type="button"
                  onClick={() => {
                    updateItem(editingLinkItem.id, { referenceLink: undefined });
                    if (selectedItemDetail && selectedItemDetail.id === editingLinkItem.id) {
                      setSelectedItemDetail(prev => prev ? { ...prev, referenceLink: undefined } : null);
                    }
                    setEditingLinkItem(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  Remover link
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingLinkItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

