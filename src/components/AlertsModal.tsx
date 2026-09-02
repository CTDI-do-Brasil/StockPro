import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { StockAlert, Department, StockItem } from '../types';
import { 
  X, 
  AlertTriangle, 
  AlertOctagon, 
  TrendingDown, 
  Download, 
  ArrowUpRight, 
  Edit2, 
  Check, 
  Search, 
  Building2, 
  Wrench, 
  Cpu, 
  Package, 
  DollarSign, 
  SlidersHorizontal,
  BellRing
} from 'lucide-react';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickMove: (item: StockItem, type: 'ENTRADA') => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  onOpenQuickMove
}) => {
  const { alerts, items, updateItemMinQuantity, exportToCSV, selectedDept } = useStock();
  const [filterDept, setFilterDept] = useState<Department | 'TODOS'>(selectedDept);
  const [filterSeverity, setFilterSeverity] = useState<'TODOS' | 'CRITICO' | 'BAIXO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inline editing of minQuantity
  const [editingMinItemId, setEditingMinItemId] = useState<string | null>(null);
  const [tempMinValue, setTempMinValue] = useState<number>(0);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(alert => {
    const matchesDept = filterDept === 'TODOS' || alert.department === filterDept;
    const matchesSev = filterSeverity === 'TODOS' || alert.severity === filterSeverity;
    const matchesSearch = searchTerm === '' || 
      alert.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.subcategory && alert.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      alert.location.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSev && matchesSearch;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICO').length;
  const lowCount = alerts.filter(a => a.severity === 'BAIXO').length;
  const totalReplenishCost = alerts.reduce((sum, a) => sum + (a.suggestedPurchaseQty * a.unitPrice), 0);

  const handleStartEditMin = (alert: StockAlert) => {
    setEditingMinItemId(alert.itemId);
    setTempMinValue(alert.minQuantity);
  };

  const handleSaveMin = (itemId: string) => {
    updateItemMinQuantity(itemId, tempMinValue);
    setEditingMinItemId(null);
  };

  const handleTriggerQuickReplenish = (alert: StockAlert) => {
    const originalItem = items.find(i => i.id === alert.itemId);
    if (originalItem) {
      onOpenQuickMove(originalItem, 'ENTRADA');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${criticalCount > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Central de Alertas de Estoque Baixo</h2>
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-full">
                    {alerts.length} pendências
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Itens com saldo em estoque igual ou abaixo do nível mínimo estipulado
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPI Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Estoque Crítico (Zerado)</p>
              <p className="text-xl font-bold text-rose-600 mt-0.5">{criticalCount} itens</p>
              <p className="text-[10px] text-slate-400">Risco iminente de paralisação</p>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Abaixo do Mínimo</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{lowCount} itens</p>
              <p className="text-[10px] text-slate-400">Reposição recomendada</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Custo Estimado Reposição</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {totalReplenishCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-[10px] text-slate-400">Para atingir os níveis ideais</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Department buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterDept('TODOS')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterDept === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterDept('TI')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  filterDept === 'TI' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3 h-3" /> TI
              </button>
              <button
                onClick={() => setFilterDept('ENGENHARIA')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  filterDept === 'ENGENHARIA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3 h-3" /> Eng.
              </button>
              <button
                onClick={() => setFilterDept('MANUTENCAO')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  filterDept === 'MANUTENCAO' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3 h-3" /> Manut.
              </button>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterSeverity('TODOS')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterSeverity === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas Severidades
              </button>
              <button
                onClick={() => setFilterSeverity('CRITICO')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors text-rose-700 ${
                  filterSeverity === 'CRITICO' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-rose-50'
                }`}
              >
                Crítico ({criticalCount})
              </button>
              <button
                onClick={() => setFilterSeverity('BAIXO')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors text-amber-700 ${
                  filterSeverity === 'BAIXO' ? 'bg-amber-600 text-white shadow-xs' : 'hover:bg-amber-50'
                }`}
              >
                Baixo ({lowCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <div className="relative flex-1 lg:w-60">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar item em alerta..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              onClick={() => exportToCSV('alerts')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-200"
              title="Exportar lista de reposição para Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Check className="w-12 h-12 mx-auto mb-2 text-emerald-500 bg-emerald-50 p-2.5 rounded-full" />
              <p className="text-base font-semibold text-slate-800">Nenhum alerta de estoque pendente!</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Todos os itens dos departamentos selecionados estão com saldo de estoque acima do nível mínimo estipulado.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.severity === 'CRITICO';
              const isEditingMin = editingMinItemId === alert.itemId;
              const ratio = alert.minQuantity > 0 ? (alert.currentQuantity / alert.minQuantity) * 100 : 0;

              return (
                <div 
                  key={alert.id}
                  className={`bg-white border rounded-xl p-4 transition-all shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isCritical 
                      ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20' 
                      : 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                  }`}
                >
                  {/* Left: Item Info */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                        isCritical 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {isCritical ? <AlertOctagon className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {isCritical ? 'CRÍTICO • ESGOTADO' : 'ESTOQUE BAIXO'}
                      </span>

                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {alert.itemSku}
                      </span>

                      <span className="text-xs text-slate-500 font-medium">
                        {alert.department} • {alert.category} {alert.subcategory ? `› ${alert.subcategory}` : ''}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{alert.itemName}</h3>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Localização: <strong>{alert.location.warehouse}</strong> ({alert.location.aisleRack} / {alert.location.shelfBin})</span>
                      <span>•</span>
                      <span>Valor Unitário: <strong>{alert.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                    </p>
                  </div>

                  {/* Middle: Stock Levels & Inline Min Config */}
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Estoque Atual</span>
                      <span className={`text-lg font-black ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                        {alert.currentQuantity} <span className="text-xs font-normal text-slate-500">{alert.unit}</span>
                      </span>
                    </div>

                    <div className="w-px h-8 bg-slate-200" />

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Estoque Mínimo</span>
                        {!isEditingMin && (
                          <button
                            onClick={() => handleStartEditMin(alert)}
                            className="text-slate-400 hover:text-blue-600"
                            title="Ajustar nível mínimo de alerta"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {isEditingMin ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={tempMinValue}
                            onChange={e => setTempMinValue(parseInt(e.target.value) || 0)}
                            className="w-14 px-1.5 py-0.5 text-xs border border-blue-400 rounded focus:outline-hidden font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveMin(alert.itemId)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingMinItemId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-base font-semibold text-slate-700">
                          {alert.minQuantity} <span className="text-xs font-normal text-slate-400">{alert.unit}</span>
                        </span>
                      )}
                    </div>

                    <div className="w-px h-8 bg-slate-200" />

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Sugestão Compra</span>
                      <span className="text-base font-bold text-blue-700">
                        +{alert.suggestedPurchaseQty} <span className="text-xs font-normal text-slate-500">{alert.unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Quick Action Button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-1.5 self-end lg:self-center min-w-[170px]">
                    <button
                      onClick={() => handleTriggerQuickReplenish(alert)}
                      className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ArrowUpRight className="w-4 h-4" /> Registrar Entrada
                    </button>
                    <span className="text-[10px] text-center text-slate-400">
                      Custo reposição: {(alert.suggestedPurchaseQty * alert.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {alerts.length} itens monitorados com alerta ativo • Configure o estoque mínimo de qualquer item a qualquer momento.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
