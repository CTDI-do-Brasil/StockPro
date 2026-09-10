import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Department, UserRole } from '../types';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register, dbStatus } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form (aceita nome.sobrenome ou email)
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState<Department>('TI');
  const [regRole, setRegRole] = useState<UserRole>('OPERADOR');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = await login({
      email: username.trim(),
      password: password,
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
    });

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao realizar cadastro.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b101d] text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      
      {/* Card Centralizado conforme modelo */}
      <div className="w-full max-w-[420px] bg-[#131b2e] border border-[#222f46] rounded-3xl shadow-2xl p-7 sm:p-9">
        
        {/* Logo CTDI */}
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.png" 
            alt="CTDI" 
            className="h-16 w-auto object-contain select-none"
          />
        </div>

        {/* Título e Subtítulo */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Acesso ao Sistema' : 'Novo Cadastro'}
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            {mode === 'login' 
              ? 'Insira suas credenciais para continuar.' 
              : 'Preencha seus dados para criar sua conta.'}
          </p>
        </div>

        {/* Alternador de Abas Discreto */}
        <div className="flex bg-[#0c1322] p-1 rounded-2xl border border-[#222f46] mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Mensagens de Alerta */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="NOME.SOBRENOME"
                className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors uppercase"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-4 py-3 pr-11 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Entrar'
              )}
            </button>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                Não tem um acesso? <span className="text-blue-400 font-semibold">Criar nova conta</span>
              </button>
            </div>
          </form>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Usuário / Login *
              </label>
              <input
                type="text"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Ex: CARLOS.SILVA ou carlos.silva@ctdi.com"
                className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Completo (Opcional)
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Departamento
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value as Department)}
                  className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="TI">TI</option>
                  <option value="ENGENHARIA">Engenharia</option>
                  <option value="MANUTENCAO">Manutenção</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cargo
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="OPERADOR">Operador</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-[#0c1322] border border-[#222f46] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-blue-600/20"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Cadastrar e Acessar'
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                Já possui acesso? <span className="text-blue-400 font-semibold">Fazer Login</span>
              </button>
            </div>
          </form>
        )}

        {/* Rodapé Discreto com Status */}
        <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {dbStatus?.connected ? 'PostgreSQL' : 'Modo Local'}
          </span>
          <span className="font-mono text-[10px] text-slate-600">CTDI Almoxarifado</span>
        </div>

      </div>

    </div>
  );
};


