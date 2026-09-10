import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Department, UserRole } from '../types';
import { 
  X, 
  Users, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Database,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Plus,
  Edit2,
  KeyRound,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_DEPARTMENTS: { id: Department; label: string; bgBadge: string; textBadge: string; borderBadge: string }[] = [
  { id: 'TI', label: 'TI', bgBadge: 'bg-blue-50', textBadge: 'text-blue-700', borderBadge: 'border-blue-200' },
  { id: 'ENGENHARIA', label: 'Engenharia', bgBadge: 'bg-emerald-50', textBadge: 'text-emerald-700', borderBadge: 'border-emerald-200' },
  { id: 'MANUTENCAO', label: 'Manutenção', bgBadge: 'bg-amber-50', textBadge: 'text-amber-700', borderBadge: 'border-amber-200' },
];

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ isOpen, onClose }) => {
  const { token, user: currentUser } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('TODOS');
  const [source, setSource] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados dos Modais de Ação
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Usuário selecionado para edição/redefinição/exclusão
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Formulário de Criação
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'TI' as Department,
    departments: ['TI'] as Department[],
    role: 'OPERADOR' as UserRole,
    badge: '',
    phone: '',
  });

  // Formulário de Edição (Ajustar)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    department: 'TI' as Department,
    departments: ['TI'] as Department[],
    role: 'OPERADOR' as UserRole,
    badge: '',
    phone: '',
    isActive: true,
  });

  // Formulário de Redefinição de Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const toggleCreateDept = (dept: Department) => {
    setCreateForm(prev => {
      const exists = prev.departments.includes(dept);
      let next: Department[];
      if (exists) {
        if (prev.departments.length === 1) return prev; // Mantém ao menos um departamento
        next = prev.departments.filter(d => d !== dept);
      } else {
        next = [...prev.departments, dept];
      }
      return {
        ...prev,
        departments: next,
        department: next[0] || 'TI'
      };
    });
  };

  const toggleEditDept = (dept: Department) => {
    setEditForm(prev => {
      const exists = prev.departments.includes(dept);
      let next: Department[];
      if (exists) {
        if (prev.departments.length === 1) return prev; // Mantém ao menos um departamento
        next = prev.departments.filter(d => d !== dept);
      } else {
        next = [...prev.departments, dept];
      }
      return {
        ...prev,
        departments: next,
        department: next[0] || 'TI'
      };
    });
  };

  // Carregar lista de usuários
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
      setFeedbackMessage(null);
    }
  }, [isOpen, token]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // Alternar Status Ativo / Inativo
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
        showNotification('success', `Status do usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Erro ao alterar status.');
      }
    } catch (err) {
      showNotification('error', 'Falha na comunicação com o servidor.');
    }
  };

  // 1. CRIAR USUÁRIO
  const handleOpenCreate = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      department: 'TI',
      departments: ['TI'],
      role: 'OPERADOR',
      badge: '',
      phone: '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      showNotification('error', 'Nome, e-mail e senha inicial são obrigatórios.');
      return;
    }

    if (!createForm.departments || createForm.departments.length === 0) {
      showNotification('error', 'Selecione pelo menos um departamento.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...createForm,
          department: createForm.departments.join(', ')
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsCreateOpen(false);
        showNotification('success', data.message || 'Usuário cadastrado com sucesso!');
        await fetchUsers();
      } else {
        showNotification('error', data.error || 'Erro ao criar usuário.');
      }
    } catch (err) {
      showNotification('error', 'Falha na conexão ao criar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. AJUSTAR USUÁRIO
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    const userDepts = (user.departments && user.departments.length > 0)
      ? user.departments
      : (user.department 
          ? (user.department.split(',').map(d => d.trim().toUpperCase() as Department).filter(d => ['TI', 'ENGENHARIA', 'MANUTENCAO'].includes(d)))
          : ['TI'] as Department[]);
    const finalDepts = userDepts.length > 0 ? userDepts : (['TI'] as Department[]);

    setEditForm({
      name: user.name,
      email: user.email,
      department: finalDepts[0],
      departments: finalDepts,
      role: user.role,
      badge: user.badge || '',
      phone: user.phone || '',
      isActive: user.isActive,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      showNotification('error', 'Nome e e-mail são obrigatórios.');
      return;
    }

    if (!editForm.departments || editForm.departments.length === 0) {
      showNotification('error', 'Selecione pelo menos um departamento.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          department: editForm.departments.join(', ')
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsEditOpen(false);
        showNotification('success', data.message || 'Usuário atualizado com sucesso!');
        setUsersList(prev => prev.map(u => (u.id === selectedUser.id ? data.user : u)));
      } else {
        showNotification('error', data.error || 'Erro ao atualizar dados do usuário.');
      }
    } catch (err) {
      showNotification('error', 'Falha na conexão ao atualizar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. REDEFINIR SENHA
  const handleOpenReset = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setIsResetOpen(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;

    if (!newPassword || newPassword.length < 4) {
      showNotification('error', 'A nova senha deve possuir pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('error', 'A confirmação de senha não confere.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsResetOpen(false);
        showNotification('success', data.message || 'Senha redefinida com sucesso!');
      } else {
        showNotification('error', data.error || 'Erro ao redefinir senha.');
      }
    } catch (err) {
      showNotification('error', 'Falha ao redefinir senha do usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. EXCLUIR USUÁRIO
  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!token || !selectedUser) return;

    if (currentUser?.id === selectedUser.id) {
      showNotification('error', 'Você não pode excluir sua própria conta conectada.');
      setIsDeleteOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setIsDeleteOpen(false);
        showNotification('success', data.message || 'Usuário excluído com sucesso.');
        setUsersList(prev => prev.filter(u => u.id !== selectedUser.id));
      } else {
        showNotification('error', data.error || 'Erro ao excluir usuário.');
      }
    } catch (err) {
      showNotification('error', 'Falha ao excluir usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.badge && u.badge.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const userDepts = (u.departments && u.departments.length > 0)
      ? u.departments
      : (u.department ? u.department.split(',').map(d => d.trim().toUpperCase()) : ['TI']);

    const matchesDept = selectedDeptFilter === 'TODOS' || userDepts.includes(selectedDeptFilter);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Gerenciamento de Usuários</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {usersList.length} cadastrados ({source})
                </span>
              </div>
              <p className="text-xs text-slate-500">Ajuste, criação e redefinição de contas no PostgreSQL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação Toast */}
        {feedbackMessage && (
          <div className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              {feedbackMessage.text}
            </span>
            <button 
              onClick={() => setFeedbackMessage(null)}
              className="p-1 hover:bg-black/5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filtros e Barra de Ações */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-1 w-full items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            >
              <option value="TODOS">Todos os Departamentos</option>
              <option value="TI">TI</option>
              <option value="ENGENHARIA">Engenharia</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>

            <button
              onClick={fetchUsers}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Recarregar usuários"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          {/* Botão de Criação de Novo Usuário */}
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* Lista de Usuários */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading && usersList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-600" />
              Carregando dados dos usuários do PostgreSQL...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Nenhum usuário encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const uDepts: Department[] = (u.departments && u.departments.length > 0)
                ? u.departments
                : (u.department 
                    ? (u.department.split(',').map(d => d.trim().toUpperCase() as Department).filter(d => ['TI', 'ENGENHARIA', 'MANUTENCAO'].includes(d)))
                    : ['TI'] as Department[]);
              const primaryDept = uDepts[0] || 'TI';

              return (
                <div
                  key={u.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    u.isActive 
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs' 
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 ${
                      primaryDept === 'TI' ? 'bg-blue-600' : primaryDept === 'ENGENHARIA' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate mr-1">{u.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'GERENTE' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'TECNICO' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                        {uDepts.map(dept => (
                          <span
                            key={dept}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              dept === 'TI' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              dept === 'ENGENHARIA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Ações por Usuário */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 mr-1 ${
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

                  {/* Ajustar Dados */}
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="Ajustar dados do usuário"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-medium">Ajustar</span>
                  </button>

                  {/* Redefinir Senha */}
                  <button
                    onClick={() => handleOpenReset(u)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="Redefinir senha"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-medium">Senha</span>
                  </button>

                  {/* Alternar Ativo/Inativo */}
                  <button
                    onClick={() => handleToggleStatus(u.id, u.isActive)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      u.isActive 
                        ? 'hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200' 
                        : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border-slate-200'
                    }`}
                    title={u.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                  >
                    {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleOpenDelete(u)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Excluir usuário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
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

        {/* ----------------- SUBMODAL 1: CRIAR NOVO USUÁRIO ----------------- */}
        {isCreateOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 flex flex-col max-h-[90%] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Novo Usuário</h4>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="usuario@empresa.com"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha Inicial *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Departamentos com Seleção Múltipla */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Departamentos Habilitados *
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      (Selecione um ou mais)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_DEPARTMENTS.map(dept => {
                      const isSelected = createForm.departments.includes(dept.id);
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => toggleCreateDept(dept.id)}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil / Cargo *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="TECNICO">TECNICO</option>
                    <option value="GERENTE">GERENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>


                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- SUBMODAL 2: AJUSTAR USUÁRIO ----------------- */}
        {isEditOpen && selectedUser && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 flex flex-col max-h-[90%] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Ajustar Usuário</h4>
                    <p className="text-[11px] text-slate-500">{selectedUser.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3.5 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Departamentos com Seleção Múltipla */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Departamentos Habilitados *
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      (Selecione um ou mais)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_DEPARTMENTS.map(dept => {
                      const isSelected = editForm.departments.includes(dept.id);
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => toggleEditDept(dept.id)}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil / Cargo *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="TECNICO">TECNICO</option>
                    <option value="GERENTE">GERENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>


                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="editIsActive" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                    Usuário com acesso Ativo ao sistema
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- SUBMODAL 3: REDEFINIR SENHA ----------------- */}
        {isResetOpen && selectedUser && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Redefinir Senha</h4>
                    <p className="text-[11px] text-slate-500">{selectedUser.name} ({selectedUser.email})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsResetOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-3.5 mt-4">
                <p className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
                  Insira uma nova senha para o usuário. O hash da senha será atualizado diretamente no banco PostgreSQL.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full text-xs px-3 py-2 pr-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? 'Redefinindo...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- SUBMODAL 4: CONFIRMAR EXCLUSÃO ----------------- */}
        {isDeleteOpen && selectedUser && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Excluir Usuário</h4>
                  <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Tem certeza que deseja excluir a conta de <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email})?
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

