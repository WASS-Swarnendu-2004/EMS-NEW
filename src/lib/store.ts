// LocalStorage-backed mock data store for the Employee Management System.
// All operations are synchronous and emit a window event so React hooks can refresh.

export type Role = "admin" | "employee";
export type EmployeeRole = "Developer" | "Designer" | "Manager" | "HR" | "QA" | "DevOps" | "Analyst";

export interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: EmployeeRole;
  idProof: string; // e.g. Aadhar / passport no.
  salary: number; // monthly
  address: string;
  joinDate: string; // YYYY-MM-DD
  department: string;
  bankAccount: string;
  pan: string;
  emergencyContact: string;
  status: "active" | "inactive";
}

export interface Project {
  id: string;
  name: string;
  consumerName: string;
  consumerDetails: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  valuation: number;
  status: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
  description: string;
  assigned: string[]; // employee IDs
}

export interface LeaveApp {
  id: string;
  employeeId: string;
  type: "casual" | "sick" | "earned";
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface WfhApp {
  id: string;
  employeeId: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut?: string;
  mode: "office" | "wfh";
}

export interface WorkStatus {
  id: string;
  employeeId: string;
  date: string;
  plan: string; // morning plan
  status: string; // end-of-day report
  projectId?: string;
}

export interface SalaryComponent {
  id: string;
  label: string;
  type: "earning" | "deduction";
  mode: "percent" | "fixed"; // percent of gross monthly salary or fixed amount
  value: number;
}

export interface SalarySlipItem {
  label: string;
  type: "earning" | "deduction";
  amount: number;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  gross: number;
  items: SalarySlipItem[];
  totalEarnings: number;
  totalDeductions: number;
  net: number;
  generatedAt: string;
}

export interface MailMsg {
  id: string;
  toEmployeeId: string;
  subject: string;
  body: string;
  attachmentName?: string;
  sentAt: string;
}

export interface DB {
  employees: Employee[];
  projects: Project[];
  leaves: LeaveApp[];
  wfh: WfhApp[];
  attendance: Attendance[];
  workStatus: WorkStatus[];
  salarySlips: SalarySlip[];
  salaryConfig: SalaryComponent[];
  mail: MailMsg[];
}

const KEY = "ems_db_v1";
const EVT = "ems:db-changed";

const uid = () => Math.random().toString(36).slice(2, 10);
export const today = () => new Date().toISOString().slice(0, 10);
export const nowTime = () => new Date().toTimeString().slice(0, 5);

function seed(): DB {
  const e1: Employee = { id: "e1", name: "Alice Johnson", email: "alice@webapps.com", password: "user", phone: "+91 9876543210", role: "Developer", idProof: "AADHAR-1234-5678-9012", salary: 65000, address: "Sector 12, Pune, MH", joinDate: "2024-02-15", department: "Engineering", bankAccount: "HDFC ****4231", pan: "ABCDE1234F", emergencyContact: "+91 9988776655", status: "active" };
  const e2: Employee = { id: "e2", name: "Rahul Verma", email: "rahul@webapps.com", password: "user", phone: "+91 9123456780", role: "Designer", idProof: "AADHAR-2244-3322-1190", salary: 55000, address: "Indiranagar, Bangalore", joinDate: "2024-06-01", department: "Design", bankAccount: "ICICI ****1199", pan: "PQRSX5678K", emergencyContact: "+91 9911223344", status: "active" };
  const e3: Employee = { id: "e3", name: "Priya Sharma", email: "priya@webapps.com", password: "user", phone: "+91 9090909090", role: "Manager", idProof: "PASSPORT-X9988221", salary: 95000, address: "DLF Phase 3, Gurgaon", joinDate: "2023-08-10", department: "Engineering", bankAccount: "SBI ****7711", pan: "MNOPQ4321Z", emergencyContact: "+91 9001112233", status: "active" };

  const p1: Project = { id: "p1", name: "Acme Storefront Revamp", consumerName: "Acme Corp", consumerDetails: "Retail client, US-based, contact: John (john@acme.com)", startDate: "2025-01-10", endDate: "2025-07-10", durationDays: 181, valuation: 1200000, status: "in_progress", description: "Rebuild Acme's e-commerce stack with Next.js + Stripe.", assigned: ["e1", "e2"] };
  const p2: Project = { id: "p2", name: "Banking Mobile App", consumerName: "FinTrust Bank", consumerDetails: "Tier-2 bank, India. Contact: Mr. Mehta", startDate: "2025-03-01", endDate: "2025-12-01", durationDays: 275, valuation: 2500000, status: "planning", description: "Native mobile banking experience.", assigned: ["e3"] };

  const att: Attendance[] = [];
  const ws: WorkStatus[] = [];
  // last 14 days of attendance for each employee
  for (let i = 0; i < 14; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    [e1, e2, e3].forEach((emp) => {
      if (d.getDay() === 0 || d.getDay() === 6) return;
      att.push({ id: uid(), employeeId: emp.id, date, checkIn: "09:" + (10 + (i % 30)).toString().padStart(2, "0"), checkOut: "18:" + (5 + (i % 30)).toString().padStart(2, "0"), mode: i % 5 === 0 ? "wfh" : "office" });
      ws.push({ id: uid(), employeeId: emp.id, date, plan: "Work on assigned project tasks", status: "Completed planned tasks and code review.", projectId: emp.id === "e3" ? "p2" : "p1" });
    });
  }

  return {
    employees: [e1, e2, e3],
    projects: [p1, p2],
    leaves: [
      { id: uid(), employeeId: "e1", type: "sick", from: today(), to: today(), reason: "Fever", status: "pending", createdAt: new Date().toISOString() },
    ],
    wfh: [
      { id: uid(), employeeId: "e2", from: today(), to: today(), reason: "Internet maintenance at office, WFH preferred.", status: "pending", createdAt: new Date().toISOString() },
    ],
    attendance: att,
    workStatus: ws,
    salarySlips: [],
    salaryConfig: defaultSalaryConfig(),
    mail: [],
  };
}

export function defaultSalaryConfig(): SalaryComponent[] {
  return [
    { id: "basic", label: "Basic", type: "earning", mode: "percent", value: 50 },
    { id: "hra", label: "HRA", type: "earning", mode: "percent", value: 20 },
    { id: "special", label: "Special Allowance", type: "earning", mode: "percent", value: 30 },
    { id: "pf", label: "Provident Fund", type: "deduction", mode: "percent", value: 5 },
    { id: "tax", label: "Professional Tax", type: "deduction", mode: "percent", value: 3 },
  ];
}

function load(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const d = seed();
      window.localStorage.setItem(KEY, JSON.stringify(d));
      return d;
    }
    return JSON.parse(raw) as DB;
  } catch {
    const d = seed();
    window.localStorage.setItem(KEY, JSON.stringify(d));
    return d;
  }
}

