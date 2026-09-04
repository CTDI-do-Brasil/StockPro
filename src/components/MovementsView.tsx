import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { MovementType, Department, StockMovement } from '../types';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wrench, 
  FileText, 
  SlidersHorizontal, 
  Download, 
  Zap, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  Box, 
  FileCheck2, 
  X,
  Printer
} from 'lucide-react';

interface MovementsViewProps {
  onOpenQuickMove: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({ onOpenQuickMove }) => {
  const { movements, items, selectedDept, setSelectedDept, exportToCSV } = useStock();

  const [typeFilter, setTypeFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('TODOS');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('TODOS');
  const [selectedMovementDetail, setSelectedMovementDetail] = useState<StockMovement | null>(null);

  // Distinct responsible users
  const responsibleUsers = useMemo(() => {
    const users = Array.from(new Set(movements.map(m => m.responsibleUser).filter(Boolean)));
    return ['TODOS', ...users];
  }, [movements]);

  // Distinct items in history
  const distinctItems = useMemo(() => {
    const itemMap = new Map<string, string>();
    movements.forEach(m => {
      itemMap.set(m.itemId, m.itemName);
    });
    return Array.from(itemMap.entries()).map(([id, name]) => ({ id, name }));
  }, [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      // Department
      if (selectedDept !== 'TODOS' && mov.department !== selectedDept) {
        return false;
      }

      // Movement Type
      if (typeFilter !== 'TODOS' && mov.type !== typeFilter) {
        return false;
      }

      // Specific Item Filter
      if (selectedItemFilter !== 'TODOS' && mov.itemId !== selectedItemFilter) {
        return false;
      }

      // Responsible User Filter
      if (selectedUserFilter !== 'TODOS' && mov.responsibleUser !== selectedUserFilter) {
        return false;
      }

      // Date Range
      if (startDate) {
        const mDate = new Date(mov.date).toISOString().slice(0, 10);
        if (mDate < startDate) return false;
      }
      if (endDate) {
        const mDate = new Date(mov.date).toISOString().slice(0, 10);
        if (mDate > endDate) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = mov.itemName.toLowerCase().includes(q);
        const matchesSku = mov.itemSku.toLowerCase().includes(q);
        const matchesReason = mov.reason.toLowerCase().includes(q);
        const matchesReq = mov.requester.toLowerCase().includes(q);
        const matchesOS = mov.workOrderId?.toLowerCase().includes(q);
        const matchesCC = mov.costCenter?.toLowerCase().includes(q);
        const matchesResp = mov.responsibleUser.toLowerCase().includes(q);

        if (!matchesName && !matchesSku && !matchesReason && !matchesReq && !matchesOS && !matchesCC && !matchesResp) {
          return false;
        }
      }

      return true;
    });
  }, [movements, selectedDept, typeFilter, selectedItemFilter, selectedUserFilter, startDate, endDate, searchTerm]);

