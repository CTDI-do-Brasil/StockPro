import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Department, UserRole } from '../types';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Phone, 
  IdCard, 
  Calendar, 
  Save, 
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, dbStatus } = useAuth();

  const initialDepts: Department[] = (user?.departments && user.departments.length > 0)
    ? user.departments
    : (user?.department 
        ? (user.department.split(',').map(d => d.trim().toUpperCase() as Department).filter(d => ['TI', 'ENGENHARIA', 'MANUTENCAO'].includes(d)))
        : ['TI'] as Department[]);

  const [name, setName] = useState(user?.name || '');
  const [departments, setDepartments] = useState<Department[]>(initialDepts.length > 0 ? initialDepts : ['TI']);
  const [role, setRole] = useState<UserRole>(user?.role || 'OPERADOR');
  const [badge, setBadge] = useState(user?.badge || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !user) return null;

  const toggleDept = (dept: Department) => {
    setDepartments(prev => {
      const exists = prev.includes(dept);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== dept);
      }
      return [...prev, dept];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const result = await updateProfile({
      name,
      department: departments[0] || 'TI',
      departments,
      role,
      badge,
      phone,
      avatar,
    });

    setIsSaving(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso no PostgreSQL!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao atualizar dados.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Meu Perfil de Usuário</h3>
              <p className="text-xs text-slate-500">Informações e credenciais salvas no banco</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* E-mail (somente leitura) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              E-mail de Acesso (Chave única)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-600 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Departamentos Habilitados */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Departamentos Habilitados *
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                (Selecione um ou mais)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'TI' as Department, label: 'TI' },
                { id: 'ENGENHARIA' as Department, label: 'Engenharia' },
                { id: 'MANUTENCAO' as Department, label: 'Manutenção' },
              ].map(dept => {
                const isSelected = departments.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDept(dept.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? dept.id === 'TI'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                          : dept.id === 'ENGENHARIA'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                          : 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{dept.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Função / Cargo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Função / Cargo
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="OPERADOR">Operador</option>
              <option value="TECNICO">Técnico</option>
              <option value="GERENTE">Gerente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>


          {/* Metadados */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                Persistência:
              </span>
              <span className="font-semibold text-slate-700">
                {dbStatus?.connected ? 'PostgreSQL Ativo' : 'Memória Local'}
              </span>
            </div>
            {user.lastLogin && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Último Login:
                </span>
                <span className="font-mono text-slate-600">
                  {new Date(user.lastLogin).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
