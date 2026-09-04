import React from 'react';
import { useStock } from '../context/StockContext';
import { Department, StockItem } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickMove: (item?: StockItem, type?: 'ENTRADA' | 'SAIDA') => void;
  onOpenScanner?: () => void;
  onOpenNewItem?: () => void;
  onOpenNewLoan?: () => void;
  onPrintLabel: (item: StockItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickMove,
  onPrintLabel
}) => {
  const { items, movements, loans, workOrders, stats, selectedDept, setSelectedDept } = useStock();

  // Filtered items based on selectedDept
  const filteredItems = selectedDept === 'TODOS' 
    ? items 
    : items.filter(i => i.department === selectedDept);

  // Critical and Low stock items
  const criticalItems = items.filter(i => i.quantity === 0);
  const lowStockItems = items.filter(i => i.quantity > 0 && i.quantity <= i.minQuantity);
  const attentionItems = [...criticalItems, ...lowStockItems].slice(0, 6);

  // Active or Delayed Loans
  const activeLoans = loans.filter(l => l.status === 'ATIVO' || l.status === 'ATRASADO').slice(0, 5);

  // Recent movements
  const recentMovements = movements.slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Department Filter Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-lg">
            🏢
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Visualização por Setor Operacional</h2>
            <p className="text-xs text-slate-500">Filtre os dados ou visualize o almoxarifado consolidado</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['TODOS', 'TI', 'ENGENHARIA', 'MANUTENCAO'] as const).map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {dept === 'MANUTENCAO' ? 'MANUTENÇÃO' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Stock Value */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Valor em Estoque</p>
          <p className="text-3xl font-bold text-slate-900">
            {stats.totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-emerald-600 text-xs mt-2 font-medium">
            {stats.totalItems} itens catalogados
          </p>
        </div>

        {/* Critical & Low Stock */}
        <div 
          onClick={() => onNavigateTab('inventario')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Estoque Baixo / Crítico</p>
          <p className="text-3xl font-bold text-red-500">
            {stats.criticalStockCount + stats.lowStockCount}
          </p>
          <p className="text-slate-400 text-xs mt-2 italic">
            {stats.criticalStockCount > 0 ? `${stats.criticalStockCount} itens esgotados (ação imediata)` : 'Atenção aos pontos de pedido'}
          </p>
        </div>

        {/* Open Work Orders (OS) */}
        <div 
          onClick={() => onNavigateTab('ordens')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">O.S. Abertas</p>
          <p className="text-3xl font-bold text-amber-500">
            {stats.openWorkOrdersCount}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Manutenção & requisições pendentes
          </p>
        </div>

      </div>

      {/* Department Breakdown Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(['TI', 'ENGENHARIA', 'MANUTENCAO'] as Department[]).map(dept => {
          const dStats = stats.departmentBreakdown[dept];
          const isSelected = selectedDept === dept;
          return (
            <div 
              key={dept}
              onClick={() => setSelectedDept(selectedDept === dept ? 'TODOS' : dept)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  dept === 'TI' ? 'bg-blue-100 text-blue-700' :
                  dept === 'ENGENHARIA' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {dept === 'MANUTENCAO' ? 'MANUTENÇÃO' : dept}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {dStats.count} itens
                </span>
              </div>

              <div className="text-xl font-bold text-slate-900 mt-1">
                {dStats.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Reposição:</span>
                <span className={`font-semibold ${dStats.lowStock > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {dStats.lowStock > 0 ? `${dStats.lowStock} itens baixos` : '✓ Estoque regular'}
                </span>
              </div>
            </div>
          );
        })}
      </div>



      {/* Two Columns: Critical Attention & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attention Items: Critical & Low Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">⚠️</span>
              <h3 className="text-sm font-bold text-slate-800">
                Itens com Necessidade de Reposição
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventario')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Ver todos ({stats.criticalStockCount + stats.lowStockCount})
            </button>
          </div>

          <div className="space-y-2.5">
            {attentionItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/70">
                ✓ Nenhum item abaixo do estoque de segurança no momento.
              </div>
            ) : (
              attentionItems.map(item => (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        item.department === 'TI' ? 'bg-blue-100 text-blue-700' :
                        item.department === 'ENGENHARIA' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.department}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      📍 {item.location.warehouse} • {item.location.shelfBin}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${item.quantity === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                        {item.quantity} <span className="text-[10px] text-slate-500 font-normal">{item.unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Mín: {item.minQuantity}</div>
                    </div>

                    <button
                      onClick={() => onOpenQuickMove(item, 'ENTRADA')}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium"
                      title="Registrar Compra / Reposição"
                    >
                      + Entrada
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Movements Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">🔄</span>
              <h3 className="text-sm font-bold text-slate-800">
                Últimas Movimentações no Almoxarifado
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('movimentacoes')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Histórico ({movements.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {recentMovements.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/70">
                Nenhuma movimentação registrada.
              </div>
            ) : (
              recentMovements.map(mov => {
                const isEntry = mov.type === 'ENTRADA' || mov.type === 'CAUTELA_DEVOLUCAO';
                return (
                  <div 
                    key={mov.id}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70 flex items-start justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`p-1.5 rounded-lg shrink-0 ${
                        isEntry ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isEntry ? '📥' : '📤'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 truncate">{mov.itemName}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(mov.date).toLocaleDateString('pt-BR')} {new Date(mov.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {mov.reason}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Por: {mov.requester} • Resp: {mov.responsibleUser}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className={`font-bold ${isEntry ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isEntry ? '+' : '-'}{mov.quantity} un
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {mov.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
