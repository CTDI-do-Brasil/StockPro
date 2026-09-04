import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { Department, RequestStatus, RequestPriority, PurchaseDestination, StockRequest } from '../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  User as UserIcon, 
  Calendar, 
  Printer, 
  Trash2, 
  Zap, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  FileText, 
  ExternalLink,
  Building2,
  Receipt,
  X,
  Edit3,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { NewRequestModal } from './NewRequestModal';

export const RequestsView: React.FC = () => {
  const { requests, items, updateRequestStatus, deleteRequest, selectedDept, setSelectedDept } = useStock();
  const { user } = useAuth();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<PurchaseDestination | 'TODOS'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'TODOS'>('TODOS');
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'TODAS'>('TODAS');

  // Receive modal state
  const [receivingRequest, setReceivingRequest] = useState<StockRequest | null>(null);
  const [invoiceInput, setInvoiceInput] = useState('');
  const [receiverInput, setReceiverInput] = useState(user?.name || '');

  // Status edit modal state
  const [editingStatusRequest, setEditingStatusRequest] = useState<StockRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<RequestStatus>('SOLICITADO');
  const [statusInvoiceInput, setStatusInvoiceInput] = useState('');
  const [statusReceiverInput, setStatusReceiverInput] = useState('');
  const [statusNotesInput, setStatusNotesInput] = useState('');

  // Delete confirmation modal state
  const [requestToDelete, setRequestToDelete] = useState<StockRequest | null>(null);

  // Metrics calculation
  const totalRequests = requests.length;
  const inQuotationCount = requests.filter(r => r.status === 'SOLICITADO' || (r.status as any) === 'PENDENTE' || r.status === 'EM_COTACAO').length;
  const purchasedCount = requests.filter(r => r.status === 'COMPRADO').length;
  const receivedCount = requests.filter(r => r.status === 'RECEBIDO').length;

  const totalOpenValue = requests
    .filter(r => r.status !== 'RECEBIDO' && r.status !== 'CANCELADO' && (r.status as any) !== 'CANCELADA')
    .reduce((acc, curr) => acc + (curr.totalEstimatedValue || 0), 0);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Dept filter
      if (selectedDept !== 'TODOS' && req.department !== selectedDept) {
        return false;
      }
      // Destination filter
      if (destinationFilter !== 'TODOS' && req.destination !== destinationFilter) {
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
        const matchesInvoice = (req.invoiceNumber || '').toLowerCase().includes(term);
        const matchesItem = req.items.some(i => 
          i.itemName.toLowerCase().includes(term) || 
          (i.sku || '').toLowerCase().includes(term) ||
          (i.supplierSuggested || '').toLowerCase().includes(term)
        );
        return matchesCode || matchesRequester || matchesReason || matchesInvoice || matchesItem;
      }

      return true;
    });
  }, [requests, selectedDept, destinationFilter, statusFilter, priorityFilter, searchTerm]);

  const handleOpenReceiveModal = (req: StockRequest) => {
    setReceivingRequest(req);
    setInvoiceInput('');
    setReceiverInput(user?.name || '');
  };

  const handleConfirmReceive = () => {
    if (!receivingRequest) return;

    updateRequestStatus(
      receivingRequest.id,
      'RECEBIDO',
      receiverInput.trim() || user?.name || 'Almoxarife',
      invoiceInput.trim() || undefined
    );

    setReceivingRequest(null);
  };

  const handleOpenEditStatus = (req: StockRequest) => {
    setEditingStatusRequest(req);
    const normalized = (req.status as any) === 'CANCELADA' ? 'CANCELADO' : req.status;
    setTargetStatus(normalized || 'SOLICITADO');
    setStatusInvoiceInput(req.invoiceNumber || '');
    setStatusReceiverInput(req.receivedBy || user?.name || '');
    setStatusNotesInput(req.notes || '');
  };

  const handleSaveStatus = () => {
    if (!editingStatusRequest) return;
    updateRequestStatus(
      editingStatusRequest.id,
      targetStatus,
      targetStatus === 'RECEBIDO' ? (statusReceiverInput.trim() || user?.name || 'Almoxarife') : editingStatusRequest.receivedBy,
      targetStatus === 'RECEBIDO' ? (statusInvoiceInput.trim() || undefined) : editingStatusRequest.invoiceNumber,
      statusNotesInput.trim() || undefined
    );
    setEditingStatusRequest(null);
  };

  const handleConfirmDelete = () => {
    if (!requestToDelete) return;
    deleteRequest(requestToDelete.id);
    setRequestToDelete(null);
  };

  const handlePrintRequest = (req: StockRequest) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRows = req.items.map((item, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">
          <strong>${item.itemName}</strong>
          ${item.supplierSuggested ? `<div style="font-size: 11px; color: #64748b;">Fornecedor: ${item.supplierSuggested}</div>` : ''}
          ${item.linkOrReference ? `<div style="font-size: 11px; color: #0284c7;">Ref: ${item.linkOrReference}</div>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${item.quantity} ${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">R$ ${(item.estimatedUnitPrice || 0).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">R$ ${(item.totalEstimatedPrice || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Solicitação de Compra - ${req.code}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #0f172a; font-size: 13px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0f172a; padding-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 12px; }
            .box { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 15px; background: #f8fafc; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; gap: 40px; }
            .sig-line { flex: 1; border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">CTDI - Controle de Estoque & Suprimentos</h2>
            <p style="margin:4px 0 0 0; font-size: 14px; color: #475569;">
              <strong>SOLICITAÇÃO DE COMPRA DE MATERIAIS</strong> - #${req.code}
            </p>
          </div>

          <div class="box" style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 3px 0;"><strong>Destino da Compra:</strong> ${req.destination === 'REPOSICAO_ESTOQUE' ? '📦 Reposição de Estoque (Almoxarifado)' : '⚡ Uso Imediato (Aplicação Direta)'}</p>
              <p style="margin: 3px 0;"><strong>Solicitante:</strong> ${req.requester}</p>
              <p style="margin: 3px 0;"><strong>Departamento:</strong> ${req.department}</p>
              ${req.costCenter ? `<p style="margin: 3px 0;"><strong>Centro de Custo / O.S.:</strong> ${req.costCenter}</p>` : ''}
            </div>
            <div>
              <p style="margin: 3px 0;"><strong>Data de Abertura:</strong> ${new Date(req.createdAt).toLocaleString('pt-BR')}</p>
              <p style="margin: 3px 0;"><strong>Prioridade:</strong> ${req.priority}</p>
              <p style="margin: 3px 0;"><strong>Status Atual:</strong> ${req.status}</p>
              ${req.invoiceNumber ? `<p style="margin: 3px 0;"><strong>Nota Fiscal:</strong> ${req.invoiceNumber}</p>` : ''}
            </div>
          </div>

          <p><strong>Motivo / Justificativa:</strong> ${req.reason}</p>

          <h4>Itens Solicitados:</h4>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Material / Especificação</th>
                <th style="text-align: center;">Qtd</th>
                <th style="text-align: right;">Valor Unit. Est.</th>
                <th style="text-align: right;">Total Est.</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold; padding: 8px;">TOTAL ESTIMADO:</td>
                <td style="text-align: right; font-weight: bold; padding: 8px; color: #0369a1;">R$ ${req.totalEstimatedValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          ${req.notes ? `<p style="margin-top: 20px;"><strong>Observações:</strong> ${req.notes}</p>` : ''}

          <div class="signatures">
            <div class="sig-line">
              <strong>${req.requester}</strong><br>
              Solicitante
            </div>
            <div class="sig-line">
              <strong>Aprovação / Gerência</strong><br>
              Autorização de Compra
            </div>
            <div class="sig-line">
              <strong>${req.receivedBy || 'Almoxarifado'}</strong><br>
              Recebimento / Conferência
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

  return (
    <div className="space-y-6">
      
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </span>
            Solicitações de Compra
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aquisição de materiais para <strong>uso imediato (aplicação direta)</strong> ou <strong>reposição de estoque</strong>
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
            <span>Nova Solicitação de Compra</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Em Cotação / Solicitados */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'SOLICITADO' ? 'TODOS' : 'SOLICITADO')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'SOLICITADO' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
            <span>EM COTAÇÃO / ABERTAS</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{inQuotationCount}</div>
          <div className="text-[11px] text-amber-700/80 mt-1">Aguardando aprovação / compra</div>
        </div>

        {/* Comprados / A caminho */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'COMPRADO' ? 'TODOS' : 'COMPRADO')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'COMPRADO' ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold mb-1">
            <span>PEDIDO EMITIDO</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{purchasedCount}</div>
          <div className="text-[11px] text-blue-700/80 mt-1">A caminho / Aguardando entrega</div>
        </div>

        {/* Recebidos */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'RECEBIDO' ? 'TODOS' : 'RECEBIDO')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'RECEBIDO' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
            <span>RECEBIDOS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{receivedCount}</div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Entregues ou estocados</div>
        </div>

        {/* Total Aberto Valor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>VALOR EM ABERTO</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            R$ {totalOpenValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total de pedidos em andamento</div>
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
            placeholder="Buscar por código (SC-), solicitante, motivo, material, NF ou fornecedor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Destination Filter */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium shrink-0 w-full md:w-auto">
          <button
            onClick={() => setDestinationFilter('TODOS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              destinationFilter === 'TODOS' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos os Tipos
          </button>
          <button
            onClick={() => setDestinationFilter('USO_IMEDIATO')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              destinationFilter === 'USO_IMEDIATO' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Uso Imediato</span>
          </button>
          <button
            onClick={() => setDestinationFilter('REPOSICAO_ESTOQUE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              destinationFilter === 'REPOSICAO_ESTOQUE' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reposição Estoque</span>
          </button>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'TODOS')}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 shrink-0 w-full md:w-auto"
        >
          <option value="TODOS">Todos os Status</option>
          <option value="SOLICITADO">Solicitado</option>
          <option value="EM_COTACAO">Em Cotação</option>
          <option value="COMPRADO">Comprado / Pedido Emitido</option>
          <option value="RECEBIDO">Recebido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

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
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Nenhuma solicitação de compra encontrada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'TODOS' || destinationFilter !== 'TODOS'
                ? 'Tente alterar os filtros ou termos de busca aplicados.'
                : 'Clique no botão "Nova Solicitação de Compra" para abrir a primeira requisição de material.'}
            </p>
            {!searchTerm && statusFilter === 'TODOS' && destinationFilter === 'TODOS' && (
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
            const isSolicitado = req.status === 'SOLICITADO' || (req.status as any) === 'PENDENTE';
            const isCotacao = req.status === 'EM_COTACAO';
            const isComprado = req.status === 'COMPRADO';
            const isRecebido = req.status === 'RECEBIDO';
            const isCancelado = req.status === 'CANCELADO' || (req.status as any) === 'CANCELADA';
            const isEstoque = req.destination === 'REPOSICAO_ESTOQUE';

            return (
              <div 
                key={req.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header: Code, Destination Badge, Department, Priority & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{req.code}
                    </span>

                    {/* Destination Badge */}
                    {isEstoque ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>REPOSIÇÃO DE ESTOQUE</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>USO IMEDIATO / DIRETO</span>
                      </span>
                    )}

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

                  {/* Status Badge - Clickable to edit */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStatus(req)}
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-xs hover:scale-102 border ${
                        isSolicitado
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : isCotacao
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : isComprado
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : isRecebido
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isCancelado
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                      title="Clique para editar o status desta compra"
                    >
                      {isSolicitado && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {isCotacao && <FileText className="w-3.5 h-3.5 text-purple-600" />}
                      {isComprado && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                      {isRecebido && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {isCancelado && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {!isSolicitado && !isCotacao && !isComprado && !isRecebido && !isCancelado && <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>
                        {isSolicitado && 'Solicitado'}
                        {isCotacao && 'Em Cotação'}
                        {isComprado && 'Pedido Emitido'}
                        {isRecebido && 'Recebido / Entregue'}
                        {isCancelado && 'Cancelado'}
                        {!isSolicitado && !isCotacao && !isComprado && !isRecebido && !isCancelado && (req.status || 'Solicitado')}
                      </span>
                      <Edit3 className="w-3 h-3 opacity-60 ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Details: Requester, Reason, Cost Center, Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Solicitante:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      {req.requester}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Motivo / Justificativa:</span>
                    <span className="font-medium text-slate-800 block mt-0.5">
                      {req.reason}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Centro de Custo / O.S.:</span>
                    <span className="font-medium text-slate-700 block mt-0.5">
                      {req.costCenter || 'Não informado'}
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

                {/* Items List */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Materiais Solicitados ({req.items.length}):</span>
                    {req.totalEstimatedValue > 0 && (
                      <span className="text-slate-900 font-mono font-bold lowercase">
                        Total est: R$ {req.totalEstimatedValue.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-200/60">
                    {req.items.map(item => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 truncate">{item.itemName}</span>
                            {item.isNewItem && (
                              <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full font-bold">
                                NOVO ITEM
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                            {item.supplierSuggested && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                Fornecedor: <strong>{item.supplierSuggested}</strong>
                              </span>
                            )}
                            {item.linkOrReference && (
                              <a 
                                href={item.linkOrReference.startsWith('http') ? item.linkOrReference : `https://${item.linkOrReference}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Ver cotação/link</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 font-mono">
                          <div className="text-right">
                            <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold">
                              {item.quantity} {item.unit}
                            </span>
                            {item.estimatedUnitPrice ? (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                R$ {item.totalEstimatedPrice?.toFixed(2)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional notes or receipt details */}
                {req.notes && (
                  <div className="text-xs text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Obs:</strong> {req.notes}
                  </div>
                )}

                {isRecebido && req.receivedAt && (
                  <div className={`text-xs p-3 rounded-xl flex items-center gap-2 border ${
                    isEstoque 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      Recebido por <strong>{req.receivedBy}</strong> em {new Date(req.receivedAt).toLocaleString('pt-BR')}
                      {req.invoiceNumber && <> • NF: <strong>{req.invoiceNumber}</strong></>}
                      {isEstoque 
                        ? ' • As peças entraram automaticamente no saldo do estoque.' 
                        : ' • Peça entregue diretamente para aplicação/solicitante.'}
                    </span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handlePrintRequest(req)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Imprimir solicitação de compra / comprovante"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditStatus(req)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 shadow-2xs"
                      title="Alterar o status desta solicitação"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Alterar Status</span>
                    </button>

                    <button
                      onClick={() => setRequestToDelete(req)}
                      className="px-3 py-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 hover:border-rose-200"
                      title="Excluir esta solicitação de compra"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                      <span>Excluir</span>
                    </button>
                  </div>

                  {/* Status transitions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isSolicitado && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'CANCELADO')}
                          className="px-3 py-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'EM_COTACAO')}
                          className="px-3.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Em Cotação</span>
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'COMPRADO')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Emitir Pedido</span>
                        </button>
                      </>
                    )}

                    {isCotacao && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'CANCELADO')}
                          className="px-3 py-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'COMPRADO')}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Pedido Comprado</span>
                        </button>
                      </>
                    )}

                    {isComprado && (
                      <button
                        onClick={() => handleOpenReceiveModal(req)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registrar Recebimento {isEstoque && '(Entrada no Estoque)'}</span>
                      </button>
                    )}

                    {isCancelado && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'SOLICITADO')}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reabrir Solicitação</span>
                      </button>
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

      {/* Receive Modal (Confirmação de Recebimento com NF e Responsável) */}
      {receivingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Recebimento de Compra
                </h3>
              </div>
              <button
                onClick={() => setReceivingRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Confirma o recebimento da solicitação <strong>#{receivingRequest.code}</strong>?
              </p>
              
              {receivingRequest.destination === 'REPOSICAO_ESTOQUE' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                  📦 <strong>Reposição de Estoque:</strong> As quantidades de {receivingRequest.items.length} item(ns) serão somadas <strong>automaticamente ao saldo do estoque</strong> e registradas em Movimentações de Entrada!
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
                  ⚡ <strong>Uso Imediato:</strong> O material será registrado como entregue diretamente para <strong>{receivingRequest.requester}</strong>, sem inflar o saldo do estoque do almoxarifado.
                </div>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número da Nota Fiscal (NF):
                </label>
                <input
                  type="text"
                  value={invoiceInput}
                  onChange={(e) => setInvoiceInput(e.target.value)}
                  placeholder="Ex: NF-e 124580"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recebido e Conferido por: *
                </label>
                <input
                  type="text"
                  value={receiverInput}
                  onChange={(e) => setReceiverInput(e.target.value)}
                  placeholder="Nome do conferente / almoxarife"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReceivingRequest(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReceive}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Recebimento</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingStatusRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Alterar Status da Solicitação
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    #{editingStatusRequest.code} • {editingStatusRequest.requester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStatusRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Options Radio Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selecione o Novo Status:
              </label>

              <div className="grid grid-cols-1 gap-2">
                {/* SOLICITADO */}
                <label 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    targetStatus === 'SOLICITADO'
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="requestStatus" 
                      value="SOLICITADO"
                      checked={targetStatus === 'SOLICITADO'}
                      onChange={() => setTargetStatus('SOLICITADO')}
                      className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Solicitado</span>
                        <span className="text-[11px] text-slate-500">Aberto / Aguardando início das cotações</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Fase 1
                  </span>
                </label>

                {/* EM_COTACAO */}
                <label 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    targetStatus === 'EM_COTACAO'
                      ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="requestStatus" 
                      value="EM_COTACAO"
                      checked={targetStatus === 'EM_COTACAO'}
                      onChange={() => setTargetStatus('EM_COTACAO')}
                      className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Em Cotação</span>
                        <span className="text-[11px] text-slate-500">Pesquisando fornecedores e propostas comerciais</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Fase 2
                  </span>
                </label>

                {/* COMPRADO */}
                <label 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    targetStatus === 'COMPRADO'
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="requestStatus" 
                      value="COMPRADO"
                      checked={targetStatus === 'COMPRADO'}
                      onChange={() => setTargetStatus('COMPRADO')}
                      className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Pedido Emitido (Comprado)</span>
                        <span className="text-[11px] text-slate-500">Pedido fechado / Aguardando entrega pelo fornecedor</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Fase 3
                  </span>
                </label>

                {/* RECEBIDO */}
                <label 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    targetStatus === 'RECEBIDO'
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="requestStatus" 
                      value="RECEBIDO"
                      checked={targetStatus === 'RECEBIDO'}
                      onChange={() => setTargetStatus('RECEBIDO')}
                      className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Recebido / Entregue</span>
                        <span className="text-[11px] text-slate-500">Mercadoria recebida e conferida com sucesso</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Fase 4
                  </span>
                </label>

                {/* CANCELADO */}
                <label 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    targetStatus === 'CANCELADO'
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="requestStatus" 
                      value="CANCELADO"
                      checked={targetStatus === 'CANCELADO'}
                      onChange={() => setTargetStatus('CANCELADO')}
                      className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Cancelado</span>
                        <span className="text-[11px] text-slate-500">Solicitação cancelada ou recusada</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Encerrada
                  </span>
                </label>
              </div>
            </div>

            {/* Extra inputs if RECEBIDO */}
            {targetStatus === 'RECEBIDO' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="text-xs text-slate-600">
                  {editingStatusRequest.destination === 'REPOSICAO_ESTOQUE' ? (
                    <span className="text-emerald-700 font-medium">
                      📦 <strong>Reposição de Estoque:</strong> As peças entrarão automaticamente no inventário e gerarão registro de movimentação de ENTRADA.
                    </span>
                  ) : (
                    <span className="text-blue-700 font-medium">
                      ⚡ <strong>Uso Imediato:</strong> Mercadoria entregue diretamente ao solicitante ({editingStatusRequest.requester}).
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nota Fiscal (NF):
                    </label>
                    <input
                      type="text"
                      value={statusInvoiceInput}
                      onChange={(e) => setStatusInvoiceInput(e.target.value)}
                      placeholder="Ex: NF-e 124580"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Conferido / Recebido por:
                    </label>
                    <input
                      type="text"
                      value={statusReceiverInput}
                      onChange={(e) => setStatusReceiverInput(e.target.value)}
                      placeholder="Nome do conferente"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes / Justification input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações / Justificativa da Alteração:
              </label>
              <textarea
                value={statusNotesInput}
                onChange={(e) => setStatusNotesInput(e.target.value)}
                placeholder="Ex: Cotação aprovada com fornecedor X / Reaberto para novos orçamentos..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500 focus:bg-white resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStatusRequest(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Solicitação de Compra?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta ação é irreversível e removerá o pedido do sistema.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  #{requestToDelete.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {requestToDelete.department}
                </span>
              </div>

              <div className="space-y-1 text-slate-600">
                <div>
                  <strong className="text-slate-700">Solicitante:</strong> {requestToDelete.requester}
                </div>
                <div>
                  <strong className="text-slate-700">Motivo:</strong> {requestToDelete.reason}
                </div>
                <div>
                  <strong className="text-slate-700">Itens ({requestToDelete.items.length}):</strong>{' '}
                  <span className="text-slate-500">
                    {requestToDelete.items.map(i => i.itemName).slice(0, 3).join(', ')}
                    {requestToDelete.items.length > 3 ? '...' : ''}
                  </span>
                </div>
                {requestToDelete.totalEstimatedValue > 0 && (
                  <div>
                    <strong className="text-slate-700">Valor Total Estimado:</strong>{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      R$ {requestToDelete.totalEstimatedValue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <span className="font-bold shrink-0">Atenção:</span>
              <span>Todos os dados desta solicitação serão removidos permanentemente.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
