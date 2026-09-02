import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Department, UserRole } from '../types';
import { 
  X, 
  Users, 
  Search, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Database,
  Mail,
  Phone,
  UserCheck,
  UserX
} from 'lucide-react';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ isOpen, onClose }) => {
  const { token, dbStatus } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('TODOS');
  const [source, setSource] = useState<string>('');

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
        setSource(data.source || 'PostgreSQL');
      }
    } catch (err) {
      console.error('Erro ao buscar lista de usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, token]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setUsersList(prev =>
          prev.map(u => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.badge && u.badge.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDept = selectedDeptFilter === 'TODOS' || u.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Gerenciamento de Usuários</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {usersList.length} cadastrados ({source})
                </span>
              </div>
              <p className="text-xs text-slate-500">Contas e permissões salvas no PostgreSQL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="TODOS">Todos os Setores</option>
              <option value="TI">TI</option>
              <option value="ENGENHARIA">Engenharia</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>

            <button
              onClick={fetchUsers}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Recarregar do banco"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading && usersList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Carregando dados dos usuários do PostgreSQL...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhum usuário encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  u.isActive 
                    ? 'bg-white border-slate-200 hover:border-slate-300' 
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                    u.department === 'TI' ? 'bg-blue-600' : u.department === 'ENGENHARIA' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{u.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'GERENTE' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'TECNICO' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                      {u.badge && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {u.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </span>
                      {u.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {u.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    u.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {u.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Inativo
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(u.id, u.isActive)}
                    className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      u.isActive 
                        ? 'hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200' 
                        : 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border-slate-200'
                    }`}
                    title={u.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                  >
                    {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tabela: <strong className="text-slate-700 font-mono">public.users</strong> no PostgreSQL</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
