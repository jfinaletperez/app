import React, { useState } from 'react';
import { useAuth, Role, Employee } from '../contexts/AuthContext';
import { UserPlus, Shield, CheckCircle, Clock, Palette, Briefcase, ArrowUp, ArrowDown, Edit2, Trash2, X, Save, DollarSign, Eye, EyeOff, Mail, Send } from 'lucide-react';
import { sendInvitationEmail } from '../services/emailService';

const COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
];

const EmployeeManager: React.FC = () => {
    const { employees, inviteEmployee, updateEmployee, deleteEmployee, reorderEmployee, isEditor, companyName } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', role: 'WORKER' as Role, jobTitle: '', jobColor: COLORS[0].value, dayRate: 0, isHidden: false
    });
    const [lastLink, setLastLink] = useState('');
    const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | 'sending', message: string } | null>(null);

    if (!isEditor) return null;

    const handleEdit = (emp: Employee) => {
        setEditingId(emp.id);
        setFormData({
            name: emp.name,
            email: emp.email,
            role: emp.role,
            jobTitle: emp.jobTitle,
            jobColor: emp.jobColor,
            dayRate: emp.dayRate || 0,
            isHidden: emp.isHidden || false
        });
        setShowForm(true);
        setLastLink('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateEmployee(editingId, formData.name, formData.email, formData.role, formData.jobTitle, formData.jobColor, formData.dayRate, formData.isHidden);
            setEditingId(null);
            setShowForm(false);
        } else {
            setEmailStatus({ type: 'sending', message: 'Enviando invitación por correo...' });

            // Creamos el empleado en el estado local (o DB cuando exista)
            inviteEmployee(formData.name, formData.email, formData.role, formData.jobTitle, formData.jobColor, formData.dayRate, formData.isHidden);

            const token = btoa(formData.email + Date.now());
            const inviteLink = `${window.location.origin}/invite?token=${token}`;

            const result = await sendInvitationEmail({
                to_name: formData.name,
                to_email: formData.email,
                company_name: companyName || 'ShiftMaster Pro',
                role: formData.role,
                job_title: formData.jobTitle,
                invite_link: inviteLink
            });

            if (result.success) {
                setEmailStatus({ type: 'success', message: result.message });
                setLastLink(inviteLink); // Seguimos guardando el link por seguridad
            } else {
                setEmailStatus({ type: 'error', message: result.message });
            }
        }
        setFormData({ name: '', email: '', role: 'WORKER', jobTitle: '', jobColor: COLORS[0].value, dayRate: 0, isHidden: false });
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', email: '', role: 'WORKER', jobTitle: '', jobColor: COLORS[0].value, dayRate: 0, isHidden: false });
        setLastLink('');
    };

    return (
        <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={24} /> Gestión de Personal
                </h2>
                {!showForm && (
                    <button
                        className="neon-button"
                        onClick={() => setShowForm(true)}
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                        + Nueva Invitación
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-glow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
                            {editingId ? 'Editar Empleado' : 'Nueva Invitación'}
                        </h3>
                        <button type="button" onClick={cancelForm} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                                placeholder="Carlos Ruiz"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Correo Electrónico</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                                placeholder="carlos@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Briefcase size={14} /> Cargo del Puesto
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.jobTitle}
                                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                                placeholder="Ej. Camarero, DJ..."
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <DollarSign size={14} /> Salario / Jornada (€)
                            </label>
                            <input
                                required
                                type="number"
                                value={formData.dayRate}
                                onChange={e => setFormData({ ...formData, dayRate: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rol de Acceso</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            >
                                <option value="WORKER">Trabajador</option>
                                <option value="SUBMANAGER">Subgerente</option>
                                <option value="MANAGER">Gerente</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Palette size={14} /> Color del Badge
                            </label>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', padding: '5px' }}>
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, jobColor: c.value })}
                                        style={{
                                            width: '24px', height: '24px', borderRadius: '50%', background: c.value,
                                            border: formData.jobColor === c.value ? '2px solid white' : 'none',
                                            cursor: 'pointer', transform: formData.jobColor === c.value ? 'scale(1.2)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '12px',
                            borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer', maxWidth: '400px'
                        }}>
                            <input
                                type="checkbox"
                                checked={formData.isHidden}
                                onChange={e => setFormData({ ...formData, isHidden: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Ocultar en Cuadrante y Cálculo de Salarios</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>El empleado no aparecerá en las vistas operativas ni financieras.</span>
                            </div>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={cancelForm} style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="neon-button" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {editingId ? <><Save size={18} /> Guardar Cambios</> : 'Crear Cargo e Invitar'}
                        </button>
                    </div>

                    {emailStatus && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: emailStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                emailStatus.type === 'error' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                            borderRadius: '8px',
                            border: `1px solid ${emailStatus.type === 'success' ? 'var(--secondary)' :
                                emailStatus.type === 'error' ? 'var(--accent)' : 'var(--primary)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}>
                            {emailStatus.type === 'sending' ? <Send size={20} className="animate-pulse" /> : <Mail size={20} />}
                            <div>
                                <p style={{ fontSize: '0.9rem', color: emailStatus.type === 'success' ? 'var(--secondary)' : 'white', fontWeight: 'bold' }}>
                                    {emailStatus.message}
                                </p>
                                {emailStatus.type === 'success' && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        El trabajador podrá configurar su perfil desde el enlace recibido.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', width: '80px' }}>Orden</th>
                            <th style={{ padding: '1rem' }}>Empleado</th>
                            <th style={{ padding: '1rem' }}>Puesto / Cargo</th>
                            <th style={{ padding: '1rem' }}>Sueldo / Día</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, idx) => (
                            <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', opacity: emp.isHidden ? 0.6 : 1 }} className="employee-row">
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <button
                                            disabled={idx === 0}
                                            onClick={() => reorderEmployee(emp.id, 'UP')}
                                            style={{ background: 'transparent', border: 'none', color: idx === 0 ? '#333' : 'var(--text-muted)', cursor: idx === 0 ? 'default' : 'pointer' }}
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            disabled={idx === employees.length - 1}
                                            onClick={() => reorderEmployee(emp.id, 'DOWN')}
                                            style={{ background: 'transparent', border: 'none', color: idx === employees.length - 1 ? '#333' : 'var(--text-muted)', cursor: idx === employees.length - 1 ? 'default' : 'pointer' }}
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '600' }}>{emp.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                            background: `${emp.jobColor}22`, color: emp.jobColor, border: `1px solid ${emp.jobColor}44`
                                        }}>
                                            {emp.jobTitle.toUpperCase()}
                                        </span>
                                        {emp.isHidden && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '700' }}>
                                                <EyeOff size={12} /> OCULTO
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                                    {emp.dayRate || 0} €
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm(`¿Borrar a ${emp.name}?`)) deleteEmployee(emp.id); }}
                                            style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`
        .employee-row:hover { background: rgba(255,255,255,0.02); }
      `}</style>
        </div>
    );
};

export default EmployeeManager;
