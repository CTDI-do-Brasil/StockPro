import React from 'react';
import { generateCode128Bars, generateQRMatrix } from '../utils/barcodes';
import { StockItem } from '../types';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeProps> = ({
  value,
  width = 200,
  height = 50,
  showText = true,
  className = ''
}) => {
  const bars = generateCode128Bars(value || '000000');
  const barWidth = bars.length > 0 ? width / bars.length : 1.5;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        className="bg-white p-1 rounded-sm shadow-xs"
      >
        {bars.map((isBar, idx) => {
          if (!isBar) return null;
          return (
            <rect
              key={idx}
              x={idx * barWidth}
              y={2}
              width={Math.max(1, barWidth + 0.1)}
              height={height - 4}
              fill="#000000"
            />
          );
        })}
      </svg>
      {showText && (
        <span className="font-mono text-xs text-slate-400 mt-0.5 tracking-wider font-semibold">
          {value}
        </span>
      )}
    </div>
  );
};

interface QRProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeRenderer: React.FC<QRProps> = ({
  value,
  size = 90,
  className = ''
}) => {
  const matrix = generateQRMatrix(value || 'ITEM');
  const matrixSize = matrix.length;
  const cellSize = size / matrixSize;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="bg-white p-1.5 rounded-sm shadow-xs"
      >
        {matrix.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.05}
                height={cellSize + 0.05}
                fill="#000000"
              />
            );
          })
        )}
      </svg>
    </div>
  );
};

interface LabelPrintModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'TI': return 'bg-blue-600 text-white';
      case 'ENGENHARIA': return 'bg-indigo-600 text-white';
      case 'MANUTENCAO': return 'bg-amber-600 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              🏷️ Etiqueta de Identificação de Estoque
            </h3>
            <p className="text-xs text-slate-500">Pronta para impressão térmica ou folha A4 adesiva</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-50">
          <div 
            id="printable-label" 
            className="w-full max-w-sm bg-white text-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-2 print:border-none print:shadow-none print:m-0 print:w-full"
          >
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs ${getDeptColor(item.department)}`}>
                  {item.department}
                </span>
                {item.isEquipment && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-xs border border-slate-200">
                    PATRIMÔNIO / CAUTELA
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-600">
                {item.sku}
              </span>
            </div>

            {/* Item Title & Specs */}
            <div>
              <h4 className="font-bold text-sm leading-tight text-slate-900 line-clamp-2">
                {item.name}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                {item.category} • {item.manufacturer} {item.partNumber ? `(PN: ${item.partNumber})` : ''}
              </p>
            </div>

            {/* Location Box */}
            <div className="bg-slate-50 p-2 rounded-xs border border-slate-200 flex flex-col text-[11px] text-slate-700">
              <span className="font-semibold text-slate-900">📍 Localização no Almoxarifado:</span>
              <span>{item.location.warehouse}</span>
              <span className="font-mono text-slate-600 text-[10px] mt-0.5">
                {item.location.aisleRack} » {item.location.shelfBin}
              </span>
            </div>

            {/* Codes Footer */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex-1 flex flex-col items-center">
                <BarcodeRenderer value={item.barcode || item.sku} width={180} height={42} />
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <QRCodeRenderer value={`ESTOQUE|${item.sku}|${item.barcode}|${item.department}`} size={64} />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">QR RASTREIO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Formato: 100mm x 60mm ou Padrão Pimaco
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              🖨️ Imprimir Etiqueta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export const BarcodeLabelModal = LabelPrintModal;
