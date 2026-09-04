import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { StockItem, MovementType, Department } from '../types';
import confetti from 'canvas-confetti';

interface QuickMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: StockItem | null;
  initialType?: MovementType;
}

export const QuickMovementModal: React.FC<QuickMovementModalProps> = ({
  isOpen,
  onClose,
  initialItem = null,
  initialType = 'SAIDA'
}) => {
  const { items, registerMovement } = useStock();

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [type, setType] = useState<MovementType>(initialType);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [requester, setRequester] = useState<string>('');
  const [workOrderId, setWorkOrderId] = useState<string>('');
  const [costCenter, setCostCenter] = useState<string>('');
  const [responsibleUser, setResponsibleUser] = useState<string>('Operador Almoxarifado');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setSelectedItemId(initialItem.id);
      } else if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id);
      }
      setType(initialType);
      setQuantity(1);
      setReason('');
      setRequester('');
      setWorkOrderId('');
      setCostCenter('');
      setError(null);
    }
  }, [isOpen, initialItem, initialType, items]);

  const selectedItem = items.find(i => i.id === selectedItemId);

  // Common quick reasons
  const reasonTemplates: Record<string, string[]> = {
    ENTRADA: [
      'Compra Nota Fiscal (Reposição)',
      'Devolução de Material não Utilizado',
      'Transferência entre Almoxarifados',
      'Recebimento de Garantia / Troca'
    ],
    SAIDA: [
      'Atendimento Chamado de TI',
      'Manutenção Preventiva de Máquinas',
      'Manutenção Corretiva Emergencial',
      'Consumo em Bancada de Testes / P&D',
      'Instalação em Projeto de Automação'
    ],
    BAIXA_MANUTENCAO: [
      'Troca de Peça Danificada em Máquina',
      'Peça Quebrada / Descarte Técnico',
      'Reforma Geral de Painel / Motor'
    ],
    AJUSTE: [
      'Ajuste por Contagem de Inventário Físico',
      'Correção de Erro de Lançamento Anterior'
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError('Selecione um item do estoque.');
      return;
    }

    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    if ((type === 'SAIDA' || type === 'BAIXA_MANUTENCAO') && quantity > selectedItem.quantity) {
      setError(`Estoque insuficiente! Disponível: ${selectedItem.quantity} ${selectedItem.unit}.`);
      return;
    }

    if (!reason.trim()) {
      setError('Informe o motivo ou finalidade da movimentação.');
      return;
    }

    const movement = registerMovement({
      itemId: selectedItem.id,
      type,
      quantity,
      reason,
      requester: requester.trim() || 'Não informado',
      workOrderId: workOrderId.trim() || undefined,
      costCenter: costCenter.trim() || undefined,
      responsibleUser: responsibleUser.trim() || 'Almoxarifado',
      notes: notes.trim() || undefined
    });

    if (movement) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  // Real-time stock balance estimation
  const resultingStock = selectedItem ? (
    type === 'ENTRADA' ? selectedItem.quantity + Number(quantity || 0) :
    type === 'AJUSTE' ? Number(quantity || 0) :
    Math.max(0, selectedItem.quantity - Number(quantity || 0))
  ) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {type === 'ENTRADA' ? '📥' : type === 'AJUSTE' ? '⚖️' : '📤'}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'ENTRADA' ? 'Registrar Entrada de Estoque' : 
                 type === 'AJUSTE' ? 'Ajuste de Inventário Físico' : 
                 'Registrar Saída / Baixa de Peça'}
              </h3>
              <p className="text-xs text-slate-500">
                Lançamento com atualização imediata de saldo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Movimentação:
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setType('SAIDA')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'SAIDA' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saída
              </button>
              <button
                type="button"
                onClick={() => setType('ENTRADA')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'ENTRADA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('BAIXA_MANUTENCAO')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'BAIXA_MANUTENCAO' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manutenção
              </button>
              <button
                type="button"
                onClick={() => setType('AJUSTE')}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'AJUSTE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ajuste
              </button>
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item do Estoque:
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-hidden focus:border-blue-500"
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.department}] {item.name} (Atual: {item.quantity} {item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Item Info Box & Balance Simulation */}
          {selectedItem && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Saldo Atual:</span>
                <div className="text-base font-bold text-slate-900">
                  {selectedItem.quantity} <span className="text-xs text-slate-500">{selectedItem.unit}</span>
                </div>
                <span className="text-[10px] text-slate-400">Mínimo: {selectedItem.minQuantity} {selectedItem.unit}</span>
              </div>

              <div className="text-center font-bold text-xl text-slate-400">➔</div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500">
                  {type === 'AJUSTE' ? 'Novo Saldo Contado:' : 'Saldo Projetado:'}
                </span>
                <div className={`text-base font-extrabold ${
                  resultingStock === 0 ? 'text-rose-600' :
                  resultingStock <= selectedItem.minQuantity ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {resultingStock} <span className="text-xs font-normal text-slate-500">{selectedItem.unit}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {resultingStock === 0 ? 'Zerado!' : resultingStock <= selectedItem.minQuantity ? 'Estoque Baixo' : 'Estoque Adequado'}
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantidade ({selectedItem?.unit || 'un'}):
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-base rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              required
            />
          </div>

          {/* Reason Field with Quick Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo / Justificativa da Movimentação:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Atendimento Chamado #302 ou Reposição Nota Fiscal #4489"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 mb-1.5"
              required
            />
            {/* Quick reason suggestions */}
            <div className="flex flex-wrap gap-1">
              {(reasonTemplates[type] || reasonTemplates['SAIDA']).map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(tmpl)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors text-left"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Requisition Details: Requester, OS, Cost Center */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requisitante / Colaborador:
              </label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder="Ex: Eng. Rafael Costa (Matr. 3012)"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ordem de Serviço (O.S.) / Chamado:
              </label>
              <input
                type="text"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                placeholder="Ex: OS-2026-089"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Centro de Custo:
              </label>
              <input
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                placeholder="Ex: CC-101 TI / CC-201 Manut"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operador do Almoxarifado:
              </label>
              <input
                type="text"
                value={responsibleUser}
                onChange={(e) => setResponsibleUser(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                type === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-700' :
                type === 'AJUSTE' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirmar {type === 'ENTRADA' ? 'Entrada' : type === 'AJUSTE' ? 'Ajuste' : 'Saída'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
