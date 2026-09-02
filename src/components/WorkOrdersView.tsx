import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus, Department, WorkOrderItem } from '../types';
import confetti from 'canvas-confetti';

export const WorkOrdersView: React.FC = () => {
  const { workOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder, items, registerMovement } = useStock();

  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  // New Work Order Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department>('MANUTENCAO');
  const [equipmentOrSystem, setEquipmentOrSystem] = useState('');
  const [priority, setPriority] = useState<WorkOrderPriority>('MEDIA');
  const [requester, setRequester] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [description, setDescription] = useState('');
  const [requestedItemsList, setRequestedItemsList] = useState<WorkOrderItem[]>([]);
  const [selectedAddItemId, setSelectedAddItemId] = useState('');
  const [selectedAddQuantity, setSelectedAddQuantity] = useState<number>(1);

  const filteredOrders = workOrders.filter(wo => {
    if (statusFilter !== 'TODOS' && wo.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = wo.id.toLowerCase().includes(q);
      const matchTitle = wo.title.toLowerCase().includes(q);
      const matchEquip = wo.equipmentOrSystem.toLowerCase().includes(q);
      const matchTech = wo.assignedTechnician.toLowerCase().includes(q);
      const matchReq = wo.requester.toLowerCase().includes(q);

      if (!matchId && !matchTitle && !matchEquip && !matchTech && !matchReq) {
        return false;
      }
    }
    return true;
  });

  const handleAddItemToOrder = () => {
    if (!selectedAddItemId) return;
    const item = items.find(i => i.id === selectedAddItemId);
    if (!item) return;

    const existingIdx = requestedItemsList.findIndex(i => i.itemId === item.id);
    if (existingIdx >= 0) {
      const updated = [...requestedItemsList];
      updated[existingIdx].quantity += Number(selectedAddQuantity);
      setRequestedItemsList(updated);
    } else {
      setRequestedItemsList(prev => [
        ...prev,
        {
          itemId: item.id,
          sku: item.sku,
          itemName: item.name,
          quantity: Number(selectedAddQuantity),
          unitPrice: item.unitPrice
        }
      ]);
    }
    setSelectedAddQuantity(1);
  };

  const handleRemoveItemFromOrder = (itemId: string) => {
    setRequestedItemsList(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !equipmentOrSystem.trim()) return;

    createWorkOrder({
      title: title.trim(),
      department,
      equipmentOrSystem: equipmentOrSystem.trim(),
      priority,
      status: 'ABERTA',
      requester: requester.trim() || 'Produção / Operação',
      assignedTechnician: assignedTechnician.trim() || 'Não atribuído',
      description: description.trim(),
      itemsRequested: requestedItemsList
    });

    confetti({ particleCount: 25 });
    setIsNewModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDepartment('MANUTENCAO');
    setEquipmentOrSystem('');
    setPriority('MEDIA');
    setRequester('');
    setAssignedTechnician('');
    setDescription('');
    setRequestedItemsList([]);
  };

  const handleUpdateStatus = (orderId: string, newStatus: WorkOrderStatus) => {
    updateWorkOrder(orderId, { status: newStatus });
  };

  // 1-Click complete and deduct items if needed
  const handleCompleteOrder = (order: WorkOrder) => {
    if (window.confirm(`Deseja concluir a O.S. "${order.id}" e dar baixa automática nas peças utilizadas?`)) {
      // Register movements for each requested item
      order.itemsRequested.forEach(reqItem => {
        registerMovement({
          itemId: reqItem.itemId,
          type: 'BAIXA_MANUTENCAO',
          quantity: reqItem.quantity,
          reason: `Baixa de peças O.S. ${order.id} - ${order.title}`,
          requester: order.assignedTechnician || order.requester,
          workOrderId: order.id,
          responsibleUser: 'Fechamento de O.S.'
        });
      });

      updateWorkOrder(order.id, {
        status: 'CONCLUIDA',
        solutionNotes: `Ordem de serviço concluída e peças baixadas com sucesso em ${new Date().toLocaleDateString('pt-BR')}.`
      });
      confetti({ particleCount: 40 });
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Bar */}
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
              placeholder="Buscar por Nº O.S., título, máquina/equipamento, técnico..."
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

          <button
            onClick={() => { resetForm(); setIsNewModalOpen(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span>🛠️</span>
            <span>Nova Ordem de Serviço (O.S.)</span>
          </button>

        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          {[
            { label: 'Todas as O.S.', value: 'TODOS' },
            { label: 'Abertas', value: 'ABERTA' },
            { label: 'Em Andamento', value: 'EM_ANDAMENTO' },
            { label: 'Aguardando Peça', value: 'AGUARDANDO_PECA' },
            { label: 'Concluídas', value: 'CONCLUIDA' }
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            Nenhuma Ordem de Serviço encontrada.
          </div>
        ) : (
          filteredOrders.map(order => {
            const isCompleted = order.status === 'CONCLUIDA';
            const isWaitingPart = order.status === 'AGUARDANDO_PECA';
            const isCritical = order.priority === 'CRITICA';

            return (
              <div 
                key={order.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all ${
                  isCritical && !isCompleted ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' :
                  isWaitingPart ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar: ID, Dept, Priority, Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        {order.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        order.department === 'TI' ? 'bg-blue-100 text-blue-700' :
                        order.department === 'ENGENHARIA' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        order.priority === 'CRITICA' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        order.priority === 'ALTA' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.priority}
                      </span>

                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        order.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        order.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        order.status === 'AGUARDANDO_PECA' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Title & Machine */}
                  <h4 className="text-base font-bold text-slate-900 mt-3">
                    {order.title}
                  </h4>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span>⚙️ Equipamento / Sistema:</span>
                    <span>{order.equipmentOrSystem}</span>
                  </p>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {order.description}
                  </p>

                  {/* Personnel Info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Solicitante: <strong className="text-slate-800">{order.requester}</strong></span>
                    <span>Técnico: <strong className="text-slate-800">{order.assignedTechnician}</strong></span>
                  </div>

                  {/* Requested Items Box */}
                  <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Peças & Componentes ({order.itemsRequested.length}):</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        Total: {order.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    {order.itemsRequested.length === 0 ? (
                      <span className="text-xs text-slate-400 italic block">Nenhuma peça cadastrada nesta O.S.</span>
                    ) : (
                      <div className="space-y-1">
                        {order.itemsRequested.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                            <span className="truncate max-w-[240px]">
                              • {item.quantity}x {item.itemName} (#{item.sku})
                            </span>
                            <span className="font-mono text-slate-700 font-medium">
                              {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {order.solutionNotes && (
                    <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
                      <strong>Resolução / Laudo:</strong> {order.solutionNotes}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {order.status !== 'CONCLUIDA' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'EM_ANDAMENTO')}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          Em Andamento
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'AGUARDANDO_PECA')}
                          className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                        >
                          Aguardando Peça
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status !== 'CONCLUIDA' ? (
                      <button
                        onClick={() => handleCompleteOrder(order)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-xs transition-colors"
                      >
                        ✓ Concluir & Baixar Peças
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ABERTA')}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-xl hover:bg-slate-200 transition-colors font-medium"
                      >
                        Reabrir O.S.
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* New Work Order Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                🛠️ Abertura de Ordem de Serviço & Requisição de Peças
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Título / Resumo do Serviço: *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Troca de Rolamentos Bomba 02 / Upgrade RAM Servidor TI"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Equipamento / Máquina Alvo: *
                  </label>
                  <input
                    type="text"
                    value={equipmentOrSystem}
                    onChange={(e) => setEquipmentOrSystem(e.target.value)}
                    placeholder="Ex: Torno CNC 01 / Servidor Dell R740"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Setor Responsável:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  >
                    <option value="MANUTENCAO">MANUTENÇÃO</option>
                    <option value="ENGENHARIA">ENGENHARIA</option>
                    <option value="TI">TI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Prioridade:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica (Máquina Parada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Técnico Responsável:
                  </label>
                  <input
                    type="text"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    placeholder="Ex: Juliana Rios (Eletrotécnica)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descrição do Problema / Atividade Planejada:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Detalhe o sintoma, causa provável ou manutenção preventiva..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Items Requisition Component */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-900">
                  📦 Requisitar Peças do Estoque para esta O.S.:
                </label>

                <div className="flex gap-2">
                  <select
                    value={selectedAddItemId}
                    onChange={(e) => setSelectedAddItemId(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  >
                    <option value="">Selecione uma peça do estoque...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        [{item.department}] {item.name} (Disp: {item.quantity} {item.unit}) - {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selectedAddQuantity}
                    onChange={(e) => setSelectedAddQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-2 py-2 text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    disabled={!selectedAddItemId}
                    className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-blue-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>

                {/* List of Added Items */}
                {requestedItemsList.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    {requestedItemsList.map(req => (
                      <div key={req.itemId} className="flex items-center justify-between text-xs bg-white border border-slate-100 p-2.5 rounded-lg">
                        <span className="text-slate-800 font-medium">
                          {req.quantity}x {req.itemName} (#{req.sku})
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-emerald-600 font-bold">
                            {(req.quantity * req.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(req.itemId)}
                            className="text-rose-500 hover:text-rose-700 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Criar Ordem de Serviço
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
