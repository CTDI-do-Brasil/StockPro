import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Department, Category } from '../types';
import { 
  X, 
  Plus, 
  FolderTree, 
  Trash2, 
  Edit3, 
  Check, 
  Tag, 
  Layers, 
  Search, 
  Building2, 
  Wrench, 
  Cpu, 
  AlertCircle
} from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDept?: Department;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  initialDept
}) => {
  const { 
    categories, 
    items, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    addSubcategory, 
    deleteSubcategory 
  } = useStock();

  const [activeDeptTab, setActiveDeptTab] = useState<Department | 'TODOS'>(initialDept || 'TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Category Form State
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDept, setNewCatDept] = useState<Department>(initialDept && initialDept !== 'TODOS' ? initialDept : 'TI');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubcatsText, setNewCatSubcatsText] = useState('');

  // Edit Category State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Add Subcategory State per category
  const [addingSubcatForId, setAddingSubcatForId] = useState<string | null>(null);
  const [newSubcatName, setNewSubcatName] = useState('');

  if (!isOpen) return null;

  const filteredCategories = categories.filter(cat => {
    const matchesDept = activeDeptTab === 'TODOS' || cat.department === activeDeptTab;
    const matchesSearch = searchTerm === '' || 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cat.subcategories.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subcats = newCatSubcatsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    addCategory({
      name: newCatName.trim(),
      department: newCatDept,
      description: newCatDesc.trim() || undefined,
      subcategories: subcats
    });

    setNewCatName('');
    setNewCatDesc('');
    setNewCatSubcatsText('');
    setIsCreatingCat(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
  };

  const handleSaveEdit = (catId: string) => {
    if (!editCatName.trim()) return;
    updateCategory(catId, {
      name: editCatName.trim(),
      description: editCatDesc.trim() || undefined
    });
    setEditingCatId(null);
  };

  const handleAddSubcat = (catId: string) => {
    if (!newSubcatName.trim()) return;
    addSubcategory(catId, newSubcatName.trim());
    setNewSubcatName('');
    setAddingSubcatForId(null);
  };

  const getItemCountForCat = (catName: string, dept: Department) => {
    return items.filter(i => i.category === catName && i.department === dept).length;
  };

  const getItemCountForSubcat = (catName: string, subcatName: string, dept: Department) => {
    return items.filter(i => i.category === catName && i.subcategory === subcatName && i.department === dept).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Gerenciar Categorias & Subcategorias</h2>
              <p className="text-xs text-slate-500">Organize os materiais, equipamentos e insumos por departamento técnico</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveDeptTab('TODOS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeDeptTab === 'TODOS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({categories.length})
            </button>
            <button
              onClick={() => setActiveDeptTab('TI')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDeptTab === 'TI'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> TI ({categories.filter(c => c.department === 'TI').length})
            </button>
            <button
              onClick={() => setActiveDeptTab('ENGENHARIA')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDeptTab === 'ENGENHARIA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Engenharia ({categories.filter(c => c.department === 'ENGENHARIA').length})
            </button>
            <button
              onClick={() => setActiveDeptTab('MANUTENCAO')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDeptTab === 'MANUTENCAO'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Manutenção ({categories.filter(c => c.department === 'MANUTENCAO').length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar categoria..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <button
              onClick={() => setIsCreatingCat(!isCreatingCat)}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Categoria
            </button>
          </div>
        </div>

        {/* Create Category Panel */}
        {isCreatingCat && (
          <form onSubmit={handleCreateCategory} className="p-4 bg-blue-50/60 border-b border-blue-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Cadastrar Nova Categoria
              </h3>
              <button 
                type="button" 
                onClick={() => setIsCreatingCat(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hardware & Servidores"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Departamento Técnico *</label>
                <select
                  value={newCatDept}
                  onChange={e => setNewCatDept(e.target.value as Department)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TI">TI (Tecnologia da Informação)</option>
                  <option value="ENGENHARIA">Engenharia & Automação</option>
                  <option value="MANUTENCAO">Manutenção Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Descrição Breve (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Ativos e peças de infraestrutura"
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Subcategorias Iniciais (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Notebooks, Servidores Rack, Switches, Cabos UTP"
                value={newCatSubcatsText}
                onChange={e => setNewCatSubcatsText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingCat(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
              >
                Salvar Categoria
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FolderTree className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium text-slate-600">Nenhuma categoria encontrada</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? 'Tente ajustar os termos da busca.' : 'Clique em "Nova Categoria" para criar a primeira.'}
              </p>
            </div>
          ) : (
            filteredCategories.map(cat => {
              const count = getItemCountForCat(cat.name, cat.department);
              const isEditing = editingCatId === cat.id;
              const isAddingSub = addingSubcatForId === cat.id;

              const deptBadgeClass = 
                cat.department === 'TI' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                cat.department === 'ENGENHARIA' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div 
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-slate-300 shadow-2xs"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editCatName}
                            onChange={e => setEditCatName(e.target.value)}
                            className="w-full px-2.5 py-1 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Descrição breve..."
                            value={editCatDesc}
                            onChange={e => setEditCatDesc(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900">{cat.name}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${deptBadgeClass}`}>
                              {cat.department}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              ({count} {count === 1 ? 'item vinculado' : 'itens vinculados'})
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                            title="Salvar alterações"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                            title="Cancelar edição"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Editar categoria"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (count > 0) {
                                if (!window.confirm(`Existem ${count} itens vinculados a esta categoria. Tem certeza que deseja excluí-la?`)) {
                                  return;
                                }
                              }
                              deleteCategory(cat.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Excluir categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Section */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Subcategorias ({cat.subcategories.length})
                      </span>
                      <button
                        onClick={() => {
                          setAddingSubcatForId(isAddingSub ? null : cat.id);
                          setNewSubcatName('');
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Subcategoria
                      </button>
                    </div>

                    {/* Add Subcategory input */}
                    {isAddingSub && (
                      <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nome da nova subcategoria..."
                          value={newSubcatName}
                          onChange={e => setNewSubcatName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubcat(cat.id);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleAddSubcat(cat.id)}
                          className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                          Adicionar
                        </button>
                        <button
                          onClick={() => setAddingSubcatForId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Subcategories Chips */}
                    {cat.subcategories.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhuma subcategoria configurada</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.map(subcat => {
                          const subCount = getItemCountForSubcat(cat.name, subcat, cat.department);
                          return (
                            <span 
                              key={subcat}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
                            >
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span className="font-medium">{subcat}</span>
                              {subCount > 0 && (
                                <span className="px-1.5 py-0.2 bg-white text-[10px] text-slate-600 font-semibold rounded-full border border-slate-200">
                                  {subCount}
                                </span>
                              )}
                              <button
                                onClick={() => deleteSubcategory(cat.id, subcat)}
                                className="text-slate-400 hover:text-rose-600 ml-0.5"
                                title={`Remover subcategoria "${subcat}"`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span>As categorias e subcategorias são salvas e persistidas automaticamente.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
