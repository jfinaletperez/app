import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Onboarding: React.FC = () => {
    const { registerCompany } = useAuth();
    const [formData, setFormData] = useState({
        company: '',
        adminName: '',
        adminEmail: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.company || !formData.adminName || !formData.adminEmail) return;
        registerCompany(formData.company, formData.adminName, formData.adminEmail);
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-card" style={{ padding: '3rem', maxWidth: '600px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }}>
                    <Building2 size={200} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '12px', borderRadius: '16px', color: 'white', marginBottom: '1.5rem', boxShadow: '0 0 20px var(--primary-glow)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Bienvenido a ShiftMaster
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Configura tu empresa para empezar a gestionar tus turnos.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <Building2 size={16} /> Nombre de la Empresa
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Ej. Nightclub Paradiso"
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <User size={16} /> Tu Nombre
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.adminName}
                                onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                placeholder="Admin"
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Mail size={16} /> Correo Electrónico
                            </label>
                            <input
                                required
                                type="email"
                                value={formData.adminEmail}
                                onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                placeholder="admin@empresa.com"
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="neon-button"
                        style={{ marginTop: '1rem', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontSize: '1.1rem' }}
                    >
                        Configurar mi Empresa <ArrowRight size={20} />
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Al continuar, aceptas que todos los datos se almacenarán localmente en este dispositivo.
                </p>
            </div>
        </div>
    );
};

export default Onboarding;
