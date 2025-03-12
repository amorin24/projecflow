import { create } from 'zustand';
import { Task, Project, User } from '../lib/types';

// Define the application state interface
interface AppState {
  // Projects state
  projects: Project[];
  selectedProject: Project | null;
  projectsLoading: boolean;
  projectsError: string | null;
  
  // Tasks state
  tasks: Task[];
  selectedTask: Task | null;
  tasksLoading: boolean;
  tasksError: string | null;
  
  // User state
  currentUser: User | null;
  userLoading: boolean;
  userError: string | null;
  
  // UI state
  darkMode: boolean;
  sidebarOpen: boolean;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setProjectsLoading: (loading: boolean) => void;
  setProjectsError: (error: string | null) => void;
  
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task | null) => void;
  setTasksLoading: (loading: boolean) => void;
  setTasksError: (error: string | null) => void;
  
  setCurrentUser: (user: User | null) => void;
  setUserLoading: (loading: boolean) => void;
  setUserError: (error: string | null) => void;
  
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

// Create the store
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  projectsLoading: false,
  projectsError: null,
  
  tasks: [],
  selectedTask: null,
  tasksLoading: false,
  tasksError: null,
  
  currentUser: null,
  userLoading: false,
  userError: null,
  
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  
  // Actions
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setProjectsLoading: (projectsLoading) => set({ projectsLoading }),
  setProjectsError: (projectsError) => set({ projectsError }),
  
  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
  setTasksLoading: (tasksLoading) => set({ tasksLoading }),
  setTasksError: (tasksError) => set({ tasksError }),
  
  setCurrentUser: (currentUser) => set({ currentUser }),
  setUserLoading: (userLoading) => set({ userLoading }),
  setUserError: (userError) => set({ userError }),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    return { darkMode: newDarkMode };
  }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Create selector hooks for better performance
export const useProjects = () => useAppStore((state) => ({
  projects: state.projects,
  selectedProject: state.selectedProject,
  loading: state.projectsLoading,
  error: state.projectsError,
  setProjects: state.setProjects,
  setSelectedProject: state.setSelectedProject,
  setLoading: state.setProjectsLoading,
  setError: state.setProjectsError,
}));

export const useTasks = () => useAppStore((state) => ({
  tasks: state.tasks,
  selectedTask: state.selectedTask,
  loading: state.tasksLoading,
  error: state.tasksError,
  setTasks: state.setTasks,
  setSelectedTask: state.setSelectedTask,
  setLoading: state.setTasksLoading,
  setError: state.setTasksError,
}));

export const useUser = () => useAppStore((state) => ({
  currentUser: state.currentUser,
  loading: state.userLoading,
  error: state.userError,
  setCurrentUser: state.setCurrentUser,
  setLoading: state.setUserLoading,
  setError: state.setUserError,
}));

export const useUI = () => useAppStore((state) => ({
  darkMode: state.darkMode,
  sidebarOpen: state.sidebarOpen,
  toggleDarkMode: state.toggleDarkMode,
  toggleSidebar: state.toggleSidebar,
}));
