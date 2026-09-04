import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../context/StockContext';
import { StockItem } from '../types';
import { BarcodeRenderer, QRCodeRenderer } from './BarcodeRenderer';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: StockItem) => void;
  onQuickMove?: (item: StockItem, type: 'ENTRADA' | 'SAIDA') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  onQuickMove
}) => {
  const { items, getItemByBarcodeOrSku } = useStock();
  const [manualCode, setManualCode] = useState('');
  const [matchedItem, setMatchedItem] = useState<StockItem | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setManualCode('');
      setMatchedItem(null);
      setCameraError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Câmera não suportada neste dispositivo.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Permissão de câmera não concedida ou dispositivo sem câmera. Use o leitor óptico / código manual abaixo.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSearch = (code: string) => {
    setManualCode(code);
    if (!code.trim()) {
      setMatchedItem(null);
      return;
    }
    const found = getItemByBarcodeOrSku(code);
    if (found) {
      setMatchedItem(found);
    } else {
      setMatchedItem(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(manualCode);
    }
  };

  // Quick sample scan buttons for easy testing
  const testSampleCodes = [
    { label: 'Dell 5440 (TI)', code: '7891001001018' },
    { label: 'Fluke 179 (ENG)', code: '7892002002022' },
    { label: 'Rolamento SKF (MAN)', code: '7893003003012' },
    { label: 'CLP Siemens (ENG)', code: 'ENG-CLP-1214C' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📷</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Leitor de Código de Barras & QR Code
              </h3>
              <p className="text-xs text-slate-500">
                Aponte a câmera ou utilize um leitor de código de barras USB
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

        <div className="p-6 space-y-5">
          {/* Camera Viewfinder Area */}
          <div className="relative w-full h-52 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {cameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {/* Laser scan line animation */}
                <div className="absolute inset-x-8 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute inset-8 border-2 border-dashed border-blue-500/50 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] bg-white/90 text-blue-600 px-2 py-0.5 rounded-full font-medium shadow-xs">
                    Enquadre o código de barras ou QR Code
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-2">
                <span className="text-3xl text-slate-400">🎯</span>
                <p className="text-xs text-slate-500 max-w-xs">
                  {cameraError || 'Câmera em modo de espera. Digite ou use o leitor de código de barras abaixo.'}
                </p>
                {!cameraActive && (
                  <button
                    onClick={startCamera}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4"
                  >
                    Tentar ativar câmera
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Manual Input / Barcode Gun Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Digite ou Passe o Leitor Óptico (Código de Barras ou Código do Item):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: 7891001001018 ou TI-NOTE-5440..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-hidden font-mono"
                />
                {manualCode && (
                  <button
                    onClick={() => { setManualCode(''); setMatchedItem(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <button
                onClick={() => handleSearch(manualCode)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors shrink-0 border border-slate-200"
              >
                Buscar
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400">Testar Códigos:</span>
              {testSampleCodes.map(s => (
                <button
                  key={s.code}
                  onClick={() => handleSearch(s.code)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors font-mono border border-slate-200"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          {matchedItem ? (
            <div className="bg-slate-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      matchedItem.department === 'TI' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      matchedItem.department === 'ENGENHARIA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {matchedItem.department}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{matchedItem.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{matchedItem.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {matchedItem.location.warehouse} • {matchedItem.location.aisleRack} » {matchedItem.location.shelfBin}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-extrabold text-slate-900">
                    {matchedItem.quantity} <span className="text-xs text-slate-500 font-normal">{matchedItem.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Est. Mín: {matchedItem.minQuantity}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Matched Item */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (onQuickMove) onQuickMove(matchedItem, 'ENTRADA');
                    onClose();
                  }}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  ➕ Dar Entrada
                </button>
                <button
                  onClick={() => {
                    if (onQuickMove) onQuickMove(matchedItem, 'SAIDA');
                    onClose();
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  ➖ Dar Saída
                </button>
                <button
                  onClick={() => {
                    if (onSelectItem) onSelectItem(matchedItem);
                    onClose();
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  🔍 Ver Detalhes
                </button>
              </div>
            </div>
          ) : manualCode.trim() !== '' ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-amber-700 font-medium">
                Nenhum item encontrado com o código "{manualCode}".
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Verifique se o SKU, código de barras ou serial foi cadastrado no estoque.
              </p>
            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            Fechar Scanner
          </button>
        </div>

      </div>
    </div>
  );
};
