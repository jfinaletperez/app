import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    getYear, getMonth, setMonth, setYear, getISOWeek, getDay, isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Umbrella, Coffee, Clock, Info, DollarSign, Wallet, TrendingUp } from 'lucide-react';

const WorkerMonthlyView: React.FC = () => {
    const { user, employees, quadrants, vacations, advances, getVacationForDate } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const year = getYear(selectedDate);
    const month = getMonth(selectedDate);
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    const currentEmployee = useMemo(() => employees.find(e => e.id === user?.id), [employees, user]);

    const months = Array.from({ length: 12 }, (_, i) => i);
    const years = Array.from({ length: 5 }, (_, i) => 2024 + i);

    const monthData = useMemo(() => {
        if (!user) return [];
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return days.map(day => {
            const weekKey = `${getYear(day)}-W${String(getISOWeek(day)).padStart(2, '0')}`;
            const dayIdx = (getDay(day) + 6) % 7;
            const shift = quadrants[weekKey]?.[user.id]?.[dayIdx];
            const vacation = getVacationForDate(user.id, day);

            return {
                date: day,
                shift,
                vacation
            };
        });
    }, [user, quadrants, selectedDate, getVacationForDate]);

    const economicSummary = useMemo(() => {
        if (!currentEmployee) return null;

        let workedDaysCount = 0;
        let vacationPay = 0;
        let vacationDaysToPay = 0;

        monthData.forEach(({ shift, vacation }) => {
            if (vacation) {
                if (!vacation.isPaidAhead) {
                    vacationDaysToPay++;
                    vacationPay += vacation.customRate;
                }
            } else if (shift && !shift.isLibre && shift.time) {
                workedDaysCount++;
            }
        });

        const baseGross = workedDaysCount * (currentEmployee.dayRate || 0);
        const grossSalary = baseGross + vacationPay;
        const advanceAmount = advances[monthKey]?.[currentEmployee.id] || 0;
        const netSalary = grossSalary - advanceAmount;

        return {
            workedDaysCount,
            vacationDaysToPay,
            vacationPay,
            grossSalary,
            advanceAmount,
            netSalary
        };
    }, [currentEmployee, monthData, advances, monthKey]);

    if (!user || !currentEmployee) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', color: 'white' }}>Mi Agenda Mensual</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vista detallada de tus turnos y descansos</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <select
                        value={month}
                        onChange={(e) => setSelectedDate(setMonth(selectedDate, Number(e.target.value)))}
                        style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                    >
                        {months.map(m => (
                            <option key={m} value={m}>{format(new Date(2024, m, 1), 'MMMM', { locale: es }).toUpperCase()}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setSelectedDate(setYear(selectedDate, Number(e.target.value)))}
                        style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--glass-border)', color: 'white' }}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--primary)' }}>
                        <DollarSign size={80} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Estimación Netas a Cobrar</p>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-glow)', margin: 0 }}>{economicSummary?.netSalary.toLocaleString()} €</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981' }}>
                        <TrendingUp size={14} /> <span>Calculado según tus jornadas</span>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--accent)' }}>
                        <Wallet size={80} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Anticipos Solicitados</p>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--accent)', margin: 0 }}>{economicSummary?.advanceAmount.toLocaleString()} €</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Se descontarán del total bruto</p>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--secondary)' }}>
                        <Umbrella size={80} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Vacaciones Liquidadas</p>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>{economicSummary?.vacationPay.toLocaleString()} €</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>{economicSummary?.vacationDaysToPay} días pagados este mes</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {monthData.map(({ date, shift, vacation }) => {
                        const isToday = isSameDay(date, new Date());
                        const isWeekend = getDay(date) === 0 || getDay(date) === 6;

                        return (
                            <div
                                key={date.toISOString()}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: isToday ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                    border: isToday ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    minHeight: '120px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: isToday ? 'var(--primary-glow)' : 'white' }}>
                                        {format(date, 'd')}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {format(date, 'EEE', { locale: es })}
                                    </span>
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                    {vacation ? (
                                        <div style={{ color: 'var(--secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Umbrella size={20} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', marginTop: '2px' }}>VACACIONES</span>
                                        </div>
                                    ) : shift?.isLibre ? (
                                        <div style={{ color: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Coffee size={20} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', marginTop: '2px' }}>LIBRE</span>
                                        </div>
                                    ) : shift?.time ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Clock size={16} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{shift.time}</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin asignar</span>
                                    )}
                                </div>

                                {shift?.notes && (
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted)',
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        fontStyle: 'italic',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }} title={shift.notes}>
                                        {shift.notes}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px', color: '#10b981' }}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jornadas Base</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                            {economicSummary?.workedDaysCount} días
                        </p>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--primary)' }}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sueldo Bruto</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                            {economicSummary?.grossSalary.toLocaleString()} €
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerMonthlyView;
