import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { Department, RequestStatus, RequestPriority, StockRequest } from '../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  User as UserIcon, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  Printer,
  Trash2,
  Boxes
} from 'lucide-react';
import { NewRequestModal } from './NewRequestModal';

export const RequestsView: React.FC = () => {
  const { requests, items, updateRequestStatus, deleteRequest, selectedDept, setSelectedDept } = useStock();
  const { user } = useAuth();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'TODOS'>('TODOS');
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'TODAS'>('TODAS');

  // Stats calculation
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'PENDENTE').length;
  const inProgressCount = requests.filter(r => r.status === 'EM_SEPARACAO').length;
  const fulfilledCount = requests.filter(r => r.status === 'ATENDIDA').length;

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Dept filter
      if (selectedDept !== 'TODOS' && req.department !== selectedDept) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'TODOS' && req.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'TODAS' && req.priority !== priorityFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCode = req.code.toLowerCase().includes(term);
        const matchesRequester = req.requester.toLowerCase().includes(term);
        const matchesReason = req.reason.toLowerCase().includes(term);
        const matchesItem = req.items.some(i => i.itemName.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term));
        return matchesCode || matchesRequester || matchesReason || matchesItem;
      }

      return true;
    });
  }, [requests, selectedDept, statusFilter, priorityFilter, searchTerm]);

  const handlePrintReceipt = (req: StockRequest) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = req.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${item.sku}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.itemName}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${item.quantity} ${item.unit}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprovante de Solicitação - ${req.code}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0f172a; padding-bottom: 15px; }
            .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 13px; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; gap: 40px; }
            .sig-line { flex: 1; border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">CTDI - Controle de Estoque & Almoxarifado</h2>
            <p style="margin:4px 0 0 0; font-size: 13px; color: #64748b;">Comprovante de Entrega e Requisição de Materiais</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
            <div>
              <p style="margin: 3px 0;"><strong>Solicitação:</strong> ${req.code}</p>
              <p style="margin: 3px 0;"><strong>Solicitante:</strong> ${req.requester}</p>
              <p style="margin: 3px 0;"><strong>Departamento:</strong> ${req.department}</p>
            </div>
            <div>
              <p style="margin: 3px 0;"><strong>Data de Abertura:</strong> ${new Date(req.createdAt).toLocaleString('pt-BR')}</p>
              <p style="margin: 3px 0;"><strong>Status:</strong> ${req.status}</p>
              <p style="margin: 3px 0;"><strong>Motivo / Destino:</strong> ${req.reason}</p>
            </div>
          </div>

          <h4>Itens Requisitados:</h4>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Descrição do Item</th>
                <th style="text-align: center;">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-line">
              <strong>${req.requester}</strong><br>
              Assinatura do Solicitante / Recebedor
            </div>
            <div class="sig-line">
              <strong>${req.fulfilledBy || 'Almoxarife Responsável'}</strong><br>
              Assinatura do Almoxarifado
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleStatusChange = (req: StockRequest, newStatus: RequestStatus) => {
    if (newStatus === 'ATENDIDA') {
      // Check if stock has enough
      const insufficientItems = req.items.filter(reqItem => {
        const stockItem = items.find(i => i.id === reqItem.itemId);
        return !stockItem || stockItem.quantity < reqItem.quantity;
      });

      if (insufficientItems.length > 0) {
        const names = insufficientItems.map(i => i.itemName).join(', ');
        const confirmAnyway = window.confirm(
          `Atenção: Os seguintes itens não possuem saldo suficiente em estoque no momento:\n\n${names}\n\nDeseja realizar a baixa mesmo assim (o saldo ficará zerado)?`
        );
        if (!confirmAnyway) return;
      } else {
        const confirmFulfill = window.confirm(
          `Confirmar atendimento da solicitação #${req.code}?\n\nIsso dará baixa automática de ${req.items.length} item(ns) no estoque e registrará as movimentações de saída.`
        );
        if (!confirmFulfill) return;
      }
    }

    updateRequestStatus(req.id, newStatus, user?.name || 'Almoxarife');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </span>
            Solicitações de Peças & Materiais
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle de requisições, acompanhamento de separação e baixas automáticas de estoque
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Department Selector */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as Department | 'TODOS')}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 font-medium shadow-xs"
          >
            <option value="TODOS">Todos os Departamentos</option>
            <option value="TI">TI</option>
            <option value="ENGENHARIA">Engenharia</option>
            <option value="MANUTENCAO">Manutenção</option>
          </select>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>TOTAL DE PEDIDOS</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalRequests}</div>
          <div className="text-[11px] text-slate-400 mt-1">Requisições no histórico</div>
        </div>

        {/* Pendentes */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'PENDENTE' ? 'TODOS' : 'PENDENTE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'PENDENTE' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
            <span>PENDENTES</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-[11px] text-amber-700/80 mt-1">Aguardando atendimento</div>
        </div>

        {/* Em Separação */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'EM_SEPARACAO' ? 'TODOS' : 'EM_SEPARACAO')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'EM_SEPARACAO' ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold mb-1">
            <span>EM SEPARAÇÃO</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
          <div className="text-[11px] text-blue-700/80 mt-1">Em preparo no estoque</div>
        </div>

        {/* Atendidas */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'ATENDIDA' ? 'TODOS' : 'ATENDIDA')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'ATENDIDA' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
            <span>ATENDIDAS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{fulfilledCount}</div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Entregues com baixa realizada</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ex: REQ-2026), solicitante, motivo ou nome da peça..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto shrink-0 pb-1 md:pb-0">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PENDENTE', label: 'Pendentes' },
            { id: 'EM_SEPARACAO', label: 'Em Separação' },
            { id: 'ATENDIDA', label: 'Atendidas' },
            { id: 'CANCELADA', label: 'Canceladas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as RequestStatus | 'TODOS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as RequestPriority | 'TODAS')}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 shrink-0 w-full md:w-auto"
        >
          <option value="TODAS">Todas as Prioridades</option>
          <option value="URGENTE">Urgente</option>
          <option value="ALTA">Alta</option>
          <option value="NORMAL">Normal</option>
          <option value="BAIXA">Baixa</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Nenhuma solicitação encontrada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'TODOS'
                ? 'Tente alterar os termos de busca ou filtros aplicados acima.'
                : 'Clique no botão "Nova Solicitação" para abrir o primeiro pedido de peças.'}
            </p>
            {!searchTerm && statusFilter === 'TODOS' && (
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeira Solicitação</span>
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map(req => {
            const isPending = req.status === 'PENDENTE';
            const isInProgress = req.status === 'EM_SEPARACAO';
            const isFulfilled = req.status === 'ATENDIDA';
            const isCancelled = req.status === 'CANCELADA';

            return (
              <div 
                key={req.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header: Code, Requester, Department, Priority & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{req.code}
                    </span>

                    {/* Department Tag */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      req.department === 'TI'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : req.department === 'ENGENHARIA'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {req.department}
                    </span>

                    {/* Priority Pill */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.priority === 'URGENTE'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : req.priority === 'ALTA'
                        ? 'bg-amber-100 text-amber-800'
                        : req.priority === 'NORMAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.priority === 'URGENTE' && '🔥 '}
                      Prioridade {req.priority}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-800'
                        : isFulfilled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {isInProgress && <Package className="w-3.5 h-3.5 text-blue-600" />}
                      {isFulfilled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {isCancelled && <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                      {req.status === 'PENDENTE' && 'Pendente'}
                      {req.status === 'EM_SEPARACAO' && 'Em Separação'}
                      {req.status === 'ATENDIDA' && 'Atendida / Entregue'}
                      {req.status === 'CANCELADA' && 'Cancelada'}
                    </span>
                  </div>
                </div>

                {/* Details: Requester, Reason, Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Solicitante:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      {req.requester}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Motivo / Aplicação:</span>
                    <span className="font-medium text-slate-800 block mt-0.5">
                      {req.reason}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Data / Horário:</span>
                    <span className="font-medium text-slate-600 flex items-center gap-1.5 mt-0.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(req.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Items List inside card */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Peças Requisitadas ({req.items.length}):
                  </div>

                  <div className="divide-y divide-slate-200/60">
                    {req.items.map(item => {
                      const currentStockItem = items.find(i => i.id === item.itemId);
                      const currentStockQty = currentStockItem ? currentStockItem.quantity : 0;
                      const hasEnoughStock = currentStockQty >= item.quantity;

                      return (
                        <div key={item.itemId} className="py-2 flex items-center justify-between text-xs gap-3">
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 block truncate">{item.itemName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 font-mono">
                            <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold">
                              {item.quantity} {item.unit}
                            </span>

                            {!isFulfilled && !isCancelled && (
                              <span className={`text-[10px] ${hasEnoughStock ? 'text-slate-500' : 'text-rose-600 font-bold'}`}>
                                Saldo em estoque: {currentStockQty} {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional notes or fulfillment info */}
                {req.notes && (
                  <div className="text-xs text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Obs:</strong> {req.notes}
                  </div>
                )}

                {isFulfilled && req.fulfilledAt && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50/70 p-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Atendido por <strong>{req.fulfilledBy}</strong> em {new Date(req.fulfilledAt).toLocaleString('pt-BR')} (baixa realizada no estoque).
                    </span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePrintReceipt(req)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Imprimir comprovante com termo de entrega"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Comprovante</span>
                    </button>

                    {(user?.role === 'ADMIN' || user?.role === 'GERENTE') && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir solicitação #${req.code}?`)) {
                            deleteRequest(req.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Excluir solicitação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status transitions */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req, 'CANCELADA')}
                          className="px-3 py-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleStatusChange(req, 'EM_SEPARACAO')}
                          className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Separar Peças</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(req, 'ATENDIDA')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Atender & Baixar Estoque</span>
                        </button>
                      </>
                    )}

                    {isInProgress && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req, 'CANCELADA')}
                          className="px-3 py-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleStatusChange(req, 'ATENDIDA')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Concluir Atendimento & Baixar Estoque</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

    </div>
  );
};
