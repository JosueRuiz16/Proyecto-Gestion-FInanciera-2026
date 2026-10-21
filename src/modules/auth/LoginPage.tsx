import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Boxes,
  Clock,
  Coins,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Moon,
  PiggyBank,
  ShieldCheck,
  Sun,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthContext';
import { APP_USERS, findUserByUsername } from '../../data/auth/users';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem('gfo_theme') === 'dark'
  );

  const selectedUser = findUserByUsername(username);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('gfo_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo iniciar sesión.');
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="glass-frame rounded-[2rem] w-full max-w-6xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1.25fr_1fr]">
        {/* Panel izquierdo: logo, foto del equipo con bordes degradados e ilustración financiera */}
        <section className="relative p-5 sm:p-8 lg:p-10 flex flex-col justify-between gap-5 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <span className="block text-sm font-bold text-slate-900">
                Sistema Financiero
              </span>
            </div>
          </div>

          {/* Imagen del equipo en el espacio central: más compacta en móvil y con bordes difuminados/degradados */}
          <div className="relative z-10 w-full max-w-[270px] sm:max-w-sm lg:max-w-lg mx-auto my-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src={`${import.meta.env.BASE_URL}avatars/team-login.jpg`}
                alt="Equipo de desarrollo GFO IS2122"
                style={{
                  objectPosition: 'center 42%',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 92% 90% at 50% 50%, #000 62%, rgba(0,0,0,0.45) 84%, transparent 100%)',
                  maskImage:
                    'radial-gradient(ellipse 92% 90% at 50% 50%, #000 62%, rgba(0,0,0,0.45) 84%, transparent 100%)',
                }}
                className="w-full h-44 sm:h-64 lg:h-80 object-cover rounded-3xl transition-all"
              />
            </div>
          </div>

          {/* Ilustración compuesta con iconos y mini-gráfico */}
          <div className="relative h-44 hidden sm:block" aria-hidden="true">
            <div className="absolute left-0 bottom-0 flex items-end gap-2 h-32">
              {[40, 65, 50, 85, 70, 100, 90].map((h, i) => (
                <div
                  key={i}
                  className={`w-5 rounded-t-lg ${i % 3 === 1 ? 'bg-emerald-400/70' : 'bg-blue-500/60'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="absolute left-48 bottom-2 p-4 rounded-2xl bg-rose-100/80 text-rose-400 shadow-md">
              <PiggyBank className="w-12 h-12" />
            </div>
            <div className="absolute left-72 bottom-16 p-3 rounded-full bg-amber-100/90 text-amber-500 shadow-md">
              <Coins className="w-8 h-8" />
            </div>
            <div className="absolute right-6 top-0 p-3 rounded-full bg-white/70 text-blue-500 shadow-md">
              <Clock className="w-9 h-9" />
            </div>
            <div className="absolute right-24 bottom-4 flex gap-2">
              {[BarChart3, Wallet, Boxes].map((Icon, i) => (
                <span key={i} className="p-2.5 rounded-xl bg-white/70 text-blue-600 shadow-sm">
                  <Icon className="w-5 h-5" />
                </span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-24 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" />
        </section>

        {/* Panel derecho: tarjeta de inicio de sesión */}
        <section className="p-4 sm:p-8 flex items-center">
          <form
            onSubmit={handleSubmit}
            className="glass-card w-full p-6 sm:p-8 space-y-5"
            noValidate
          >
            <div className="pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">Iniciar sesión</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Accede con tu usuario para ver tus módulos y tu presupuesto personal.
                </p>
              </div>
              <button
                type="button"
                aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                title={isDark ? 'Cambiar a Tema Claro' : 'Tema Oscuro (Verde / Negro)'}
                onClick={() => setIsDark((d) => !d)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-emerald-400 bg-white/70 dark:bg-emerald-950/60 hover:bg-white dark:hover:bg-emerald-900/70 border border-slate-200 dark:border-emerald-500/30 transition-all shadow-sm shrink-0"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Claro' : 'Oscuro'}</span>
              </button>
            </div>

            {/* Avatar dinámico según el usuario ingresado o seleccionado */}
            <div className="flex flex-col items-center pt-1">
              <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-emerald-400 shadow-lg">
                {selectedUser?.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.displayName}
                    style={{ objectPosition: selectedUser.avatarPosition ?? 'center' }}
                    className="w-full h-full rounded-full object-cover bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-2xl font-extrabold text-blue-600 dark:text-emerald-400">
                    {selectedUser ? (
                      selectedUser.displayName.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-10 h-10 opacity-60" />
                    )}
                  </div>
                )}
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800">
                {selectedUser
                  ? `Hola, ${selectedUser.displayName}`
                  : 'Selecciona o escribe tu usuario'}
              </span>
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="Ej. josue"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full border border-slate-200 pl-9 pr-10 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-blue-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors"
            >
              <LogIn className="w-4 h-4" /> Ingresar
            </button>

            {/* Acceso rápido: rellena el usuario (la contraseña se escribe igual) */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Usuarios del sistema</p>
              <div className="flex flex-wrap gap-1.5">
                {APP_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUsername(u.username);
                      setError(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${username.trim().toLowerCase() === u.username
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white/70 text-slate-700 border-slate-200 hover:border-blue-400'
                      }`}
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.displayName}
                        style={{ objectPosition: u.avatarPosition ?? 'center' }}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : null}
                    <span>{u.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

