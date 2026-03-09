import React, { useState } from 'react';
import Quadrant from './components/Quadrant';
import EmployeeManager from './components/EmployeeManager';
import SalaryCalculator from './components/SalaryCalculator';
import VacationManager from './components/VacationManager';
import WorkerMonthlyView from './components/WorkerMonthlyView';
import Onboarding from './components/Onboarding';
import { useAuth } from './contexts/AuthContext';
import { LayoutDashboard, Users, LogOut, ShieldCheck, DollarSign, Umbrella, Calendar, Building2 } from 'lucide-react';

const App: React.FC = () => {
    const { user, companyName, login, logout, isEditor } = useAuth();
    const [activeTab, setActiveTab] = useState<'QUADRANT' | 'EMPLOYEES' | 'SALARIES' | 'VACATIONS' | 'MY_MONTH'>('QUADRANT');
    const [invitationToken, setInvitationToken] = useState<string | null>(new URLSearchParams(window.location.search).get('token'));

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
                        <input type="password" placeholder="Nueva Contraseña" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }} />
                        <button className="neon-button" onClick={() => {
                            // En una app real esto guardaría la clave
                            setInvitationToken(null);
                            window.history.replaceState({}, document.title, "/");
                            login('WORKER');
                        }}>Crear Perfil y Acceder</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!companyName) {
        return <Onboarding />;
    }

    if (!user) {
        return (
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                    <ShieldCheck size={64} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ShiftMaster Pro
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Acceso restringido para personal autorizado.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button className="neon-button" onClick={() => login('MANAGER')}>Acceso Gerente</button>
                        <button className="neon-button" onClick={() => login('WORKER')} style={{ background: 'var(--secondary)' }}>Acceso Trabajador</button>
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
