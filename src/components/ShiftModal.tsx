import React, { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, Coffee } from 'lucide-react';
import { ShiftInfo } from '../contexts/AuthContext';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (shift: ShiftInfo) => void;
    initialData: ShiftInfo;
    employeeName: string;
    dayName: string;
    readOnly?: boolean;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, initialData, employeeName, dayName, readOnly = false }) => {
    const [data, setData] = useState<ShiftInfo>(initialData);

    useEffect(() => {
        if (isOpen) setData(initialData);
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%', maxWidth: '450px', padding: '2rem', border: '1px solid var(--primary-glow)',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{readOnly ? 'Detalles del Turno' : 'Editar Turno'}</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{employeeName} • {dayName}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Botón LIBRE */}
                    <button
                        disabled={readOnly}
                        onClick={() => setData({ ...data, isLibre: !data.isLibre, time: data.isLibre ? data.time : '' })}
                        style={{
                            padding: '1rem', borderRadius: '12px', border: '1px solid',
                            borderColor: data.isLibre ? 'var(--accent)' : 'var(--glass-border)',
                            background: data.isLibre ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                            color: data.isLibre ? 'var(--accent)' : 'var(--text)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            cursor: readOnly ? 'default' : 'pointer', transition: 'all 0.3s ease', fontWeight: '600',
                            opacity: readOnly && !data.isLibre ? 0.5 : 1
                        }}
                    >
                        <Coffee size={20} />
                        {data.isLibre ? 'Día LIBRE' : (readOnly ? 'Día Laborable' : 'Marcar como LIBRE')}
                    </button>

                    {/* Horario */}
                    {!data.isLibre && (
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Clock size={16} /> Horario de Trabajo
                            </label>
                            <input
                                readOnly={readOnly}
                                type="text"
                                placeholder={readOnly ? "No se ha definido horario" : "Ej. 08:00 - 16:00"}
                                value={data.time}
                                onChange={e => setData({ ...data, time: e.target.value })}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px',
                                    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)',
                                    color: 'white', outline: 'none', cursor: readOnly ? 'default' : 'text'
                                }}
                            />
                        </div>
                    )}

                    {/* Anotaciones */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <MessageSquare size={16} /> Anotación para el Trabajador
                        </label>
                        <textarea
                            readOnly={readOnly}
                            placeholder={readOnly ? "No hay anotaciones" : "Instrucciones específicas..."}
                            value={data.notes}
                            onChange={e => setData({ ...data, notes: e.target.value })}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)',
                                color: 'white', outline: 'none', minHeight: '100px', resize: readOnly ? 'none' : 'vertical',
                                fontSize: '0.9rem', cursor: readOnly ? 'default' : 'text'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        {readOnly ? (
                            <button
                                onClick={onClose}
                                className="neon-button"
                                style={{ flex: 1 }}
                            >
                                Cerrar
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent',
                                        border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => onSave && onSave(data)}
                                    className="neon-button"
                                    style={{ flex: 1 }}
                                >
                                    Guardar Cambios
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftModal;
