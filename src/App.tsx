import React, { useState } from 'react';
import Quadrant from './components/Quadrant';
import EmployeeManager from './components/EmployeeManager';
import SalaryCalculator from './components/SalaryCalculator';
import VacationManager from './components/VacationManager';
import WorkerMonthlyView from './components/WorkerMonthlyView';
import Onboarding from './components/Onboarding';
import { useAuth } from './contexts/AuthContext';
import { LayoutDashboard, Users, LogOut, ShieldCheck, DollarSign, Umbrella, Calendar, Building2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
    const { user, companyName, login, logout, isEditor } = useAuth();
    const [activeTab, setActiveTab] = useState<'QUADRANT' | 'EMPLOYEES' | 'SALARIES' | 'VACATIONS' | 'MY_MONTH'>('QUADRANT');
    const [invitationToken, setInvitationToken] = useState<string | null>(new URLSearchParams(window.location.search).get('token'));
    const [showOnboardingOverride, setShowOnboardingOverride] = useState(false);
    const [workerPassword, setWorkerPassword] = useState('');

    if (invitationToken) {
        return (
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                    <ShieldCheck size={64} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ¡Bienvenido a {companyName || 'ShiftMaster Pro'}!
                    </h1>
                    <p style={{ color: 'var(--text)', marginBottom: '1.5rem' }}>Has sido invitado a unirte como trabajador.</p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                        Para completar tu perfil, por favor introduce una contraseña para tu cuenta vinculada a este dispositivo.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="password"
                            placeholder="Nueva Contraseña"
                            value={workerPassword}
                            onChange={e => setWorkerPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                        <button className="neon-button" onClick={async () => {
                            // En una app real esto guardaría el correo decodificado del token
                            // Por ahora, simulamos el login directo con el token decodificado
                            const email = atob(invitationToken).slice(0, -13); // Restamos el Date.now()
                            const result = await login(email, workerPassword);
                            if (result.success) {
                                setInvitationToken(null);
                                window.history.replaceState({}, document.title, "/");
                            }
                        }}>Crear Perfil y Acceder</button>
                    </div>
                </div>
            </div>
        );
    }

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);
        try {
            const result = await login(loginData.email, loginData.password);
            if (!result.success) {
                setLoginError(result.message);
            }
        } catch (err) {
            setLoginError('Error al intentar iniciar sesión.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (!companyName || showOnboardingOverride) {
        return <Onboarding onCancel={companyName ? () => setShowOnboardingOverride(false) : undefined} />;
    }

    if (!user) {
        return (
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
                <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '450px', width: '100%', border: '1px solid var(--glass-border)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '16px', color: 'var(--primary)', marginBottom: '1rem' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ShiftMaster Pro
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Introduce tus credenciales para acceder.</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <Mail size={14} /> Correo Electrónico
                            </label>
                            <input
                                required
                                type="email"
                                value={loginData.email}
                                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                placeholder="ejemplo@empresa.com"
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.95rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <Lock size={14} /> Contraseña
                            </label>
                            <input
                                required
                                type="password"
                                value={loginData.password}
                                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.95rem' }}
                            />
                        </div>

                        {loginError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} /> {loginError}
                            </div>
                        )}

                        <button
                            disabled={isLoggingIn}
                            type="submit"
                            className="neon-button"
                            style={{ marginTop: '0.5rem', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {isLoggingIn ? <><Loader2 size={18} className="animate-spin" /> Entrando...</> : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ¿Olvidaste tu contraseña? Contacta con tu gerente.
                        </p>
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.8rem' }}>¿Eres nuevo y quieres crear tu empresa?</p>
                            <button
                                onClick={() => setShowOnboardingOverride(true)}
                                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                Registrar Empresa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <header className="glass-card" style={{ padding: '1.2rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            ShiftMaster Pro
                        </h2>
                        <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                            <Building2 size={12} /> {companyName}
                        </p>
                    </div>
                    <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setActiveTab('QUADRANT')}
                            style={{
                                background: activeTab === 'QUADRANT' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <LayoutDashboard size={18} /> Cuadrante
                        </button>
                        {!isEditor && (
                            <button
                                onClick={() => setActiveTab('MY_MONTH')}
                                style={{
                                    background: activeTab === 'MY_MONTH' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Calendar size={18} /> Mi Mes
                            </button>
                        )}
                        {isEditor && (
                            <>
                                <button
                                    onClick={() => setActiveTab('EMPLOYEES')}
                                    style={{
                                        background: activeTab === 'EMPLOYEES' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Users size={18} /> Personal
                                </button>
                                <button
                                    onClick={() => setActiveTab('VACATIONS')}
                                    style={{
                                        background: activeTab === 'VACATIONS' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Umbrella size={18} /> Vacaciones
                                </button>
                                <button
                                    onClick={() => setActiveTab('SALARIES')}
                                    style={{
                                        background: activeTab === 'SALARIES' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <DollarSign size={18} /> Salarios
                                </button>
                            </>
                        )}
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="user-info">
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{user.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent)',
                            color: 'var(--accent)', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main>
                {activeTab === 'QUADRANT' && <Quadrant />}
                {activeTab === 'EMPLOYEES' && <EmployeeManager />}
                {activeTab === 'SALARIES' && <SalaryCalculator />}
                {activeTab === 'VACATIONS' && <VacationManager />}
                {activeTab === 'MY_MONTH' && <WorkerMonthlyView />}
            </main>

            <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                &copy; 2026 ShiftMaster Professional HR Solutions
            </footer>

            <style>{`
                @media (max-width: 768px) {
                    .user-info { display: none; }
                }
            `}</style>
        </div>
    );
};

export default App;
