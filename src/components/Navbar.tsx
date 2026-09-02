import React, { useRef, useState } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { Department } from '../types';
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
  ShieldCheck
} from 'lucide-react';
import { AlertsModal } from './AlertsModal';
import { CategoriesModal } from './CategoriesModal';
import { UserProfileModal } from './UserProfileModal';
import { UsersManagementModal } from './UsersManagementModal';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenScanner: () => void;
  onOpenAuditReport: () => void;
  onOpenNewItem: () => void;
  onOpenQuickMove?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenAuditReport,
  onOpenNewItem,
  onOpenQuickMove
}) => {
  const { stats, alerts, selectedDept, setSelectedDept, backupData, restoreData } = useStock();
  const { user, logout, dbStatus } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICO').length;

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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
                <span className="text-white font-bold text-xs tracking-wider">TI</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>TECH-INV</span>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    TI • ENG • MANUT
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Almoxarifado & Controle Integrado
                </div>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'inventario', label: 'Estoque Geral', icon: <Package className="w-3.5 h-3.5" /> },
              { id: 'movimentacoes', label: 'Movimentações', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
              { id: 'cautelas', label: 'Cautelas', icon: <ClipboardList className="w-3.5 h-3.5" />, badge: stats.activeLoansCount },
              { id: 'ordens', label: 'O.S. Manutenção', icon: <Wrench className="w-3.5 h-3.5" />, badge: stats.openWorkOrdersCount },
              { id: 'locais', label: 'Locais & Fornecedores', icon: <MapPin className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2">
            
            {/* Stock Alerts Notification Bell */}
            <button
              onClick={() => setIsAlertsOpen(true)}
              className={`p-2 rounded-xl text-xs font-medium relative border transition-colors flex items-center justify-center cursor-pointer ${
                totalAlerts > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={totalAlerts > 0 ? `${totalAlerts} alertas de estoque baixo / crítico` : 'Nenhum alerta de estoque pendente'}
            >
              <Bell className={`w-4 h-4 ${totalAlerts > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-600'}`} />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full shadow-xs border-2 border-white">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Categories Management Button */}
            <button
              onClick={() => setIsCategoriesOpen(true)}
              className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Gerenciar Categorias e Subcategorias"
            >
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span className="hidden xl:inline">Categorias</span>
            </button>

            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Leitor de Código de Barras & QR"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span className="hidden xl:inline">Leitor</span>
            </button>

            {/* Reports & Audit Button */}
            <button
              onClick={onOpenAuditReport}
              className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Relatórios de Auditoria e Compras"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <span className="hidden xl:inline">Relatórios</span>
            </button>

            {/* Backup / Restore Dropdown */}
            <div className="relative group">
              <button
                className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Backup e Restauração de Dados"
              >
                <HardDriveDownload className="w-4 h-4 text-slate-600" />
              </button>
              
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-50 animate-in fade-in duration-100">
                <button
                  onClick={handleBackup}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                >
                  <HardDriveDownload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Baixar Backup JSON</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                >
                  <HardDriveUpload className="w-3.5 h-3.5 text-emerald-600" />
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

            {/* New Item Fast Trigger */}
            <button
              onClick={onOpenNewItem}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo Item</span>
            </button>

            {/* User Profile & Auth Menu */}
            {user && (
              <div className="relative group ml-1">
                <button
                  className="flex items-center gap-2 p-1.5 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Menu do Usuário"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                    user.department === 'TI' ? 'bg-blue-600' : user.department === 'ENGENHARIA' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-none">
                      {user.department} • {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>

                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                        {user.department}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Meu Perfil</span>
                  </button>

                  {(user.role === 'ADMIN' || user.role === 'GERENTE') && (
                    <button
                      onClick={() => setIsUsersModalOpen(true)}
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
              </div>
            )}

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'inventario', label: 'Estoque', icon: <Package className="w-3.5 h-3.5" /> },
            { id: 'movimentacoes', label: 'Movimentações', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
            { id: 'cautelas', label: 'Cautelas', icon: <ClipboardList className="w-3.5 h-3.5" />, badge: stats.activeLoansCount },
            { id: 'ordens', label: 'Ordens', icon: <Wrench className="w-3.5 h-3.5" />, badge: stats.openWorkOrdersCount },
            { id: 'locais', label: 'Locais', icon: <MapPin className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="text-[9px] px-1.5 bg-blue-100 text-blue-800 rounded-full font-mono font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>

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

    </header>
  );
};
