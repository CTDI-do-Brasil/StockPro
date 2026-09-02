import React, { useState } from 'react';
import { StockProvider, useStock } from './context/StockContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Department, StockItem } from './types';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { MovementsView } from './components/MovementsView';
import { LoansView } from './components/LoansView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { LocationsSuppliersView } from './components/LocationsSuppliersView';
import { ItemModal } from './components/ItemModal';
import { QuickMovementModal } from './components/QuickMovementModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { LoanModal } from './components/LoanModal';
import { BarcodeLabelModal } from './components/BarcodeRenderer';
import { AuditReportModal } from './components/AuditReportModal';

const MainApp: React.FC = () => {
  const { items } = useStock();
  const { user, isAuthenticated, isLoading, dbStatus } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalTarget, setItemModalTarget] = useState<StockItem | null>(null);
  const [itemModalDefaultDept, setItemModalDefaultDept] = useState<Department | undefined>();

  const [isQuickMoveOpen, setIsQuickMoveOpen] = useState(false);
  const [quickMoveItem, setQuickMoveItem] = useState<StockItem | undefined>();
  const [quickMoveType, setQuickMoveType] = useState<'ENTRADA' | 'SAIDA' | undefined>();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanTargetItem, setLoanTargetItem] = useState<StockItem | undefined>();

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelItem, setLabelItem] = useState<StockItem | null>(null);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Carregamento de Sessão Inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">Carregando TECH-INV...</p>
        <span className="text-xs text-slate-500 mt-1">Conectando ao PostgreSQL & Sessão</span>
      </div>
    );
  }

  // Se o usuário não estiver logado, exibe a tela de login
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Handlers
  const handleOpenNewItem = (dept?: Department) => {
    setItemModalTarget(null);
    setItemModalDefaultDept(dept);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: StockItem) => {
    setItemModalTarget(item);
    setIsItemModalOpen(true);
  };

  const handleOpenQuickMove = (item?: StockItem, type?: 'ENTRADA' | 'SAIDA') => {
    setQuickMoveItem(item);
    setQuickMoveType(type);
    setIsQuickMoveOpen(true);
  };

  const handleOpenLoan = (item?: StockItem) => {
    setLoanTargetItem(item);
    setIsLoanModalOpen(true);
  };

  const handlePrintLabel = (item: StockItem) => {
    setLabelItem(item);
    setIsLabelModalOpen(true);
  };

  const handleScanFound = (item: StockItem) => {
    setIsScannerOpen(false);
    handleOpenQuickMove(item);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAuditReport={() => setIsAuditModalOpen(true)}
        onOpenNewItem={() => handleOpenNewItem()}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onOpenQuickMove={handleOpenQuickMove}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenNewItem={() => handleOpenNewItem()}
            onOpenNewLoan={() => handleOpenLoan()}
            onPrintLabel={handlePrintLabel}
          />
        )}

        {activeTab === 'inventario' && (
          <InventoryView
            onOpenNewItem={handleOpenNewItem}
            onEditItem={handleEditItem}
            onQuickMove={handleOpenQuickMove}
            onPrintLabel={handlePrintLabel}
            onOpenLoan={handleOpenLoan}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'movimentacoes' && (
          <MovementsView
            onOpenQuickMove={() => handleOpenQuickMove()}
          />
        )}

        {activeTab === 'cautelas' && (
          <LoansView
            onOpenNewLoan={handleOpenLoan}
          />
        )}

        {activeTab === 'ordens' && (
          <WorkOrdersView />
        )}

        {activeTab === 'locais' && (
          <LocationsSuppliersView />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Sistema de Almoxarifado Integrado • TI, Engenharia & Manutenção Industrial
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {items.length} itens cadastrados • {dbStatus?.connected ? 'PostgreSQL Ativo' : 'Sessão Segura'}
          </span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemModalTarget}
        defaultDepartment={itemModalDefaultDept}
      />

      <QuickMovementModal
        isOpen={isQuickMoveOpen}
        onClose={() => setIsQuickMoveOpen(false)}
        preselectedItem={quickMoveItem}
        initialType={quickMoveType}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onItemFound={handleScanFound}
      />

      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        preselectedItem={loanTargetItem}
      />

      {labelItem && (
        <BarcodeLabelModal
          isOpen={isLabelModalOpen}
          onClose={() => { setIsLabelModalOpen(false); setLabelItem(null); }}
          item={labelItem}
        />
      )}

      {isAuditModalOpen && (
        <AuditReportModal
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <MainApp />
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
