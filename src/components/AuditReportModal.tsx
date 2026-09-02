import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Department } from '../types';

interface AuditReportModalProps {
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ onClose }) => {
  const { items, stats, movements, selectedDept } = useStock();

  const [reportType, setReportType] = useState<'AUDIT_SHEET' | 'PURCHASE_REQUISITION' | 'FINANCIAL_SUMMARY'>('PURCHASE_REQUISITION');
  const [filterDept, setFilterDept] = useState<Department | 'TODOS'>('TODOS');

  // Filter items
  const relevantItems = filterDept === 'TODOS' ? items : items.filter(i => i.department === filterDept);

  // Critical and low stock items for purchasing
  const lowStockItems = relevantItems.filter(i => i.quantity <= i.minQuantity);
  const totalPurchaseEstimated = lowStockItems.reduce((acc, item) => {
    const needed = Math.max(1, (item.maxQuantity || item.minQuantity * 2) - item.quantity);
    return acc + (needed * item.unitPrice);
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Relatórios & Auditoria de Almoxarifado</h3>
              <p className="text-xs text-slate-500">Geração de folhas de contagem física e requisições de compras</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>🖨️</span>
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Options Toolbar - Screen only */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportType('PURCHASE_REQUISITION')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                reportType === 'PURCHASE_REQUISITION' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ⚠️ Reposição & Compras ({lowStockItems.length})
            </button>
            <button
              onClick={() => setReportType('AUDIT_SHEET')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                reportType === 'AUDIT_SHEET' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              📝 Folha de Contagem Física (Auditoria)
            </button>
            <button
              onClick={() => setReportType('FINANCIAL_SUMMARY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                reportType === 'FINANCIAL_SUMMARY' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              💰 Inventário Valorizado
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filtrar Setor:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-1 outline-hidden"
            >
              <option value="TODOS">Todos os Setores</option>
              <option value="TI">TI</option>
              <option value="ENGENHARIA">Engenharia</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>
          </div>
        </div>

        {/* Printable Report Content Container */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-800 print:p-0">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-200 print:border-black pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-slate-900 print:text-black tracking-tight">
                  {reportType === 'PURCHASE_REQUISITION' && 'REQUISIÇÃO DE COMPRA & PONTO DE REPOSIÇÃO'}
                  {reportType === 'AUDIT_SHEET' && 'FOLHA DE CONTAGEM FÍSICA / AUDITORIA DE ESTOQUE'}
                  {reportType === 'FINANCIAL_SUMMARY' && 'POSIÇÃO VALORIZADA DE ESTOQUE (INVENTÁRIO GERAL)'}
                </h1>
                <p className="text-xs text-slate-500 print:text-slate-600 mt-1 font-mono">
                  SISTEMA INTEGRADO DE ALMOXARIFADO • TI / ENGENHARIA / MANUTENÇÃO
                </p>
              </div>

              <div className="text-right text-xs text-slate-500 print:text-slate-600 font-mono">
                <div>Emitido em: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</div>
                <div>Setor: <strong>{filterDept}</strong></div>
              </div>
            </div>
          </div>

          {/* REPORT 1: PURCHASE REQUISITION */}
          {reportType === 'PURCHASE_REQUISITION' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 print:bg-slate-100 rounded-xl text-xs border border-slate-200">
                <div>
                  <span className="text-slate-500 print:text-slate-600 block">Itens com Necessidade:</span>
                  <span className="text-base font-bold text-slate-900 print:text-black font-mono">{lowStockItems.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 print:text-slate-600 block">Itens Zerados (Críticos):</span>
                  <span className="text-base font-bold text-rose-600 print:text-rose-700 font-mono">
                    {lowStockItems.filter(i => i.quantity === 0).length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 print:text-slate-600 block">Investimento Estimado:</span>
                  <span className="text-base font-bold text-emerald-600 print:text-emerald-700 font-mono">
                    {totalPurchaseEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 print:border-black text-slate-500 print:text-black font-bold">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Descrição da Peça</th>
                    <th className="py-2">Setor</th>
                    <th className="py-2 text-right">Saldo Atual</th>
                    <th className="py-2 text-right">Est. Mín</th>
                    <th className="py-2 text-right">Sugerido Comprar</th>
                    <th className="py-2">Fornecedor Principal</th>
                    <th className="py-2 text-right">Custo Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {lowStockItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Nenhum item com estoque abaixo do ponto de reposição!
                      </td>
                    </tr>
                  ) : (
                    lowStockItems.map(item => {
                      const suggestBuy = Math.max(1, (item.maxQuantity || item.minQuantity * 2) - item.quantity);
                      const cost = suggestBuy * item.unitPrice;
                      return (
                        <tr key={item.id} className="py-2">
                          <td className="py-2 font-mono font-bold text-blue-600 print:text-black">{item.sku}</td>
                          <td className="py-2 font-bold text-slate-900 print:text-black">{item.name}</td>
                          <td className="py-2 text-slate-600 print:text-slate-700">{item.department}</td>
                          <td className="py-2 text-right font-mono font-bold text-rose-600 print:text-red-700">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2 text-right font-mono text-slate-500 print:text-slate-700">
                            {item.minQuantity}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-amber-600 print:text-black">
                            {suggestBuy} {item.unit}
                          </td>
                          <td className="py-2 text-slate-700 print:text-black">{item.supplier}</td>
                          <td className="py-2 text-right font-mono font-bold text-emerald-600 print:text-black">
                            {cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 2: AUDIT COUNT SHEET */}
          {reportType === 'AUDIT_SHEET' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 print:text-slate-600 italic">
                Instruções: Percorra as posições de armazenagem e anote a quantidade física contada na coluna "Contagem Física". Em caso de divergência, assine ao final.
              </p>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 print:border-black text-slate-500 print:text-black font-bold">
                    <th className="py-2">Localização</th>
                    <th className="py-2">SKU</th>
                    <th className="py-2">Descrição do Item</th>
                    <th className="py-2">Cód. Barras</th>
                    <th className="py-2 text-right">Saldo Sistema</th>
                    <th className="py-2 text-center w-28">Contagem Física</th>
                    <th className="py-2 text-center w-28">Divergência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {relevantItems.map(item => (
                    <tr key={item.id} className="py-2">
                      <td className="py-2 font-mono font-bold text-blue-600 print:text-black">
                        {item.location.aisleRack} » {item.location.shelfBin}
                      </td>
                      <td className="py-2 font-mono text-slate-700">{item.sku}</td>
                      <td className="py-2 font-semibold text-slate-900 print:text-black">{item.name}</td>
                      <td className="py-2 font-mono text-[10px] text-slate-500 print:text-black">{item.barcode}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900 print:text-black">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 text-center border-l border-r border-slate-200 print:border-black">
                        <span className="inline-block w-16 h-5 border-b border-dashed border-slate-300 print:border-black"></span>
                      </td>
                      <td className="py-2 text-center border-r border-slate-200 print:border-black">
                        <span className="inline-block w-16 h-5 border-b border-dashed border-slate-300 print:border-black"></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signature block */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-500 print:text-black">
                <div>
                  <div className="border-t border-slate-300 print:border-black pt-2">
                    Assinatura do Auditor / Almoxarife
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-300 print:border-black pt-2">
                    Assinatura do Gerente de Operações / TI / Manutenção
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT 3: FINANCIAL INVENTORY */}
          {reportType === 'FINANCIAL_SUMMARY' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 print:border-black text-slate-500 print:text-black font-bold">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Descrição</th>
                    <th className="py-2">Setor</th>
                    <th className="py-2">Categoria</th>
                    <th className="py-2 text-right">Saldo</th>
                    <th className="py-2 text-right">Custo Unitário</th>
                    <th className="py-2 text-right">Total Estocado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {relevantItems.map(item => (
                    <tr key={item.id}>
                      <td className="py-2 font-mono text-blue-600 print:text-black font-bold">{item.sku}</td>
                      <td className="py-2 font-bold text-slate-900 print:text-black">{item.name}</td>
                      <td className="py-2 text-slate-700">{item.department}</td>
                      <td className="py-2 text-slate-500 print:text-black">{item.category}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-700">
                        {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-emerald-600 print:text-black">
                        {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 print:border-black font-bold text-sm text-slate-900">
                    <td colSpan={4} className="py-3 text-right">TOTAL GERAL DO ESTOQUE:</td>
                    <td className="py-3 text-right font-mono">
                      {relevantItems.reduce((acc, i) => acc + i.quantity, 0)} un
                    </td>
                    <td></td>
                    <td className="py-3 text-right font-mono text-emerald-600 print:text-black">
                      {relevantItems.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center print:hidden shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            {relevantItems.length} registros no relatório
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
