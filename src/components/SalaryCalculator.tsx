import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, TrendingUp, Users, Download, Info, MinusCircle, Umbrella } from 'lucide-react';
import {
    format, isSameMonth, getYear, getMonth, setMonth, setYear,
    eachDayOfInterval, startOfMonth, endOfMonth, getISOWeek, getDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const SalaryCalculator: React.FC = () => {
    const { employees: allEmployees, quadrants, advances, updateAdvance, getVacationForDate, isEditor } = useAuth();
    const employees = allEmployees.filter(emp => !emp.isHidden);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const year = getYear(selectedDate);
    const month = getMonth(selectedDate);
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    const months = Array.from({ length: 12 }, (_, i) => i);
    const years = Array.from({ length: 5 }, (_, i) => 2024 + i);

    const salaryData = useMemo(() => {
        const currentMonthAdvances = advances[monthKey] || {};
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return employees.map(emp => {
            let workedDays = 0;
            let vacationDaysToPay = 0;
            let vacationPay = 0;
            let unpaidVacationDays = 0; // Para el desglose informativo

            daysInMonth.forEach(dayDate => {
                // 1. Prioridad: ¿Está de vacaciones?
                const vacation = getVacationForDate(emp.id, dayDate);

                if (vacation) {
                    if (!vacation.isPaidAhead) {
                        vacationDaysToPay++;
                        vacationPay += vacation.customRate;
                    } else {
                        unpaidVacationDays++; // Ya cobradas, no suman al económico pero cuentan como días de descanso
                    }
                    return; // Si es vacaciones, no evaluamos jornada de trabajo
                }

                // 2. Si no es vacaciones, miramos el cuadrante
                const weekKey = `${getYear(dayDate)}-W${String(getISOWeek(dayDate)).padStart(2, '0')}`;
                const dayIdx = (getDay(dayDate) + 6) % 7; // Ajustar a Lunes=0

                const weekData = quadrants[weekKey]?.[emp.id];
                const shift = weekData ? weekData[dayIdx] : null;

                // Si no hay datos, por defecto "asumimos trabajado" según la regla del usuario (si no es LIBRE)
                // Pero si no hay cuadrante, ¿se cuenta? Sí, si no está explícitamente como "LIBRE".
                if (!shift || !shift.isLibre) {
                    workedDays++;
                }
            });

            const baseGross = workedDays * (emp.dayRate || 0);
            const grossSalary = baseGross + vacationPay;
            const advanceAmount = currentMonthAdvances[emp.id] || 0;
            const netSalary = grossSalary - advanceAmount;

            return {
                ...emp,
                workedDays,
                vacationDaysToPay,
                vacationPay,
                unpaidVacationDays,
                grossSalary,
                advanceAmount,
                netSalary
            };
        });
    }, [employees, quadrants, advances, selectedDate, monthKey, getVacationForDate]);

    const totalCompanyCost = salaryData.reduce((sum, item) => sum + item.netSalary, 0);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const monthName = format(selectedDate, 'MMMM yyyy', { locale: es }).toUpperCase();

        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241);
        doc.text('ShiftMaster Pro', 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`REPORTE DE SALARIOS - ${monthName}`, 14, 32);
        doc.line(14, 35, 196, 35);

        doc.setFontSize(11);
        doc.text(`Fecha de emisión: ${format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}`, 14, 45);
        doc.text(`Gasto Neto Mensual: ${totalCompanyCost.toLocaleString()} EUR`, 14, 52);

        const tableData = salaryData.map(emp => [
            emp.name,
            `${emp.workedDays} j.`,
            `${emp.vacationDaysToPay} v.`,
            `${emp.grossSalary.toLocaleString()} €`,
            emp.advanceAmount > 0 ? `-${emp.advanceAmount} €` : '0 €',
            `${emp.netSalary.toLocaleString()} €`
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['TRABAJADOR', 'JORNADAS', 'VACACIONES', 'BRUTO', 'ANTICIPO', 'NETO']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                3: { fontStyle: 'bold' },
                4: { textColor: [244, 63, 94] },
                5: { fontStyle: 'bold' }
            },
            foot: [['', '', '', '', 'TOTAL:', `${totalCompanyCost.toLocaleString()} €`]],
            footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
        });

        doc.save(`Nomina_${monthName.replace(' ', '_')}.pdf`);
    };

    if (!isEditor) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>No tienes permisos.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', color: 'white' }}>Calculadora de Salarios</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cómputo exacto por día calendario del mes</p>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Total Neto Empresa</p>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-glow)' }}>{totalCompanyCost.toLocaleString()} €</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981' }}>
                        <TrendingUp size={14} /> <span>Incluyendo vacaciones y adelantos</span>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Días de Vacaciones Liquidados</p>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>
                        {salaryData.reduce((sum, item) => sum + item.vacationPay, 0).toLocaleString()} €
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                        <Umbrella size={14} /> <span>{salaryData.reduce((s, d) => s + d.vacationDaysToPay, 0)} jornadas por pagar</span>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Detalle de Liquidación - {format(selectedDate, 'MMMM yyyy', { locale: es })}</h3>
                    <button onClick={handleDownloadPDF} className="neon-button" style={{ fontSize: '0.8rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Descargar Reporte PDF
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Empleado</th>
                                <th style={{ padding: '1rem' }}>Trabajo</th>
                                <th style={{ padding: '1rem' }}>Vacaciones</th>
                                <th style={{ padding: '1rem' }}>Bruto</th>
                                <th style={{ padding: '1rem', width: '120px' }}>Anticipo</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Neto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryData.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600' }}>{emp.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.jobTitle?.toUpperCase() || '---'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{emp.workedDays} d.</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{emp.dayRate}€/u</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {emp.vacationDaysToPay > 0 ? (
                                            <>
                                                <div style={{ fontWeight: '500', color: 'var(--secondary)' }}>{emp.vacationDaysToPay} d.</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Liquidando en nómina</div>
                                            </>
                                        ) : emp.unpaidVacationDays > 0 ? (
                                            <div style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                Cobrado adelantado
                                            </div>
                                        ) : <span style={{ color: 'var(--text-muted)' }}>---</span>}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{emp.grossSalary.toLocaleString()} €</td>
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="number"
                                            value={emp.advanceAmount || ''}
                                            onChange={(e) => updateAdvance(emp.id, monthKey, Number(e.target.value))}
                                            style={{
                                                width: '100%', padding: '6px', borderRadius: '6px',
                                                background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)',
                                                color: 'var(--accent)', fontWeight: 'bold'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-glow)' }}>
                                        {emp.netSalary.toLocaleString()} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Info size={18} color="var(--primary)" />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Cálculo Automático:</strong> El sistema ahora revisa cada día del mes. Las vacaciones tienen prioridad sobre el cuadrante. Si se marcaron como "cobradas por adelantado", no sumarán dinero este mes, aunque se disfruten.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SalaryCalculator;
