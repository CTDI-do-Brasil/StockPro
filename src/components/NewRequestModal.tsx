import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { Department, RequestPriority, RequestedItem } from '../types';
import { X, Plus, Trash2, AlertCircle, CheckCircle2, PackageSearch } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose }) => {
  const { items, createRequest } = useStock();
  const { user } = useAuth();

  const [requester, setRequester] = useState(user?.name || '');
  const [department, setDepartment] = useState<Department>(user?.department || 'TI');
  const [priority, setPriority] = useState<RequestPriority>('NORMAL');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Items in this request
  const [requestItems, setRequestItems] = useState<RequestedItem[]>([]);

  // Item selector state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  if (!isOpen) return null;

  // Filter available items by selected department or all
  const availableItems = items.filter(i => i.department === department);
  const selectedItemObj = items.find(i => i.id === selectedItemId);

  const handleAddItem = () => {
    if (!selectedItemId || !selectedItemObj) {
      setError('Selecione um item do estoque para adicionar.');
      return;
    }

    if (itemQuantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    // Check if already in list
    const existingIndex = requestItems.findIndex(i => i.itemId === selectedItemId);
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...requestItems];
      updated[existingIndex].quantity += itemQuantity;
      setRequestItems(updated);
    } else {
      const newItem: RequestedItem = {
        itemId: selectedItemObj.id,
        sku: selectedItemObj.sku,
        itemName: selectedItemObj.name,
        quantity: itemQuantity,
        unitPrice: selectedItemObj.unitPrice,
        unit: selectedItemObj.unit
      };
      setRequestItems(prev => [...prev, newItem]);
    }

    // Reset picker
    setSelectedItemId('');
    setItemQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setRequestItems(prev => prev.filter(i => i.itemId !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requester.trim()) {
      setError('Informe o nome do solicitante.');
      return;
    }

    if (!reason.trim()) {
      setError('Informe o motivo ou destino da solicitação.');
      return;
    }

    if (requestItems.length === 0) {
      setError('Adicione pelo menos um item à solicitação.');
      return;
    }

    createRequest({
      department,
      requester: requester.trim(),
      priority,
      reason: reason.trim(),
      items: requestItems,
      notes: notes.trim() || undefined
    });

    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });

    // Reset & close
    setRequestItems([]);
    setReason('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nova Solicitação de Peças / Material
              </h3>
              <p className="text-xs text-slate-500">
                Abra uma requisição para separação e atendimento pelo almoxarifado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Solicitante, Departamento & Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Solicitante: *
              </label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder="Ex: Carlos Silva / Matrícula"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento: *
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value as Department);
                  setSelectedItemId('');
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="TI">💻 Tecnologia (TI)</option>
                <option value="ENGENHARIA">⚡ Engenharia</option>
                <option value="MANUTENCAO">🔧 Manutenção</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade: *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className={`w-full border text-xs font-semibold rounded-xl px-3 py-2 outline-hidden transition-all ${
                  priority === 'URGENTE'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : priority === 'ALTA'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="BAIXA">🟢 Baixa</option>
                <option value="NORMAL">🔵 Normal</option>
                <option value="ALTA">🟠 Alta</option>
                <option value="URGENTE">🔴 Urgente (Linha parada)</option>
              </select>
            </div>
          </div>

          {/* Motivo / Justificativa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo / Aplicação / Destino: *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Troca preventiva Linha 03 / Reparo de workstation / Chamado #452"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Adicionar Itens do Estoque */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <PackageSearch className="w-4 h-4 text-blue-600" />
                Adicionar Peças / Itens Requisitados
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {availableItems.length} itens disponíveis em {department}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                >
                  <option value="">-- Selecione o item do estoque --</option>
                  {availableItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Saldo: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28 flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Qtd"
                  className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {selectedItemObj?.unit || 'un'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {selectedItemObj && (
              <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-200/60">
                <span>SKU: <strong className="font-mono text-slate-700">{selectedItemObj.sku}</strong></span>
                <span>Saldo atual: <strong className={selectedItemObj.quantity < itemQuantity ? 'text-rose-600' : 'text-emerald-600'}>{selectedItemObj.quantity} {selectedItemObj.unit}</strong></span>
                {selectedItemObj.quantity < itemQuantity && (
                  <span className="text-rose-600 font-bold">⚠️ Quantidade superior ao saldo em estoque!</span>
                )}
              </div>
            )}
          </div>

          {/* Lista de Itens Adicionados */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Itens Selecionados ({requestItems.length})</span>
            </div>

            {requestItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhum item adicionado ainda. Escolha os materiais acima.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {requestItems.map(item => (
                  <div key={item.itemId} className="p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-slate-50/70 transition-colors">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{item.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2 py-1 bg-blue-50 text-blue-800 font-mono font-bold rounded-lg border border-blue-200/60">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.itemId)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Adicionais (Opcional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções para o almoxarifado, horário previsto de retirada, etc..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enviar Solicitação</span>
          </button>
        </div>

      </div>
    </div>
  );
};