  // Total summary of filtered movements
  const totalVolume = filteredMovements.reduce((acc, m) => acc + m.quantity, 0);
  const totalFinancial = filteredMovements.reduce((acc, m) => acc + m.totalValue, 0);
  const totalEntries = filteredMovements.filter(m => m.type === 'ENTRADA' || m.type === 'CAUTELA_DEVOLUCAO').reduce((acc, m) => acc + m.quantity, 0);
  const totalExits = filteredMovements.filter(m => m.type === 'SAIDA' || m.type === 'BAIXA_MANUTENCAO' || m.type === 'CAUTELA_RETIRADA').reduce((acc, m) => acc + m.quantity, 0);

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'ENTRADA':
      case 'CAUTELA_DEVOLUCAO':
        return {
          icon: <ArrowUpRight className="w-3.5 h-3.5" />,
          label: type === 'ENTRADA' ? 'Entrada' : 'Devolução Cautela',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
        };
      case 'BAIXA_MANUTENCAO':
        return {
          icon: <Wrench className="w-3.5 h-3.5" />,
          label: 'Baixa Manutenção',
          className: 'bg-amber-50 text-amber-800 border-amber-200/60'
        };
      case 'CAUTELA_RETIRADA':
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          label: 'Retirada Cautela',
          className: 'bg-blue-50 text-blue-700 border-blue-200/60'
        };
      case 'AJUSTE':
        return {
          icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
          label: 'Ajuste Inventário',
          className: 'bg-purple-50 text-purple-700 border-purple-200/60'
        };
      default:
        return {
          icon: <ArrowDownRight className="w-3.5 h-3.5" />,
          label: 'Saída',
          className: 'bg-rose-50 text-rose-700 border-rose-200/60'
        };
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Filter and Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por item, motivo, requisitante, O.S., centro de custo ou responsável..."
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportToCSV('movements')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onOpenQuickMove}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Registrar Movimentação</span>
            </button>
          </div>

        </div>

        {/* Secondary Filter Chips & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { label: 'Todos os Tipos', value: 'TODOS' },
              { label: 'Entradas', value: 'ENTRADA' },
              { label: 'Saídas', value: 'SAIDA' },
              { label: 'Manutenção', value: 'BAIXA_MANUTENCAO' },
              { label: 'Ajustes', value: 'AJUSTE' }
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  typeFilter === t.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Additional Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            {/* Item Filter */}
            {distinctItems.length > 0 && (
              <div className="flex items-center gap-1">
                <Box className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedItemFilter}
                  onChange={(e) => setSelectedItemFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 outline-hidden text-xs focus:border-blue-500 max-w-[150px] truncate"
                >
                  <option value="TODOS">Todos os Itens</option>
                  {distinctItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Operator/Responsible Filter */}
            {responsibleUsers.length > 1 && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedUserFilter}
                  onChange={(e) => setSelectedUserFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 outline-hidden text-xs focus:border-blue-500 max-w-[140px] truncate"
                >
                  <option value="TODOS">Todos os Operadores</option>
                  {responsibleUsers.filter(u => u !== 'TODOS').map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-slate-800 outline-hidden text-xs"
                title="Data inicial"
              />
              <span className="text-slate-400">à</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-slate-800 outline-hidden text-xs"
                title="Data final"
              />
            </div>

            {(startDate || endDate || selectedItemFilter !== 'TODOS' || selectedUserFilter !== 'TODOS' || typeFilter !== 'TODOS' || searchTerm) && (
              <button
                onClick={() => { 
                  setStartDate(''); 
                  setEndDate(''); 
                  setSelectedItemFilter('TODOS');
                  setSelectedUserFilter('TODOS');
                  setTypeFilter('TODOS');
                  setSearchTerm('');
                }}
                className="text-blue-600 hover:underline text-xs font-medium"
              >
                Limpar
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Summary Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Movimentações</span>
          <span className="text-lg font-bold font-mono text-slate-900 mt-1">{filteredMovements.length}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Entradas Registradas</span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1">+{totalEntries} un</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Saídas / Baixas</span>
          <span className="text-lg font-bold font-mono text-rose-600 mt-1">-{totalExits} un</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Valor Total Movimentado</span>
          <span className="text-lg font-bold font-mono text-slate-900 mt-1">
            {totalFinancial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Data & Hora</th>
                <th className="px-4 py-4">Tipo Movimentação</th>
                <th className="px-6 py-4">Item & Código</th>
                <th className="px-4 py-4">Setor</th>
                <th className="px-4 py-4">Motivo / Finalidade</th>
                <th className="px-4 py-4">Requisitante & O.S.</th>
                <th className="px-6 py-4 text-right">Qtd</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-4 py-4">Usuário Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma movimentação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(mov => {
                  const isEntry = mov.type === 'ENTRADA' || mov.type === 'CAUTELA_DEVOLUCAO';
                  const badge = getMovementBadge(mov.type);
                  
                  return (
                    <tr 
                      key={mov.id} 
                      onClick={() => setSelectedMovementDetail(mov)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      
                      {/* Date & Time */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(mov.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(mov.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${badge.className}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Item & SKU */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {mov.itemName}
                        </div>
                        {mov.serialNumber && (
                          <div className="font-mono text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
                              SN: {mov.serialNumber}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          mov.department === 'TI' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
                          mov.department === 'ENGENHARIA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' :
                          'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}>
                          {mov.department === 'MANUTENCAO' ? 'MANUT' : mov.department}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-4 text-slate-600 text-xs max-w-xs">
                        <span className="line-clamp-2">{mov.reason}</span>
                      </td>

                      {/* Requester & OS */}
                      <td className="px-4 py-4 text-slate-600 text-xs">
                        <div className="font-semibold text-slate-800 truncate max-w-[140px]">{mov.requester}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          {mov.workOrderId && (
                            <span className="bg-slate-100 text-blue-700 px-1.5 py-0.2 rounded-md font-mono font-medium">
                              OS: {mov.workOrderId}
                            </span>
                          )}
                          {mov.costCenter && <span>{mov.costCenter}</span>}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span className={isEntry ? 'text-emerald-600' : 'text-rose-600'}>
                          {isEntry ? '+' : '-'}{mov.quantity}
                        </span>
                      </td>

                      {/* Total Value */}
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900 text-xs whitespace-nowrap">
                        {mov.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Operator / Responsible */}
                      <td className="px-4 py-4 text-slate-700 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                            {mov.responsibleUser.charAt(0).toUpperCase()}
                          </div>
                          <span>{mov.responsibleUser}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Detail Receipt Modal */}
      {selectedMovementDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Comprovante de Movimentação</h3>
              </div>
              <button 
                onClick={() => setSelectedMovementDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Protocolo</span>
                  <span className="font-mono font-bold text-slate-900">{selectedMovementDetail.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Data e Hora</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedMovementDetail.date).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedMovementDetail.itemName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Tipo de Movimentação:</span>
                  <span className="font-semibold text-slate-900">{selectedMovementDetail.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Quantidade:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedMovementDetail.quantity} un</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Valor Unitário:</span>
                  <span className="font-mono text-slate-900">
                    {selectedMovementDetail.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Valor Total:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {selectedMovementDetail.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Requisitante:</span>
                  <span className="font-semibold text-slate-900">{selectedMovementDetail.requester}</span>
                </div>
                {selectedMovementDetail.workOrderId && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Ordem de Serviço (O.S.):</span>
                    <span className="font-mono font-semibold text-blue-700">{selectedMovementDetail.workOrderId}</span>
                  </div>
                )}
                {selectedMovementDetail.costCenter && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Centro de Custo:</span>
                    <span className="font-semibold text-slate-900">{selectedMovementDetail.costCenter}</span>
                  </div>
                )}
                {selectedMovementDetail.serialNumber && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedMovementDetail.serialNumber}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Operador Responsável:</span>
                  <span className="font-semibold text-slate-900">{selectedMovementDetail.responsibleUser}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Motivo / Observações:</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg text-slate-700 leading-relaxed border border-slate-100">
                    {selectedMovementDetail.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-medium flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setSelectedMovementDetail(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

