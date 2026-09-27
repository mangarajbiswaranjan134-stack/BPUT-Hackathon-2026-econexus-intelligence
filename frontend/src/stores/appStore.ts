import { create } from 'zustand';
import { UserRole } from '../types';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface HardwareSensorData {
  connected: boolean;
  portName?: string;
  aqi: number;
  temperature: number;
  humidity: number;
  waterDetected: boolean;
  buzzerActive: boolean;
  lastUpdated?: string;
}

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  dismissNotification: (id: string) => void;
  facilityType: string;
  setFacilityType: (type: string) => void;
  hardwareData: HardwareSensorData;
  setHardwareData: (data: Partial<HardwareSensorData>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: 'admin',
  setRole: (role) => set({ role }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  simulationActive: false,
  setSimulationActive: (active) => set({ simulationActive: active }),
  theme: 'dark',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  notifications: [],
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications].slice(0, 20) })),
  dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  facilityType: 'engineering_college',
  setFacilityType: (type) => set({ facilityType: type }),
  hardwareData: {
    connected: false,
    aqi: 54,
    temperature: 27.8,
    humidity: 58,
    waterDetected: false,
    buzzerActive: false,
  },
  setHardwareData: (patch) => set((s) => ({ hardwareData: { ...s.hardwareData, ...patch } })),
}));
