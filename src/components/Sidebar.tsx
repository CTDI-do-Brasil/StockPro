import React, { useRef, useState } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  FolderTree, 
  BarChart3, 
  Package, 
  ArrowLeftRight, 
  ClipboardList, 
  Wrench, 
  MapPin, 
  Camera, 
  FileSpreadsheet, 
  HardDriveDownload, 
  HardDriveUpload, 
  Plus, 
  LogOut,
  User as UserIcon,
  Users,
  Database,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { AlertsModal } from './AlertsModal';
import { CategoriesModal } from './CategoriesModal';
import { UserProfileModal } from './UserProfileModal';
import { UsersManagementModal } from './UsersManagementModal';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenScanner: () => void;
  onOpenAuditReport: () => void;
  onOpenNewItem: () => void;
  onOpenQuickMove?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenAuditReport,
  onOpenNewItem,
  onOpenQuickMove
}) => {
  const { stats, alerts, selectedDept, backupData, restoreData } = useStock();
  const { user, logout, dbStatus } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const totalAlerts = alerts.length;

  const handleBackup = () => {
    const jsonStr = backupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_estoque_ti_eng_manut_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (window.confirm('Restaurar este backup substituirá os dados atuais do estoque. Deseja prosseguir?')) {
          const success = restoreData(content);
          if (success) {
            alert('Banco de dados de estoque restaurado com sucesso!');
          } else {
            alert('Erro ao processar o arquivo de backup. Formato inválido.');
          }
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectNav = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'inventario', label: 'Estoque Geral', icon: <Package className="w-4 h-4" /> },
    { id: 'movimentacoes', label: 'Movimentações', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'cautelas', label: 'Cautelas', icon: <ClipboardList className="w-4 h-4" />, badge: stats.activeLoansCount },
    { id: 'ordens', label: 'O.S. Manutenção', icon: <Wrench className="w-4 h-4" />, badge: stats.openWorkOrdersCount },
    { id: 'locais', label: 'Locais & Fornecedores', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs">
            TI
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">TECH-INV</div>
            <div className="text-[10px] text-slate-500 font-medium leading-none">Controle de Estoque</div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Abrir Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div 
              onClick={() => handleSelectNav('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors shrink-0">
                <span className="text-white font-bold text-sm tracking-wider">TI</span>
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span>TECH-INV</span>
                  <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full">
                    v2.0
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Almoxarifado Integrado
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Item Fast Trigger Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onOpenNewItem();
                setIsMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Novo Item de Estoque</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Principal
            </div>

            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Tools & Management */}
          <div className="px-3 py-2 border-t border-slate-100 mt-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Ferramentas & Ações
            </div>

            {/* Stock Alerts Button */}
            <button
              onClick={() => {
                setIsAlertsOpen(true);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                totalAlerts > 0
                  ? 'text-rose-700 bg-rose-50/70 hover:bg-rose-100/70'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-4 h-4 ${totalAlerts > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
                <span>Alertas de Estoque</span>
              </div>
              {totalAlerts > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-rose-600 text-white font-bold rounded-full">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Categories */}
            <button
              onClick={() => {
                setIsCategoriesOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
            >
              <FolderTree className="w-4 h-4 text-slate-500" />
              <span>Categorias</span>
            </button>

            {/* Barcode Scanner */}
            <button
              onClick={() => {
                onOpenScanner();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-500" />
              <span>Leitor Barcode & QR</span>
            </button>

            {/* Reports */}
            <button
              onClick={() => {
                onOpenAuditReport();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Relatórios & Auditoria</span>
            </button>

            {/* Backup & Restore */}
            <div className="pt-1">
              <button
                onClick={handleBackup}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
              >
                <HardDriveDownload className="w-4 h-4 text-slate-500" />
                <span>Baixar Backup JSON</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
              >
                <HardDriveUpload className="w-4 h-4 text-slate-500" />
                <span>Restaurar Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Bottom: User Profile & Database Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 ${
                    user.department === 'TI' ? 'bg-blue-600' : user.department === 'ENGENHARIA' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {user.department} • {user.role}
                    </div>
                  </div>
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Meu Perfil</span>
                  </button>

                  {(user.role === 'ADMIN' || user.role === 'GERENTE') && (
                    <button
                      onClick={() => {
                        setIsUsersModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Gerenciar Usuários (Postgres)</span>
                    </button>
                  )}

                  <div className="px-3 py-1.5 my-1 bg-slate-50 rounded-lg flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-slate-400" />
                      PostgreSQL
                    </span>
                    <span className={dbStatus?.connected ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {dbStatus?.connected ? 'Conectado' : 'Offline'}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair do Sistema</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Modals */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onOpenQuickMove={(item, type) => {
          setIsAlertsOpen(false);
          if (onOpenQuickMove) onOpenQuickMove();
        }}
      />

      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        initialDept={selectedDept !== 'TODOS' ? selectedDept : undefined}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <UsersManagementModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
      />
    </>
  );
};