function save(db: DB) {
  window.localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event(EVT));
}

export const store = {
  get: load,
  subscribe(cb: () => void) {
    const h = () => cb();
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  },
  reset() {
    window.localStorage.removeItem(KEY);
    load();
    window.dispatchEvent(new Event(EVT));
  },

  // Employees
  addEmployee(e: Omit<Employee, "id">) {
    const db = load();
    db.employees.push({ ...e, id: "e" + uid() });
    save(db);
  },
  updateEmployee(id: string, patch: Partial<Employee>) {
    const db = load();
    db.employees = db.employees.map((x) => (x.id === id ? { ...x, ...patch } : x));
    save(db);
  },
  deleteEmployee(id: string) {
    const db = load();
    db.employees = db.employees.filter((x) => x.id !== id);
    save(db);
  },

  // Projects
  addProject(p: Omit<Project, "id">) {
    const db = load();
    db.projects.push({ ...p, id: "p" + uid() });
    save(db);
  },
  updateProject(id: string, patch: Partial<Project>) {
    const db = load();
    db.projects = db.projects.map((x) => (x.id === id ? { ...x, ...patch } : x));
    save(db);
  },
  deleteProject(id: string) {
    const db = load();
    db.projects = db.projects.filter((x) => x.id !== id);
    save(db);
  },

  // Leaves
  addLeave(l: Omit<LeaveApp, "id" | "status" | "createdAt">) {
    const db = load();
    db.leaves.unshift({ ...l, id: uid(), status: "pending", createdAt: new Date().toISOString() });
    save(db);
  },
  setLeaveStatus(id: string, status: LeaveApp["status"]) {
    const db = load();
    db.leaves = db.leaves.map((x) => (x.id === id ? { ...x, status } : x));
    save(db);
  },

  // WFH
  addWfh(w: Omit<WfhApp, "id" | "status" | "createdAt">) {
    const db = load();
    db.wfh.unshift({ ...w, id: uid(), status: "pending", createdAt: new Date().toISOString() });
    save(db);
  },
  setWfhStatus(id: string, status: WfhApp["status"]) {
    const db = load();
    db.wfh = db.wfh.map((x) => (x.id === id ? { ...x, status } : x));
    save(db);
  },

  // Attendance
  punchIn(employeeId: string, mode: Attendance["mode"]) {
    const db = load();
    const t = today();
    if (db.attendance.find((a) => a.employeeId === employeeId && a.date === t)) return;
    db.attendance.unshift({ id: uid(), employeeId, date: t, checkIn: nowTime(), mode });
    save(db);
  },
  punchOut(employeeId: string) {
    const db = load();
    const t = today();
    db.attendance = db.attendance.map((a) =>
      a.employeeId === employeeId && a.date === t ? { ...a, checkOut: nowTime() } : a
    );
    save(db);
  },

  // Work status
  upsertWorkStatus(w: Omit<WorkStatus, "id">) {
    const db = load();
    const existing = db.workStatus.find((x) => x.employeeId === w.employeeId && x.date === w.date);
    if (existing) {
      db.workStatus = db.workStatus.map((x) => (x.id === existing.id ? { ...existing, ...w } : x));
    } else {
      db.workStatus.unshift({ ...w, id: uid() });
    }
    save(db);
  },

  // Salary slips - auto generate using configurable breakdown
  generateSalary(employeeId: string, month: string) {
    const db = load();
    const emp = db.employees.find((e) => e.id === employeeId);
    if (!emp) return;
    if (db.salarySlips.find((s) => s.employeeId === employeeId && s.month === month)) return;
    const slip = buildSlip(emp.id, emp.salary, month, db.salaryConfig);
    db.salarySlips.unshift(slip);
    save(db);
  },
  generateSalaryForAll(month: string) {
    const db = load();
    db.employees.forEach((e) => {
      if (db.salarySlips.find((s) => s.employeeId === e.id && s.month === month)) return;
      db.salarySlips.unshift(buildSlip(e.id, e.salary, month, db.salaryConfig));
    });
    save(db);
  },
  setSalaryConfig(cfg: SalaryComponent[]) {
    const db = load();
    db.salaryConfig = cfg;
    save(db);
  },
  resetSalaryConfig() {
    const db = load();
    db.salaryConfig = defaultSalaryConfig();
    save(db);
  },

  // Mail
  sendMail(m: Omit<MailMsg, "id" | "sentAt">) {
    const db = load();
    db.mail.unshift({ ...m, id: uid(), sentAt: new Date().toISOString() });
    save(db);
  },
};

function buildSlip(employeeId: string, gross: number, month: string, cfg: SalaryComponent[]): SalarySlip {
  const items: SalarySlipItem[] = cfg.map((c) => ({
    label: c.label,
    type: c.type,
    amount: c.mode === "percent" ? Math.round((gross * c.value) / 100) : Math.round(c.value),
  }));
  const totalEarnings = items.filter((i) => i.type === "earning").reduce((s, i) => s + i.amount, 0);
  const totalDeductions = items.filter((i) => i.type === "deduction").reduce((s, i) => s + i.amount, 0);
  return {
    id: uid(), employeeId, month, gross,
    items, totalEarnings, totalDeductions,
    net: totalEarnings - totalDeductions,
    generatedAt: new Date().toISOString(),
  };
}

import { useEffect, useState } from "react";
export function useDB(): DB {
  const [db, setDb] = useState<DB>(() => (typeof window === "undefined" ? seed() : load()));
  useEffect(() => store.subscribe(() => setDb(load())), []);
  return db;
}
