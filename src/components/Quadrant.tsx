import React, { useState } from 'react';
import { useAuth, ShiftInfo } from '../contexts/AuthContext';
import { StickyNote, Coffee, Info, AlertCircle, Umbrella } from 'lucide-react';
import ShiftModal from './ShiftModal';
import WeekSelector from './WeekSelector';
import { startOfISOWeek, addDays } from 'date-fns';

const EMPTY_SHIFTS: ShiftInfo[] = Array(7).fill(null).map(() => ({ isLibre: false, time: '', notes: '' }));

const Quadrant: React.FC = () => {
    const { employees: allEmployees, quadrants, currentWeek, weekKey, updateEmployeeShift, isEmployeeOnVacation, isEditor } = useAuth();
    const employees = allEmployees.filter(emp => !emp.isHidden);
    const [selectedShift, setSelectedShift] = useState<{ empId: string, dayIdx: number, data: ShiftInfo, empName: string } | null>(null);

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const currentWeekData = quadrants[weekKey] || {};
    const weekStart = startOfISOWeek(currentWeek);

    const handleCellClick = (empId: string, dayIdx: number, data: ShiftInfo, empName: string) => {
        // Si está de vacaciones, el gerente puede ver pero no debería editar fácilmente sin aviso (podemos permitir ver el modal)
        setSelectedShift({ empId, dayIdx, data, empName });
    };

    const handleSaveShift = (newShift: ShiftInfo) => {
        if (selectedShift && isEditor) {
            updateEmployeeShift(selectedShift.empId, selectedShift.dayIdx, newShift);
            setSelectedShift(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <WeekSelector />

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>Cuadrante de Trabajo</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maneja y planifica los turnos para esta semana.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Umbrella size={14} color="var(--secondary)" /> Vacaciones</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Coffee size={14} color="var(--accent)" /> Libre</span>
                    </div>
                </div>

                {employees.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No hay empleados registrados. Añade personal para empezar el cuadrante.</p>
                    </div>
                ) : (
                    <div className="quadrant-grid">
                        <div className="quadrant-header">Empleado</div>
                        {days.map(day => (
                            <div key={day} className="quadrant-header">{day.substring(0, 3)}</div>
                        ))}

                        {employees.map(emp => {
                            const empShifts = currentWeekData[emp.id] || EMPTY_SHIFTS;

                            return (
                                <React.Fragment key={emp.id}>
                                    <div className="quadrant-cell" style={{ fontWeight: '600', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{emp.name}</span>
                                        <span style={{
                                            alignSelf: 'flex-start', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem',
                                            fontWeight: '800', background: `${emp.jobColor}22`, color: emp.jobColor,
                                            border: `1px solid ${emp.jobColor}44`, letterSpacing: '0.5px'
                                        }}>
                                            {emp.jobTitle.toUpperCase()}
                                        </span>
                                    </div>
                                    {empShifts.map((shift, idx) => {
                                        const cellDate = addDays(weekStart, idx);
                                        const onVacation = isEmployeeOnVacation(emp.id, cellDate);

                                        return (
                                            <div
                                                key={idx}
                                                className={`quadrant-cell ${!onVacation ? 'editable-cell' : ''}`}
                                                style={{
                                                    textAlign: 'center', display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center', cursor: onVacation ? 'default' : 'pointer',
                                                    position: 'relative',
                                                    border: selectedShift?.empId === emp.id && selectedShift?.dayIdx === idx ? '1px solid var(--primary)' : 'none',
                                                    background: onVacation ? 'rgba(6, 182, 212, 0.1)' : shift.isLibre ? 'rgba(244, 63, 94, 0.05)' : 'transparent',
                                                    gap: '2px'
                                                }}
                                                onClick={() => !onVacation && handleCellClick(emp.id, idx, shift, emp.name)}
                                            >
                                                {onVacation ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--secondary)' }}>
                                                        <Umbrella size={14} style={{ marginBottom: '2px' }} />
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '800' }}>VACACIONES</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {shift.isLibre ? (
                                                            <span style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '0.75rem' }}>LIBRE</span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.85rem', fontWeight: shift.time ? '500' : '400', color: shift.time ? 'white' : 'var(--text-muted)' }}>
                                                                {shift.time || '---'}
                                                            </span>
                                                        )}

                                                        {shift.notes && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.65rem', maxWidth: '100%' }}>
                                                                <StickyNote size={10} />
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shift.notes}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {!isEditor && !onVacation && (
                                                    <Info size={10} style={{ position: 'absolute', top: '5px', right: '5px', opacity: 0.3 }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                {!isEditor && (
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        * Haz clic en un turno para ver las notas y detalles detallados.
                    </p>
                )}

                {selectedShift && (
                    <ShiftModal
                        isOpen={!!selectedShift}
                        onClose={() => setSelectedShift(null)}
                        onSave={isEditor ? handleSaveShift : undefined}
                        initialData={selectedShift.data}
                        employeeName={selectedShift.empName}
                        dayName={days[selectedShift.dayIdx]}
                        readOnly={!isEditor}
                    />
                )}
            </div>

            <style>{`
        .editable-cell:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
        </div>
    );
};

export default Quadrant;
