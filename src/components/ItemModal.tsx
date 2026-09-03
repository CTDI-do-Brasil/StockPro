import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { StockItem, Department, UnitType } from '../types';
import confetti from 'canvas-confetti';
import { FolderTree, Plus, Tag } from 'lucide-react';
import { CategoriesModal } from './CategoriesModal';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: StockItem | null;
  defaultDepartment?: Department;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit = null,
  defaultDepartment = 'TI'
}) => {
  const { addItem, updateItem, suppliers, categories } = useStock();

  const [department, setDepartment] = useState<Department>(defaultDepartment);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [minQuantity, setMinQuantity] = useState<number>(2);
  const [maxQuantity, setMaxQuantity] = useState<number>(20);
  const [unit, setUnit] = useState<UnitType>('un');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [isEquipment, setIsEquipment] = useState<boolean>(false);
  const [serialNumbersText, setSerialNumbersText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Available categories for selected department
  const deptCategories = categories.filter(c => c.department === department);
  
  // Available subcategories for selected category
  const activeCategoryObj = deptCategories.find(c => c.name === category);
  const availableSubcategories = activeCategoryObj ? activeCategoryObj.subcategories : [];

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setDepartment(itemToEdit.department);
        setSku(itemToEdit.sku);
        setBarcode(itemToEdit.barcode);
        setName(itemToEdit.name);
        setCategory(itemToEdit.category);
        setSubcategory(itemToEdit.subcategory || '');
        setDescription(itemToEdit.description);
        setQuantity(itemToEdit.quantity);
        setMinQuantity(itemToEdit.minQuantity);
        setMaxQuantity(itemToEdit.maxQuantity);
        setUnit(itemToEdit.unit);
        setUnitPrice(itemToEdit.unitPrice);
        setSupplier(itemToEdit.supplier);
        setManufacturer(itemToEdit.manufacturer);
        setPartNumber(itemToEdit.partNumber || '');
        setIsEquipment(itemToEdit.isEquipment);
        setSerialNumbersText(itemToEdit.serialNumbers ? itemToEdit.serialNumbers.join(', ') : '');
        setTagsText(itemToEdit.tags ? itemToEdit.tags.join(', ') : '');
        setNotes(itemToEdit.notes || '');
      } else {
        // New item defaults
        const dept: Department = (defaultDepartment === 'ENGENHARIA' || defaultDepartment === 'MANUTENCAO') 
          ? defaultDepartment 
          : 'TI';
        setDepartment(dept);
        
        const matchingCats = categories.filter(c => c.department === dept);
        const defaultCat = matchingCats[0]?.name || 'Geral';
        const defaultSubcat = matchingCats[0]?.subcategories[0] || '';
        
        setCategory(defaultCat);
        setSubcategory(defaultSubcat);
        setName('');
        setDescription('');
        setQuantity(1);
        setMinQuantity(2);
        setMaxQuantity(20);
        setUnit('un');
        setUnitPrice(0);
        setSupplier(suppliers[0]?.name || 'Fornecedor Padrão');
        setManufacturer('');
        setPartNumber('');
        setIsEquipment(false);
        setSerialNumbersText('');
        setTagsText('');
        setNotes('');
        generateAutoCodes(dept);
      }
      setError(null);
    }
  }, [isOpen, itemToEdit, defaultDepartment]);

  const generateAutoCodes = (targetDept: Department) => {
    const prefix = targetDept === 'TI' ? 'TI' : targetDept === 'ENGENHARIA' ? 'ENG' : 'MAN';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newSku = `${prefix}-ITEM-${randNum}`;
    const newBarcode = `789${prefix === 'TI' ? '1' : prefix === 'ENG' ? '2' : '3'}${Date.now().toString().slice(-9)}`;
    setSku(newSku);
    setBarcode(newBarcode);
  };

  const handleDeptChange = (newDept: Department) => {
    setDepartment(newDept);
    const matchingCats = categories.filter(c => c.department === newDept);
    const firstCat = matchingCats[0]?.name || 'Geral';
    const firstSubcat = matchingCats[0]?.subcategories[0] || '';
    setCategory(firstCat);
    setSubcategory(firstSubcat);
    if (!itemToEdit) {
      generateAutoCodes(newDept);
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const catObj = deptCategories.find(c => c.name === newCat);
    if (catObj && catObj.subcategories.length > 0) {
      setSubcategory(catObj.subcategories[0]);
    } else {
      setSubcategory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim()) {
      setError('O código SKU é obrigatório.');
      return;
    }
    if (!name.trim()) {
      setError('O nome do item é obrigatório.');
      return;
    }

    const serials = serialNumbersText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const itemData = {
      sku: sku.trim(),
      barcode: barcode.trim() || sku.trim(),
      name: name.trim(),
      department,
      category: category || deptCategories[0]?.name || 'Geral',
      subcategory: subcategory.trim() || undefined,
      description: description.trim(),
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      maxQuantity: Number(maxQuantity) || 100,
      unit,
      unitPrice: Number(unitPrice) || 0,
      location: itemToEdit?.location || {
        warehouse: '',
        aisleRack: '',
        shelfBin: ''
      },
      supplier: supplier.trim() || 'Fornecedor Não Especificado',
      manufacturer: manufacturer.trim() || 'Genérico',
      partNumber: partNumber.trim() || undefined,
      isEquipment,
      serialNumbers: serials.length > 0 ? serials : undefined,
      tags,
      notes: notes.trim() || undefined
    };

    if (itemToEdit) {
      updateItem(itemToEdit.id, itemData);
    } else {
      addItem(itemData);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{itemToEdit ? '✏️' : '📦'}</span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {itemToEdit ? 'Editar Item do Estoque' : 'Cadastrar Novo Item'}
                </h3>
                <p className="text-xs text-slate-500">
                  Informações cadastrais, categorização, localização e estoque mínimo
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Department Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Departamento / Área Responsável:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['TI', 'ENGENHARIA', 'MANUTENCAO'] as Department[]).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDeptChange(dept)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      department === dept
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {dept === 'MANUTENCAO' ? 'MANUTENÇÃO' : dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Name and Description */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Item / Descrição Principal: *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sensor Óptico Banner 24V PNP / Switch Cisco 24p / Rolamento SKF..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Category and Subcategory Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                    Categoria ({department}):
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(true)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                    title="Adicionar ou editar categorias"
                  >
                    <Plus className="w-3 h-3" /> Gerenciar
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                >
                  {deptCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Subcategoria (Opcional):
                  </span>
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2.5 py-2 outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- Nenhuma subcategoria --</option>
                    {availableSubcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ou digite outra..."
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-1/3 bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-2 py-2 outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Manufacturer & Part Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fabricante / Marca:
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Ex: Dell, Siemens, Fluke, SKF, Festo, HP..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Part Number (Código do Fabricante):
                </label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="Ex: 6ES7214-1AG40-0XB0, 6205-2RSH..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Codes: SKU, Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">SKU / Código Interno:</label>
                  <button
                    type="button"
                    onClick={() => generateAutoCodes(department)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Gerar Novo
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 font-mono text-xs rounded-lg px-2.5 py-1.5 outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código de Barras / EAN-13:
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 font-mono text-xs rounded-lg px-2.5 py-1.5 outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quantities and Pricing */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qtd Atual:
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-amber-700">
                  Estoque Mín (Alerta): *
                </label>
                <input
                  type="number"
                  min="0"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-amber-50/50 border border-amber-300 text-amber-900 text-sm font-semibold rounded-xl px-3 py-2 outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estoque Máx:
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxQuantity}
                  onChange={(e) => setMaxQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade:
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-2 py-2 outline-hidden focus:border-blue-500"
                >
                  <option value="un">un (Unidade)</option>
                  <option value="m">m (Metro)</option>
                  <option value="kg">kg (Quilo)</option>
                  <option value="l">l (Litro)</option>
                  <option value="kit">kit (Conjunto)</option>
                  <option value="cx">cx (Caixa)</option>
                  <option value="par">par (Par)</option>
                  <option value="rolo">rolo (Rolo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço Unit (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>
            </div>



            {/* Equipment Check & Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fornecedor Principal:
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ex: Dell, SKF, Siemens..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={isEquipment}
                    onChange={(e) => setIsEquipment(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Equipamento Rastreável / Cautela</span>
                    <span className="text-[10px] text-slate-500 block">Permite empréstimo com termo de cautela para técnicos</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Serial numbers if equipment */}
            {isEquipment && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Números de Série das Unidades (separados por vírgula):
                </label>
                <input
                  type="text"
                  value={serialNumbersText}
                  onChange={(e) => setSerialNumbersText(e.target.value)}
                  placeholder="Ex: BR-LAT-90412, BR-LAT-90413..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>
            )}

            {/* Description, Tags, and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags para Busca Rápida (separadas por vírgula):
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Ex: sensor, pnp, automacao, 24v"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Técnicas / Aplicação:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Peça crítica para Linha 04. Manter reserva."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-blue-500"
                />
              </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              💾 {itemToEdit ? 'Salvar Alterações' : 'Cadastrar Item'}
            </button>
          </div>

        </div>
      </div>

      {/* Categories modal trigger from within Item modal */}
      <CategoriesModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        initialDept={department}
      />
    </>
  );
};

