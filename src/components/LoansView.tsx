import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { EquipmentLoan, StockItem } from '../types';

interface LoansViewProps {
  onOpenNewLoan: (item?: StockItem) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({ onOpenNewLoan }) => {
  const { loans, returnLoan, items, exportToCSV } = useStock();

  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'ATRASADO' | 'DEVOLVIDO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [returningLoan, setReturningLoan] = useState<EquipmentLoan | null>(null);
  const [returnCondition, setReturnCondition] = useState('Devolvido em perfeito estado e limpo');
  const [returnNotes, setReturnNotes] = useState('');

  const filteredLoans = loans.filter(l => {
    if (statusFilter !== 'TODOS' && l.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = l.itemName.toLowerCase().includes(q);
      const matchSku = l.itemSku.toLowerCase().includes(q);
      const matchBorrower = l.borrowerName.toLowerCase().includes(q);
      const matchBadge = l.borrowerBadge.toLowerCase().includes(q);
      const matchSerial = l.serialNumber?.toLowerCase().includes(q);
      const matchOS = l.workOrderId?.toLowerCase().includes(q);

      if (!matchName && !matchSku && !matchBorrower && !matchBadge && !matchSerial && !matchOS) {
        return false;
      }
    }
    return true;
  });

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningLoan) return;

    returnLoan(returningLoan.id, returnCondition, returnNotes);
    setReturningLoan(null);
    setReturnCondition('Devolvido em perfeito estado e limpo');
    setReturnNotes('');
  };

  const activeCount = loans.filter(l => l.status === 'ATIVO').length;
  const delayedCount = loans.filter(l => l.status === 'ATRASADO').length;
  const returnedCount = loans.filter(l => l.status === 'DEVOLVIDO').length;

  return (
    <div className="space-y-5">
      
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por equipamento, técnico, matrícula, nº de série, O.S..."
              className="w-full bg-slate-100 border-none rounded-full pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportToCSV('loans')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>📥</span>
              <span>Exportar Termos</span>
            </button>

            <button
              onClick={() => onOpenNewLoan()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>📋</span>
              <span>Nova Cautela</span>
            </button>
          </div>

        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'TODOS' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Todos ({loans.length})
          </button>
          <button
            onClick={() => setStatusFilter('ATIVO')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'ATIVO' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Ativos em Campo ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('ATRASADO')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'ATRASADO' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Atrasados ({delayedCount})
          </button>
          <button
            onClick={() => setStatusFilter('DEVOLVIDO')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'DEVOLVIDO' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Devolvidos ({returnedCount})
          </button>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLoans.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            Nenhuma cautela ou empréstimo encontrado.
          </div>
        ) : (
          filteredLoans.map(loan => {
            const isDelayed = loan.status === 'ATRASADO';
            const isActive = loan.status === 'ATIVO';

            return (
              <div 
                key={loan.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all ${
                  isDelayed ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' :
                  isActive ? 'border-blue-200' : 'border-slate-200 opacity-90'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isDelayed ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      isActive ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {loan.status}
                    </span>

                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      loan.department === 'TI' ? 'bg-blue-100 text-blue-700' :
                      loan.department === 'ENGENHARIA' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {loan.department}
                    </span>
                  </div>

                  {/* Equipment Info */}
                  <h4 className="text-sm font-semibold text-slate-900 mt-2 line-clamp-2">
                    {loan.itemName}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-500 mt-0.5">
                    <span>#{loan.itemSku}</span>
                    {loan.serialNumber && (
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md border border-blue-200 text-[11px]">
                        SN: {loan.serialNumber}
                      </span>
                    )}
                  </div>

                  {/* Borrower Details */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Responsável:</span>
                      <span className="font-semibold text-slate-900">{loan.borrowerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Matrícula / Setor:</span>
                      <span className="text-slate-700">{loan.borrowerBadge} ({loan.borrowerDept})</span>
                    </div>
                    {loan.workOrderId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Ordem de Serviço:</span>
                        <span className="font-mono text-blue-700 font-medium">{loan.workOrderId}</span>
                      </div>
                    )}
                  </div>

                  {/* Dates & Condition */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Data Retirada:</span>
                      <span className="text-slate-700 font-mono">
                        {new Date(loan.borrowDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Devolução Prevista:</span>
                      <span className={`font-mono font-semibold ${isDelayed ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(loan.expectedReturnDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {loan.actualReturnDate && (
                      <div className="flex items-center justify-between text-emerald-700">
                        <span>Devolvido em:</span>
                        <span className="font-mono font-medium">
                          {new Date(loan.actualReturnDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {loan.conditionOnBorrow && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong className="text-slate-700">Entrega:</strong> {loan.conditionOnBorrow}
                    </p>
                  )}
                  {loan.conditionOnReturn && (
                    <p className="text-xs text-emerald-800 mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                      <strong>Devolução:</strong> {loan.conditionOnReturn}
                    </p>
                  )}
                </div>

                {/* Return Action Button */}
                {(isActive || isDelayed) && (
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setReturningLoan(loan)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>Registrar Devolução</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Return Modal */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                📥 Devolução de Cautela
              </h3>
              <button 
                onClick={() => setReturningLoan(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block">Equipamento:</span>
                <span className="text-sm font-semibold text-slate-900 block">{returningLoan.itemName}</span>
                <span className="text-xs text-slate-500 block mt-1">
                  Colaborador: <strong className="text-slate-800">{returningLoan.borrowerName}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Condição / Estado do Equipamento na Devolução:
                </label>
                <input
                  type="text"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Observações de Inspeção / Teste:
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Ex: Equipamento testado na bancada, baterias 100%, sem avarias externas."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturningLoan(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Confirmar Devolução
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
