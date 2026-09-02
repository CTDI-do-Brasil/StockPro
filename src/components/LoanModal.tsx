import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { StockItem, EquipmentLoan, Department } from '../types';
import confetti from 'canvas-confetti';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: StockItem | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  initialItem = null
}) => {
  const { items, createLoan } = useStock();

  const trackableItems = items.filter(i => i.isEquipment && i.quantity > 0);

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerBadge, setBorrowerBadge] = useState('');
  const [borrowerDept, setBorrowerDept] = useState('Manutenção');
  const [expectedReturnDays, setExpectedReturnDays] = useState<number>(3);
  const [serialNumber, setSerialNumber] = useState('');
  const [conditionOnBorrow, setConditionOnBorrow] = useState('Em perfeito estado de funcionamento');
  const [workOrderId, setWorkOrderId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialItem && initialItem.isEquipment) {
        setSelectedItemId(initialItem.id);
        if (initialItem.serialNumbers && initialItem.serialNumbers.length > 0) {
          setSerialNumber(initialItem.serialNumbers[0]);
        }
      } else if (trackableItems.length > 0 && !selectedItemId) {
        setSelectedItemId(trackableItems[0].id);
      }
      setBorrowerName('');
      setBorrowerBadge('');
      setExpectedReturnDays(3);
      setWorkOrderId('');
      setNotes('');
      setError(null);
    }
  }, [isOpen, initialItem, trackableItems]);

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError('Selecione um equipamento disponível para cautela.');
      return;
    }

    if (selectedItem.quantity <= 0) {
      setError('Este item não possui unidades disponíveis no momento.');
      return;
    }

    if (!borrowerName.trim()) {
      setError('Informe o nome do colaborador / técnico solicitante.');
      return;
    }

    const borrowDate = new Date().toISOString();
    const returnDateObj = new Date();
    returnDateObj.setDate(returnDateObj.getDate() + Number(expectedReturnDays));
    const expectedReturnDate = returnDateObj.toISOString();

    const loan = createLoan({
      itemId: selectedItem.id,
      itemSku: selectedItem.sku,
      itemName: selectedItem.name,
      serialNumber: serialNumber.trim() || undefined,
      department: selectedItem.department,
      borrowerName: borrowerName.trim(),
      borrowerBadge: borrowerBadge.trim() || 'N/A',
      borrowerDept: borrowerDept.trim() || 'Geral',
      borrowDate,
      expectedReturnDate,
      conditionOnBorrow: conditionOnBorrow.trim(),
      workOrderId: workOrderId.trim() || undefined,
      notes: notes.trim() || undefined
    });

    if (loan) {
      confetti({ particleCount: 30, spread: 50 });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nova Cautela / Empréstimo de Equipamento
              </h3>
              <p className="text-xs text-slate-500">
                Termo de responsabilidade para ferramentas e equipamentos de TI/Eng/Manutenção
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

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipamento / Ferramenta a ser Retirada: *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2.5 outline-hidden focus:border-blue-500"
            >
              {trackableItems.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.department}] {item.name} (Disponível: {item.quantity})
                </option>
              ))}
            </select>
            {trackableItems.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Nenhum equipamento marcado como "Equipamento Rastreável" com estoque disponível.
              </p>
            )}
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de Série / Patrimônio Específico:
            </label>
            {selectedItem?.serialNumbers && selectedItem.serialNumbers.length > 0 ? (
              <select
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              >
                {selectedItem.serialNumbers.map((sn, idx) => (
                  <option key={idx} value={sn}>{sn}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Ex: FLK-179-0941 ou BR-LAT-90412"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              />
            )}
          </div>

          {/* Borrower info: Name, Badge, Dept */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Técnico / Solicitante: *
              </label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Ex: Juliana Rios"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matrícula / Registro:
              </label>
              <input
                type="text"
                value={borrowerBadge}
                onChange={(e) => setBorrowerBadge(e.target.value)}
                placeholder="Ex: MAT-5120"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Setor / Área do Colaborador:
              </label>
              <input
                type="text"
                value={borrowerDept}
                onChange={(e) => setBorrowerDept(e.target.value)}
                placeholder="Ex: Manutenção Elétrica / TI Suporte"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prazo de Devolução:
              </label>
              <select
                value={expectedReturnDays}
                onChange={(e) => setExpectedReturnDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              >
                <option value={1}>1 Dia (Mesmo dia / Amanhã)</option>
                <option value={3}>3 Dias</option>
                <option value={7}>7 Dias (1 Semana)</option>
                <option value={15}>15 Dias</option>
                <option value={30}>30 Dias (1 Mês)</option>
                <option value={90}>90 Dias (Projeto)</option>
              </select>
            </div>
          </div>

          {/* Condition and Work Order */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado de Conservação na Entrega:
            </label>
            <input
              type="text"
              value={conditionOnBorrow}
              onChange={(e) => setConditionOnBorrow(e.target.value)}
              placeholder="Ex: Novo com maleta e pontas de prova intactas"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vincular à Ordem de Serviço (O.S.):
              </label>
              <input
                type="text"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                placeholder="Ex: OS-2026-089"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Adicionais:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Uso em campo no Galpão 04"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              📝 Emitir Termo de Cautela
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
