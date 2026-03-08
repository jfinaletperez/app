import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

const WeekSelector: React.FC = () => {
    const { currentWeek, goToWeek, createNewWeek, isEditor, weekKey } = useAuth();

    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });

    const handlePrev = () => goToWeek(subWeeks(currentWeek, 1));
    const handleNext = () => goToWeek(addWeeks(currentWeek, 1));
    const handleToday = () => goToWeek(new Date());

    return (
        <div className="glass-card" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px', color: 'white' }}>
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>
                        {format(start, "d 'de' MMMM", { locale: es })} - {format(end, "d 'de' MMMM", { locale: es })}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semana {weekKey.split('-W')[1]} • {getISOYear(currentWeek)}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={handlePrev} className="icon-btn" title="Semana Anterior">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleToday} style={{ border: 'none', background: 'transparent', color: 'white', padding: '0 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                        Hoy
                    </button>
                    <button onClick={handleNext} className="icon-btn" title="Semana Siguiente">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {isEditor && (
                    <button
                        onClick={createNewWeek}
                        className="neon-button"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={16} /> Planificar Nueva Semana
                    </button>
                )}
            </div>

            <style>{`
        .icon-btn {
          background: transparent;
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          display: flex;
          alignItems: center;
          justifyContent: center;
          cursor: pointer;
          borderRadius: 6px;
          transition: background 0.2s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.1); }
      `}</style>
        </div>
    );
};

function getISOYear(date: Date) {
    return date.getFullYear();
}

export default WeekSelector;
