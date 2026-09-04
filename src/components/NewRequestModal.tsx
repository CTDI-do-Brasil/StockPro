import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { Department, RequestPriority, PurchaseDestination, RequestedItem, UnitType } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Zap, 
  Layers, 
  DollarSign, 
  Link as LinkIcon, 
  Building2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose }) => {
  const { items, createRequest } = useStock();
  const { user } = useAuth();

  // Destination: Uso Imediato vs Reposição de Estoque
  const [destination, setDestination] = useState<PurchaseDestination>('USO_IMEDIATO');

  const [requester, setRequester] = useState(user?.name || '');
  const [department, setDepartment] = useState<Department>(user?.department || 'TI');
  const [priority, setPriority] = useState<RequestPriority>('NORMAL');
  const [reason, setReason] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Items list in this request
  const [requestItems, setRequestItems] = useState<RequestedItem[]>([]);

  // Item inclusion mode: 'CATALOGO' vs 'NOVO_ITEM'
  const [itemMode, setItemMode] = useState<'CATALOGO' | 'NOVO_ITEM'>('CATALOGO');

  // Fields for Catalog item
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState('');
  
  // Fields for New item
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState<UnitType>('un');
  const [supplierSuggested, setSupplierSuggested] = useState('');
  const [linkOrReference, setLinkOrReference] = useState('');

  // Common item fields
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  if (!isOpen) return null;

  const catalogItems = items.filter(i => i.department === department);
  const selectedCatalogItem = items.find(i => i.id === selectedCatalogItemId);

  const handleSelectCatalogItem = (itemId: string) => {
    setSelectedCatalogItemId(itemId);
    const found = items.find(i => i.id === itemId);
    if (found) {
      setUnitPrice(found.unitPrice || 0);
    }
  };

  const handleAddItem = () => {
    setError(null);

    if (itemMode === 'CATALOGO') {
      if (!selectedCatalogItemId || !selectedCatalogItem) {
        setError('Selecione um item do catálogo.');
        return;
      }

      if (quantity <= 0) {
        setError('A quantidade deve ser maior que zero.');
        return;
      }

      const newItem: RequestedItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: selectedCatalogItem.id,
        isNewItem: false,
        sku: selectedCatalogItem.sku,
        itemName: selectedCatalogItem.name,
        quantity,
        unit: selectedCatalogItem.unit,
        estimatedUnitPrice: unitPrice > 0 ? unitPrice : selectedCatalogItem.unitPrice,
        totalEstimatedPrice: quantity * (unitPrice > 0 ? unitPrice : selectedCatalogItem.unitPrice),
        supplierSuggested: supplierSuggested.trim() || selectedCatalogItem.supplier,
        linkOrReference: linkOrReference.trim() || undefined
      };

      setRequestItems(prev => [...prev, newItem]);
      setSelectedCatalogItemId('');
    } else {
      if (!newItemName.trim()) {
        setError('Informe o nome ou descrição do material que deseja comprar.');
        return;
      }

      if (quantity <= 0) {
        setError('A quantidade deve ser maior que zero.');
        return;
      }

      const newItem: RequestedItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        isNewItem: true,
        itemName: newItemName.trim(),
        quantity,
        unit: newItemUnit,
        estimatedUnitPrice: unitPrice,
        totalEstimatedPrice: quantity * unitPrice,
        supplierSuggested: supplierSuggested.trim() || undefined,
        linkOrReference: linkOrReference.trim() || undefined
      };

      setRequestItems(prev => [...prev, newItem]);
      setNewItemName('');
      setSupplierSuggested('');
      setLinkOrReference('');
    }

    setQuantity(1);
    setUnitPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setRequestItems(prev => prev.filter(i => i.id !== id));
  };

  const totalEstimatedValue = requestItems.reduce((acc, curr) => acc + (curr.totalEstimatedPrice || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requester.trim()) {
      setError('Informe o nome do solicitante.');
      return;
    }

    if (!reason.trim()) {
      setError('Informe o motivo ou destino da compra.');
      return;
    }

    if (requestItems.length === 0) {
      setError('Adicione pelo menos um item à solicitação de compra.');
      return;
    }

    createRequest({
      destination,
      department,
      requester: requester.trim(),
      priority,
      reason: reason.trim(),
      costCenter: costCenter.trim() || undefined,
      items: requestItems,
      totalEstimatedValue,
      notes: notes.trim() || undefined
    });

    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });

    // Reset & close
    setRequestItems([]);
    setReason('');
    setCostCenter('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nova Solicitação de Compra
              </h3>
              <p className="text-xs text-slate-500">
                Requisite a aquisição de materiais para uso imediato ou abastecimento do almoxarifado
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Destino da Compra: Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              1. Finalidade / Destino da Compra: *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Uso Imediato */}
              <div
                onClick={() => setDestination('USO_IMEDIATO')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  destination === 'USO_IMEDIATO'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  destination === 'USO_IMEDIATO' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Uso Imediato / Aplicação Direta</span>
                    {destination === 'USO_IMEDIATO' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Para reparos rápidos, máquinas paradas ou chamados pontuais. Ao receber, <strong>não altera o saldo do estoque</strong> e vai direto ao solicitante.
                  </p>
                </div>
              </div>

              {/* Reposição de Estoque */}
              <div
                onClick={() => setDestination('REPOSICAO_ESTOQUE')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  destination === 'REPOSICAO_ESTOQUE'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  destination === 'REPOSICAO_ESTOQUE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Reposição de Estoque</span>
                    {destination === 'REPOSICAO_ESTOQUE' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Para repor peças de giro no almoxarifado. Ao receber, <strong>dá entrada automática</strong> somando as quantidades ao inventário.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Solicitante, Departamento, Prioridade & Centro de Custo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solicitante: *
              </label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder="Ex: Carlos Silva"
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
                  setSelectedCatalogItemId('');
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Centro de Custo / O.S.:
              </label>
              <input
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                placeholder="Ex: CC-104 / OS-2026"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Motivo / Justificativa da Compra */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo / Aplicação / Justificativa da Compra: *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Substituição de sensor defeituoso na Linha 02 / Reposição de cabos e fontes para o almoxarifado"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* 3. Inclusão de Itens */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Adicionar Materiais para Compra
              </span>

              {/* Selector Mode */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setItemMode('CATALOGO')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    itemMode === 'CATALOGO' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Item do Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => setItemMode('NOVO_ITEM')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    itemMode === 'NOVO_ITEM' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  ＋ Novo Material
                </button>
              </div>
            </div>

            {/* Sub-form based on mode */}
            {itemMode === 'CATALOGO' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-0.5">Selecione o Item Cadastrado:</label>
                    <select
                      value={selectedCatalogItemId}
                      onChange={(e) => handleSelectCatalogItem(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                    >
                      <option value="">-- Escolha um item do estoque ({catalogItems.length}) --</option>
                      {catalogItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} (Saldo atual: {item.quantity} {item.unit}) - Ref: R$ {item.unitPrice.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Fornecedor Sugerido:</label>
                    <input
                      type="text"
                      value={supplierSuggested}
                      onChange={(e) => setSupplierSuggested(e.target.value)}
                      placeholder="Ex: Distribuidor ABC"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-0.5">Nome / Especificação do Novo Material: *</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Ex: Sensor Fotoelétrico M18 24V PNP"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Unidade de Medida:</label>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value as UnitType)}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                    >
                      <option value="un">un (Unidade)</option>
                      <option value="m">m (Metro)</option>
                      <option value="kg">kg (Quilo)</option>
                      <option value="l">l (Litro)</option>
                      <option value="kit">kit (Kit)</option>
                      <option value="cx">cx (Caixa)</option>
                      <option value="par">par (Par)</option>
                      <option value="rolo">rolo (Rolo)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      Fornecedor Sugerido:
                    </label>
                    <input
                      type="text"
                      value={supplierSuggested}
                      onChange={(e) => setSupplierSuggested(e.target.value)}
                      placeholder="Ex: Kalunga / Mercado Livre / Fabricante"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-slate-400" />
                      Link do Produto / Cotação:
                    </label>
                    <input
                      type="text"
                      value={linkOrReference}
                      onChange={(e) => setLinkOrReference(e.target.value)}
                      placeholder="https://... ou Código de Referência"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Qtd, Valor Estimado e Botão Adicionar */}
            <div className="flex flex-wrap items-end gap-2 pt-1 border-t border-slate-200/70">
              <div className="w-24">
                <label className="block text-[11px] text-slate-500 mb-0.5">Qtd Comprar:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="w-32">
                <label className="block text-[11px] text-slate-500 mb-0.5">Valor Unit. Est. (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500 pb-2 px-1">
                Subtotal: <strong className="text-slate-900 font-mono">R$ {(quantity * unitPrice).toFixed(2)}</strong>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Incluir na Lista</span>
              </button>
            </div>
          </div>

          {/* Lista de Itens a serem Comprados */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Lista de Materiais para Compra ({requestItems.length})</span>
              {totalEstimatedValue > 0 && (
                <span className="text-xs text-blue-700 font-mono font-bold">
                  Total Estimado: R$ {totalEstimatedValue.toFixed(2)}
                </span>
              )}
            </div>

            {requestItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhum material adicionado ainda. Escolha ou digite acima e clique em "Incluir na Lista".
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {requestItems.map(item => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 truncate">{item.itemName}</span>
                        {item.isNewItem && (
                          <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full font-bold">
                            NOVO ITEM
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                        {item.supplierSuggested && <span>Fornecedor: <strong>{item.supplierSuggested}</strong></span>}
                        {item.linkOrReference && (
                          <span className="truncate max-w-[200px] text-blue-600">Ref: {item.linkOrReference}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">
                          {item.quantity} {item.unit}
                        </div>
                        {item.estimatedUnitPrice ? (
                          <div className="text-[10px] text-slate-400">
                            R$ {item.totalEstimatedPrice?.toFixed(2)}
                          </div>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remover material"
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
              Observações Adicionais (Prazo desejado, especificações técnicas, etc.):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções para o setor de compras ou recebimento..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500">
            {destination === 'REPOSICAO_ESTOQUE' ? (
              <span className="text-emerald-700 font-medium">📦 O material entrará no saldo do estoque ao ser recebido</span>
            ) : (
              <span className="text-blue-700 font-medium">⚡ O material será entregue diretamente para aplicação/solicitante</span>
            )}
          </div>

          <div className="flex items-center gap-2">
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
              <span>Enviar Solicitação de Compra</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
