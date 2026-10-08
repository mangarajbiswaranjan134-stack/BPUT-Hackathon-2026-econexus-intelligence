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

export interface UserProfile {
  username: string;
  displayName: string;
  role: UserRole;
  loginTime: string;
}

interface AppState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (username: string, role?: UserRole, displayName?: string) => void;
  logout: () => void;
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
  updateHardwareData: (data: Partial<HardwareSensorData>) => void;
  hardwareModalOpen: boolean;
  setHardwareModalOpen: (open: boolean) => void;
  hardwareRibbonOpen: boolean;
  setHardwareRibbonOpen: (open: boolean) => void;
  toggleHardwareRibbon: () => void;
}

// Check session storage so opening fresh tab requires login
const initialAuth = typeof window !== 'undefined' && sessionStorage.getItem('econexus_authenticated') === 'true';
const initialUser = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('econexus_user') || 'null') : null;

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: initialAuth,
  userProfile: initialUser,
  login: (username: string, role: UserRole = 'admin', displayName?: string) => {
    const profile: UserProfile = {
      username,
      displayName: displayName || (username === 'admin' ? 'Facility Admin' : username === 'judge' ? 'BPUT Jury / Judge' : username),
      role,
      loginTime: new Date().toLocaleTimeString(),
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('econexus_authenticated', 'true');
      sessionStorage.setItem('econexus_user', JSON.stringify(profile));
    }
    set({
      isAuthenticated: true,
      userProfile: profile,
      role,
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('econexus_authenticated');
      sessionStorage.removeItem('econexus_user');
    }
    set({
      isAuthenticated: false,
      userProfile: null,
    });
  },
  role: initialUser?.role || 'admin',
  setRole: (role) => set((s) => {
    if (s.userProfile && typeof window !== 'undefined') {
      const updated = { ...s.userProfile, role };
      sessionStorage.setItem('econexus_user', JSON.stringify(updated));
      return { role, userProfile: updated };
    }
    return { role };
  }),
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
  updateHardwareData: (patch) => set((s) => ({ hardwareData: { ...s.hardwareData, ...patch } })),
  hardwareModalOpen: false,
  setHardwareModalOpen: (open) => set({ hardwareModalOpen: open }),
  hardwareRibbonOpen: false,
  setHardwareRibbonOpen: (open) => set({ hardwareRibbonOpen: open }),
  toggleHardwareRibbon: () => set((s) => ({ hardwareRibbonOpen: !s.hardwareRibbonOpen })),
}));
