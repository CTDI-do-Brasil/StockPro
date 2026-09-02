import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Supplier, WarehouseLocation, Department } from '../types';
import confetti from 'canvas-confetti';

export const LocationsSuppliersView: React.FC = () => {
  const { suppliers, addSupplier, deleteSupplier, locations, addLocation, deleteLocation, items } = useStock();

  const [activeTab, setActiveTab] = useState<'LOCATIONS' | 'SUPPLIERS'>('LOCATIONS');
  
  // New Location Form
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locCode, setLocCode] = useState('');
  const [locName, setLocName] = useState('');
  const [locDept, setLocDept] = useState<Department | 'GERAL'>('GERAL');
  const [locType, setLocType] = useState<WarehouseLocation['type']>('Almoxarifado');
  const [locNotes, setLocNotes] = useState('');

  // New Supplier Form
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supCnpj, setSupCnpj] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supCategoriesText, setSupCategoriesText] = useState('');
  const [supDepts, setSupDepts] = useState<Department[]>(['TI', 'ENGENHARIA', 'MANUTENCAO']);
  const [supRating, setSupRating] = useState(5);
  const [supNotes, setSupNotes] = useState('');

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locCode.trim()) return;

    addLocation({
      code: locCode.trim().toUpperCase(),
      name: locName.trim(),
      department: locDept,
      type: locType,
      capacityNotes: locNotes.trim() || undefined
    });

    confetti({ particleCount: 20 });
    setIsLocationModalOpen(false);
    setLocCode('');
    setLocName('');
    setLocNotes('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    const cats = supCategoriesText.split(',').map(c => c.trim()).filter(Boolean);

    addSupplier({
      name: supName.trim(),
      cnpj: supCnpj.trim() || 'N/A',
      contact: supContact.trim() || 'Comercial',
      email: supEmail.trim(),
      phone: supPhone.trim(),
      departments: supDepts.length > 0 ? supDepts : ['MANUTENCAO'],
      categories: cats.length > 0 ? cats : ['Geral'],
      rating: Number(supRating) || 5,
      notes: supNotes.trim() || undefined
    });

    confetti({ particleCount: 20 });
    setIsSupplierModalOpen(false);
    setSupName('');
    setSupCnpj('');
    setSupContact('');
    setSupEmail('');
    setSupPhone('');
    setSupCategoriesText('');
    setSupNotes('');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Switcher */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('LOCATIONS')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'LOCATIONS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>📍</span>
            <span>Almoxarifados & Locais ({locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'SUPPLIERS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>🏭</span>
            <span>Fornecedores Homologados ({suppliers.length})</span>
          </button>
        </div>

        {activeTab === 'LOCATIONS' ? (
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-blue-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>➕</span>
            <span>Novo Local</span>
          </button>
        ) : (
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-blue-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>➕</span>
            <span>Novo Fornecedor</span>
          </button>
        )}
      </div>

      {/* Locations Tab */}
      {activeTab === 'LOCATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map(loc => {
            const countItems = items.filter(i => i.location.warehouse === loc.name).length;

            return (
              <div 
                key={loc.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {loc.code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {loc.type}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-3">
                    {loc.name}
                  </h4>

                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div>
                      Setor: <strong className="text-slate-800">{loc.department}</strong>
                    </div>
                    {loc.capacityNotes && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-2 border border-slate-100">
                        {loc.capacityNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
                    <strong className="text-slate-900 font-bold">{countItems}</strong> itens armazenados
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja remover o local "${loc.name}"?`)) {
                        deleteLocation(loc.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 text-xs p-1 rounded-lg hover:bg-slate-100"
                    title="Excluir Local"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {suppliers.map(sup => {
            const countItems = items.filter(i => i.supplier === sup.name).length;

            return (
              <div 
                key={sup.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {sup.name}
                    </h4>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      {'★'.repeat(Math.round(sup.rating))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {sup.departments.map(d => (
                      <span key={d} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {d}
                      </span>
                    ))}
                    <span className="text-xs font-mono text-slate-500">CNPJ: {sup.cnpj}</span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Contato:</span>
                      <span className="font-semibold text-slate-900">{sup.contact}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">E-mail:</span>
                      <a href={`mailto:${sup.email}`} className="text-blue-600 hover:underline">{sup.email}</a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Telefone:</span>
                      <span className="font-mono text-slate-700">{sup.phone}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {sup.categories.map((c, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>

                  {sup.notes && (
                    <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2 rounded-lg">
                      "{sup.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
                    <strong className="text-slate-900 font-bold">{countItems}</strong> itens fornecidos
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja remover o fornecedor "${sup.name}"?`)) {
                        deleteSupplier(sup.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 text-xs p-1 rounded-lg hover:bg-slate-100"
                    title="Excluir Fornecedor"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Novo Almoxarifado / Local</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Código do Local:</label>
                <input
                  type="text"
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value)}
                  placeholder="Ex: ALM-TI-02 ou OFIC-MANUT"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Ex: Sala de Servidores TI Rack B"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Setor:</label>
                  <select
                    value={locDept}
                    onChange={(e) => setLocDept(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  >
                    <option value="GERAL">Geral</option>
                    <option value="TI">TI</option>
                    <option value="ENGENHARIA">Engenharia</option>
                    <option value="MANUTENCAO">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo:</label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  >
                    <option value="Almoxarifado">Almoxarifado</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Sala Técnica">Sala Técnica</option>
                    <option value="Bancada">Bancada</option>
                    <option value="Armário">Armário</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Observações de Acesso / Capacidade:</label>
                <input
                  type="text"
                  value={locNotes}
                  onChange={(e) => setLocNotes(e.target.value)}
                  placeholder="Ex: Acesso restrito com crachá eletrônico"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Cadastrar Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Fornecedor</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Razão Social / Nome Fantasia: *</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="Ex: Festo Pneumática do Brasil"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CNPJ:</label>
                  <input
                    type="text"
                    value={supCnpj}
                    onChange={(e) => setSupCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contato / Vendedor:</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="Ex: Carlos Mendes"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">E-mail Comercial:</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="vendas@fornecedor.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Telefone / WhatsApp:</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Categorias Fornecidas (separadas por vírgula):</label>
                <input
                  type="text"
                  value={supCategoriesText}
                  onChange={(e) => setSupCategoriesText(e.target.value)}
                  placeholder="Ex: Rolamentos, Válvulas, CLP, Sensores"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 outline-hidden focus:border-blue-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Cadastrar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
