import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Department, UserRole } from '../types';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Server,
  Cpu,
  Wrench,
  ShieldCheck,
  KeyRound,
  HelpCircle,
  X,
  QrCode,
  Check,
  LogIn,
  UserPlus
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register, dbStatus } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState(() => {
    return localStorage.getItem('tech_inv_remembered_email') || 'admin@ctdi.com';
  });
  const [loginPassword, setLoginPassword] = useState('123456');

  // Formulário de Cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState<Department>('TI');
  const [regRole, setRegRole] = useState<UserRole>('OPERADOR');
  const [regBadge, setRegBadge] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Salvar/remover email lembrado
  useEffect(() => {
    if (rememberEmail && loginEmail) {
      localStorage.setItem('tech_inv_remembered_email', loginEmail);
    }
  }, [rememberEmail, loginEmail]);

  // Acesso Rápido / Preenchimento de Demonstração
  const handleQuickFill = (role: 'admin' | 'eng' | 'manut') => {
    setMode('login');
    setErrorMessage(null);
    if (role === 'admin') {
      setLoginEmail('admin@ctdi.com');
      setLoginPassword('123456');
    } else if (role === 'eng') {
      setLoginEmail('engenharia@ctdi.com');
      setLoginPassword('123456');
    } else {
      setLoginEmail('manutencao@ctdi.com');
      setLoginPassword('123456');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = await login({
      email: loginEmail,
      password: loginPassword,
    });

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao efetuar login.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword.length < 4) {
      setErrorMessage('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setIsLoading(true);

    const result = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      department: regDept,
      role: regRole,
      badge: regBadge,
      phone: regPhone,
    });

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao realizar cadastro.');
    }
  };

  // Avaliação de força de senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length < 6) return { score: 1, label: 'Fraca', color: 'bg-rose-500' };
    if (pass.length < 10) return { score: 2, label: 'Média', color: 'bg-amber-500' };
    return { score: 3, label: 'Forte', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(regPassword);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Luzes e Gradientes Ambientes no Fundo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Container Principal Split (Layout 2 Colunas no Desktop) */}
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/50 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* ================= COLUNA ESQUERDA: HERO & APRESENTAÇÃO ================= */}
        <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 relative overflow-hidden">
          {/* Efeito de brilho sutil interno */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Topo: Logo & Badge */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white px-3.5 py-2 rounded-xl shadow-md border border-slate-700/50 flex items-center justify-center">
                <img src="/logo.png" alt="CTDI" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  TECH-INV • v2.4
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Almoxarifado & Gestão de Estoque
                </span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Controle Operacional <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Inteligente & Confiável
              </span>
            </h1>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Plataforma centralizada para gestão de insumos, movimentações, cautelas de equipamentos e relatórios por centro de custo.
            </p>

            {/* Vitrine dos 3 Departamentos Oficiais */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/30 hover:border-blue-700/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">TI</span>
                    <span className="text-[10px] font-mono text-blue-400">Ativos & Redes</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Servidores, notebooks, periféricos e cabos</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 hover:border-emerald-700/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Engenharia</span>
                    <span className="text-[10px] font-mono text-emerald-400">Projetos & P&D</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Sensores, instrumentos de medição e protótipos</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30 hover:border-amber-700/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Manutenção</span>
                    <span className="text-[10px] font-mono text-amber-400">Oficina & Predial</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Peças sobressalentes, ferramentas e consumíveis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé da Coluna Esquerda: Badges de Segurança */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autenticação Bcrypt & JWT</span>
            </span>
            <span className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Código de Barras</span>
            </span>
          </div>
        </div>

        {/* ================= COLUNA DIREITA: FORMULÁRIO DE LOGIN / CADASTRO ================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-slate-900/60 relative">
          
          <div>
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Cadastro de Colaborador'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login' 
                    ? 'Insira suas credenciais corporativas para acessar o painel' 
                    : 'Preencha os dados abaixo para solicitar cadastro no sistema'}
                </p>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                title="Ajuda com o acesso"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Alternador Login / Cadastro (Pill Tabs) */}
            <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar no Sistema</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>

            {/* Painel de Acesso Rápido para Demonstração (Facilita testes locais) */}
            {mode === 'login' && (
              <div className="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Acesso Rápido de Teste:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      loginEmail === 'admin@ctdi.com' 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    TI (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('eng')}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      loginEmail === 'engenharia@ctdi.com' 
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    Engenharia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('manut')}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      loginEmail === 'manutencao@ctdi.com' 
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    Manutenção
                  </button>
                </div>
              </div>
            )}

            {/* Mensagens de Alerta / Erro */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ================= FORMULÁRIO DE LOGIN ================= */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@ctdi.com"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Senha de Acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHelpModalOpen(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Lembrar meu e-mail neste dispositivo</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Acessar Almoxarifado</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ================= FORMULÁRIO DE CADASTRO ================= */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex: Carlos Silva"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail Corporativo *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="carlos.silva@ctdi.com"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Departamento *
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value as Department)}
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="TI">TI</option>
                      <option value="ENGENHARIA">Engenharia</option>
                      <option value="MANUTENCAO">Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Função / Perfil *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="OPERADOR">Operador</option>
                      <option value="TECNICO">Técnico</option>
                      <option value="GERENTE">Gerente</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Matrícula / Crachá
                    </label>
                    <input
                      type="text"
                      value={regBadge}
                      onChange={(e) => setRegBadge(e.target.value)}
                      placeholder="Ex: TI-405"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Telefone / Ramal
                    </label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="(11) 9..."
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Indicador de força de senha */}
                  {regPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 ${passStrength.score >= 1 ? passStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${passStrength.score >= 2 ? passStrength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${passStrength.score >= 3 ? passStrength.color : 'bg-transparent'}`} />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {passStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Cadastrar e Entrar</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ================= RODAPÉ DA COLUNA DIREITA: STATUS DO BANCO ================= */}
          <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Banco de Dados:</span>
              {dbStatus?.connected ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  PostgreSQL Conectado ({dbStatus.database || 'controle_estoque'})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Modo Local / Memória Ativo
                </span>
              )}
            </div>

            <span className="font-mono text-[10px] text-slate-500">
              CTDI SCM Enterprise
            </span>
          </div>

        </div>

      </div>

      {/* Modal de Ajuda com Acesso / Esqueci Senha */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ajuda & Redefinição de Senha</h3>
                <p className="text-[11px] text-slate-400">Controle de Acessos TECH-INV</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Por motivos de conformidade e segurança operacional, senhas corporativas são protegidas com criptografia de mão única (<strong className="text-white">Bcrypt</strong>).
              </p>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Como redefinir:</strong> O administrador do almoxarifado pode redefinir sua senha a qualquer momento através do menu <em className="text-blue-300">"Gerenciar Usuários"</em>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Acesso Rápido de Teste:</strong> Para demonstração local, use <code className="text-blue-300 bg-blue-950/50 px-1 py-0.5 rounded">admin@ctdi.com</code> com a senha <code className="text-blue-300 bg-blue-950/50 px-1 py-0.5 rounded">123456</code>.</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Se você é administrador do sistema e precisa de suporte técnico, entre em contato com a equipe de infraestrutura de TI.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

