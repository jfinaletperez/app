import React, { useState } from 'react';
import { useAuth, Vacation } from '../contexts/AuthContext';
import { Calendar, Umbrella, Trash2, Plus, Info, User, DollarSign, Wallet, Edit2 } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const VacationManager: React.FC = () => {
    const { employees, vacations, addVacation, updateVacation, deleteVacation, isEditor } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        isPaidAhead: false,
        customRate: 0
    });

    if (!isEditor) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>No tienes permisos.</div>;

    const handleEmployeeChange = (empId: string) => {
        const emp = employees.find(e => e.id === empId);
        setFormData({
            ...formData,
            employeeId: empId,
            customRate: emp?.dayRate || 0 // Por defecto sugerimos su tarifa normal
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.employeeId) return alert('Selecciona un empleado');

        const start = parseISO(formData.startDate);
        const end = parseISO(formData.endDate);

        if (isAfter(start, end)) return alert('La fecha de inicio no puede ser posterior a la de fin');

        if (editingId) {
            updateVacation(editingId, formData.employeeId, formData.startDate, formData.endDate, formData.isPaidAhead, formData.customRate);
        } else {
            addVacation(formData.employeeId, formData.startDate, formData.endDate, formData.isPaidAhead, formData.customRate);
        }

        handleCancel();
    };

    const handleEdit = (vac: Vacation) => {
        setEditingId(vac.id);
        setFormData({
            employeeId: vac.employeeId,
            startDate: vac.startDate,
            endDate: vac.endDate,
            isPaidAhead: vac.isPaidAhead,
            customRate: vac.customRate
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            employeeId: '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
            isPaidAhead: false,
            customRate: 0
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--secondary)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                        <Umbrella size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', color: 'white' }}>Gestión de Vacaciones</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configura descansos y políticas de cobro</p>
                    </div>
                </div>
                {!showForm && (
                    <button className="neon-button" onClick={() => setShowForm(true)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        + Nueva Política Vacacional
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--secondary)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        {editingId ? 'Editar Periodo Vacacional' : 'Configurar Periodo Vacacional'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Empleado</label>
                            <select
                                required
                                value={formData.employeeId}
                                onChange={e => handleEmployeeChange(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            >
                                <option value="">Seleccionar...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fecha Inicio</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fecha Fin</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <DollarSign size={14} /> Tarifa Vacaciones / Día (€)
                            </label>
                            <input
                                required
                                type="number"
                                value={formData.customRate}
                                onChange={e => setFormData({ ...formData, customRate: Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '10px', width: '100%',
                                borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isPaidAhead}
                                    onChange={e => setFormData({ ...formData, isPaidAhead: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--secondary)' }}
                                />
                                <span style={{ fontSize: '0.85rem' }}>¿Cobradas por adelantado?</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={handleCancel} style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '8px' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="neon-button" style={{ flex: 2, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                            {editingId ? 'Actualizar Cambios' : 'Guardar y Bloquear Cuadrante'}
                        </button>
                    </div>
                </form>
            )}

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Libro de Vacaciones y Pagos</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Empleado</th>
                                <th style={{ padding: '1rem' }}>Periodo</th>
                                <th style={{ padding: '1rem' }}>Tarifa Aplicada</th>
                                <th style={{ padding: '1rem' }}>Estado Pago</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vacations.map(vac => {
                                const emp = employees.find(e => e.id === vac.employeeId);
                                return (
                                    <tr key={vac.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600' }}>{emp?.name || '---'}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp?.jobTitle?.toUpperCase() || '---'}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                {format(parseISO(vac.startDate), 'd MMM', { locale: es })} - {format(parseISO(vac.endDate), 'd MMM yy', { locale: es })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{vac.customRate} €/día</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {vac.isPaidAhead ? (
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                    COBRADO ADELANTADO
                                                </span>
                                            ) : (
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                    PAGO EN NÓMINA
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(vac)}
                                                    style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: '#6366f1', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteVacation(vac.id)}
                                                    style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: 'var(--accent)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {vacations.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No hay vacaciones registradas. Las vacaciones bloquean automáticamente los días en el cuadrante.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Wallet size={24} color="var(--secondary)" />
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: '600' }}>Pago Adelantado</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>El trabajador NO cobrará esos días en el mes que esté de vacaciones (ya los ha percibido).</p>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <DollarSign size={24} color="#f59e0b" />
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: '600' }}>Pago en Nómina</p>
                        <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Los días se sumarán automáticamente al cálculo salarial del mes correspondiente.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VacationManager;
