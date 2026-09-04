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
  MapPin, 
  FileSpreadsheet, 
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
  onOpenScanner?: () => void;
  onOpenAuditReport: () => void;
  onOpenNewItem: () => void;
  onOpenQuickMove?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAuditReport,
  onOpenNewItem,
  onOpenQuickMove
}) => {
  const { stats, alerts, selectedDept } = useStock();
  const { user, logout, dbStatus } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const totalAlerts = alerts.length;

  const handleSelectNav = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'inventario', label: 'Estoque Geral', icon: <Package className="w-4 h-4" /> },
    { id: 'movimentacoes', label: 'Movimentações', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'solicitacoes', label: 'Solicitações', icon: <ClipboardList className="w-4 h-4" />, badge: stats.pendingRequestsCount },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div 
          onClick={() => handleSelectNav('dashboard')}
          className="flex flex-col items-start cursor-pointer"
        >
          <img src="/logo.png" alt="CTDI" className="h-7 w-auto object-contain" />
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Controle de estoque</span>
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
          <div className="p-4 border-b border-slate-100 relative">
            <div 
              onClick={() => handleSelectNav('dashboard')}
              className="flex flex-col items-center justify-center cursor-pointer group text-center py-2"
            >
              <img 
                src="/logo.png" 
                alt="CTDI" 
                className="h-11 max-w-[190px] w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <span className="text-xs font-semibold text-slate-600 tracking-wide mt-2">
                Controle de estoque
              </span>
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg absolute right-3 top-3"
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
