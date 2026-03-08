import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, getISOWeek, getYear, isWithinInterval, parseISO, startOfDay } from 'date-fns';

export type Role = 'MANAGER' | 'SUBMANAGER' | 'WORKER';

export interface ShiftInfo {
    isLibre: boolean;
    time: string;
    notes: string;
}

export interface Employee {
    id: string;
    name: string;
    role: Role;
    email: string;
    jobTitle: string;
    jobColor: string;
    dayRate: number;
    status: 'ACTIVE' | 'PENDING';
    isHidden: boolean;
}

export interface Vacation {
    id: string;
    employeeId: string;
    startDate: string; // ISO string
    endDate: string;   // ISO string
    isPaidAhead: boolean; // Si ya se cobraron (no cuentan en la nómina del mes de disfrute)
    customRate: number;   // Tarifa por día de vacaciones
}

interface WeeklyData {
    [employeeId: string]: ShiftInfo[];
}

interface QuadrantsStore {
    [weekKey: string]: WeeklyData;
}

interface AdvancesStore {
    [monthKey: string]: {
        [employeeId: string]: number;
    };
}

interface User {
    id: string;
    name: string;
    role: Role;
    email: string;
}

interface AuthContextType {
    user: User | null;
    companyName: string | null;
    employees: Employee[];
    quadrants: QuadrantsStore;
    advances: AdvancesStore;
    vacations: Vacation[];
    currentWeek: Date;
    weekKey: string;
    login: (role: Role) => void;
    logout: () => void;
    registerCompany: (company: string, adminName: string, adminEmail: string) => void;
    isEditor: boolean;
    inviteEmployee: (name: string, email: string, role: Role, jobTitle: string, jobColor: string, dayRate: number, isHidden?: boolean) => void;
    updateEmployee: (id: string, name: string, email: string, role: Role, jobTitle: string, jobColor: string, dayRate: number, isHidden: boolean) => void;
    deleteEmployee: (id: string) => void;
    reorderEmployee: (id: string, direction: 'UP' | 'DOWN') => void;
    updateEmployeeShift: (empId: string, dayIdx: number, shift: ShiftInfo) => void;
    updateAdvance: (empId: string, monthKey: string, amount: number) => void;
    addVacation: (employeeId: string, startDate: string, endDate: string, isPaidAhead: boolean, customRate: number) => void;
    updateVacation: (id: string, employeeId: string, startDate: string, endDate: string, isPaidAhead: boolean, customRate: number) => void;
    deleteVacation: (id: string) => void;
    getVacationForDate: (employeeId: string, date: Date) => Vacation | undefined;
    isEmployeeOnVacation: (employeeId: string, date: Date) => boolean;
    goToWeek: (date: Date) => void;
    createNewWeek: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createEmptyShifts = (): ShiftInfo[] => Array(7).fill(null).map(() => ({
    isLibre: false,
    time: '',
    notes: ''
}));

const getWeekKey = (date: Date) => `${getYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;

const INITIAL_EMPLOYEES: Employee[] = [
    { id: 'w1', name: 'Empleado Demo', role: 'WORKER', email: 'demo@empresa.com', jobTitle: 'Camarero', jobColor: '#6366f1', dayRate: 50, status: 'ACTIVE', isHidden: false },
    { id: '2', name: 'María García', role: 'WORKER', email: 'maria@empresa.com', jobTitle: 'DJ', jobColor: '#f43f5e', dayRate: 80, status: 'ACTIVE', isHidden: false },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [advances, setAdvances] = useState<AdvancesStore>({});
    const [vacations, setVacations] = useState<Vacation[]>([]);
    const [quadrants, setQuadrants] = useState<QuadrantsStore>({});

    const currentWeekKey = getWeekKey(currentWeek);
    const weekKey = currentWeekKey;

    // Cargar datos al iniciar
    React.useEffect(() => {
        const saved = localStorage.getItem('shiftmaster_data');
        if (saved) {
            const data = JSON.parse(saved);
            setCompanyName(data.companyName);
            setEmployees(data.employees || []);
            setQuadrants(data.quadrants || {});
            setAdvances(data.advances || {});
            setVacations(data.vacations || []);
        }
    }, []);

    // Guardar datos cuando cambien
    React.useEffect(() => {
        if (companyName) {
            const data = {
                companyName,
                employees,
                quadrants,
                advances,
                vacations
            };
            localStorage.setItem('shiftmaster_data', JSON.stringify(data));
        }
    }, [companyName, employees, quadrants, advances, vacations]);

    const login = (role: Role) => {
        if (role === 'MANAGER') {
            const admin = employees.find(e => e.role === 'MANAGER');
            setUser({
                id: admin?.id || 'm1',
                name: admin?.name || 'Gerente Admin',
                role: 'MANAGER',
                email: admin?.email || 'admin@empresa.com'
            });
        } else {
            const demoWorker = employees.find(e => e.role === 'WORKER') || employees[0];
            setUser({
                id: demoWorker?.id || 'w1',
                name: demoWorker?.name || 'Empleado Demo',
                role: 'WORKER',
                email: demoWorker?.email || 'demo@empresa.com'
            });
        }
    };

    const registerCompany = (company: string, adminName: string, adminEmail: string) => {
        const adminId = 'admin-' + Math.random().toString(36).substr(2, 5);
        const adminEmployee: Employee = {
            id: adminId,
            name: adminName,
            email: adminEmail,
            role: 'MANAGER',
            jobTitle: 'Gerente General',
            jobColor: '#6366f1',
            dayRate: 0,
            status: 'ACTIVE',
            isHidden: false
        };

        setCompanyName(company);
        setEmployees([adminEmployee]);
        setQuadrants({
            [currentWeekKey]: {
                [adminId]: createEmptyShifts()
            }
        });
        setAdvances({});
        setVacations([]);

        // Auto-login as the new admin
        setUser({
            id: adminId,
            name: adminName,
            role: 'MANAGER',
            email: adminEmail
        });
    };

    const logout = () => setUser(null);
    const isEditor = user?.role === 'MANAGER' || user?.role === 'SUBMANAGER';

    const inviteEmployee = (name: string, email: string, role: Role, jobTitle: string, jobColor: string, dayRate: number, isHidden: boolean = false) => {
        const newId = Math.random().toString(36).substr(2, 9);
        setEmployees(prev => [...prev, { id: newId, name, email, role, jobTitle, jobColor, dayRate, status: 'PENDING', isHidden }]);
        setQuadrants(prev => {
            const weekData = prev[weekKey] || {};
            return {
                ...prev,
                [weekKey]: { ...weekData, [newId]: createEmptyShifts() }
            };
        });
    };

    const updateEmployee = (id: string, name: string, email: string, role: Role, jobTitle: string, jobColor: string, dayRate: number, isHidden: boolean) => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, name, email, role, jobTitle, jobColor, dayRate, isHidden } : emp));
    };

    const deleteEmployee = (id: string) => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setVacations(prev => prev.filter(v => v.employeeId !== id));
    };

    const reorderEmployee = (id: string, direction: 'UP' | 'DOWN') => {
        setEmployees(prev => {
            const idx = prev.findIndex(e => e.id === id);
            if (idx === -1 || (direction === 'UP' && idx === 0) || (direction === 'DOWN' && idx === prev.length - 1)) return prev;
            const newE = [...prev];
            const target = direction === 'UP' ? idx - 1 : idx + 1;
            [newE[idx], newE[target]] = [newE[target], newE[idx]];
            return newE;
        });
    };

    const updateEmployeeShift = (empId: string, dayIdx: number, shift: ShiftInfo) => {
        setQuadrants(prev => {
            const currentWeekData = prev[weekKey] || {};
            const empShifts = currentWeekData[empId] || createEmptyShifts();
            const newShifts = [...empShifts];
            newShifts[dayIdx] = shift;
            return { ...prev, [weekKey]: { ...currentWeekData, [empId]: newShifts } };
        });
    };

    const updateAdvance = (empId: string, monthKey: string, amount: number) => {
        setAdvances(prev => ({
            ...prev,
            [monthKey]: {
                ...(prev[monthKey] || {}),
                [empId]: amount
            }
        }));
    };

    const addVacation = (employeeId: string, startDate: string, endDate: string, isPaidAhead: boolean, customRate: number) => {
        const newVacation: Vacation = {
            id: Math.random().toString(36).substr(2, 9),
            employeeId,
            startDate,
            endDate,
            isPaidAhead,
            customRate
        };
        setVacations(prev => [...prev, newVacation]);
    };

    const updateVacation = (id: string, employeeId: string, startDate: string, endDate: string, isPaidAhead: boolean, customRate: number) => {
        setVacations(prev => prev.map(vac =>
            vac.id === id ? { ...vac, employeeId, startDate, endDate, isPaidAhead, customRate } : vac
        ));
    };

    const deleteVacation = (id: string) => {
        setVacations(prev => prev.filter(v => v.id !== id));
    };

    const getVacationForDate = (employeeId: string, date: Date) => {
        const checkDate = startOfDay(date);
        return vacations.find(v => {
            if (v.employeeId !== employeeId) return false;
            const start = startOfDay(parseISO(v.startDate));
            const end = startOfDay(parseISO(v.endDate));
            return isWithinInterval(checkDate, { start, end });
        });
    };

    const isEmployeeOnVacation = (employeeId: string, date: Date) => {
        return !!getVacationForDate(employeeId, date);
    };

    const goToWeek = (date: Date) => setCurrentWeek(date);

    const createNewWeek = () => {
        const nextWeek = addWeeks(currentWeek, 1);
        const nextKey = getWeekKey(nextWeek);
        setQuadrants(prev => {
            if (prev[nextKey]) return prev;
            const nextData: WeeklyData = {};
            employees.forEach(emp => { nextData[emp.id] = createEmptyShifts(); });
            return { ...prev, [nextKey]: nextData };
        });
        setCurrentWeek(nextWeek);
    };

    return (
        <AuthContext.Provider value={{
            user, companyName, employees, quadrants, advances, vacations, currentWeek, weekKey,
            login, logout, registerCompany, isEditor, inviteEmployee, updateEmployee,
            deleteEmployee, reorderEmployee, updateEmployeeShift,
            updateAdvance, addVacation, updateVacation, deleteVacation, getVacationForDate, isEmployeeOnVacation,
            goToWeek, createNewWeek
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
