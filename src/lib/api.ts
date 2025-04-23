import axios from 'axios';
import { 
  Task, Project, TaskStatus, Notification,
  ResourceAllocation, ResourceAllocationResponse, UserAvailability,
  TimeOffRequest, CreateResourceAllocationRequest, CreateUserAvailabilityRequest,
  CreateTimeOffRequestRequest
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Simple request cache
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_DURATION = 60000; // 1 minute in milliseconds

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create cached versions of GET requests
export const cachedGet = async <T>(url: string): Promise<{ data: T }> => {
  const cacheKey = url;
  const now = Date.now();
  
  // Return cached data if it exists and is not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return { data: cache[cacheKey].data as T };
  }
  
  // Make the request
  const response = await api.get(url);
  
  // Cache the response
  cache[cacheKey] = {
    data: response.data,
    timestamp: now
  };
  
  return { data: response.data as T };
};

// Auth API
export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });

interface UserRegistrationData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const register = (userData: UserRegistrationData) => 
  api.post('/auth/register', userData);

export const getCurrentUser = () => 
  api.get('/auth/me');

interface ProjectData {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  team_id?: string;
}

// Projects API
export const getProjects = (): Promise<{ data: { projects: Project[] } }> => 
  cachedGet('/projects');

export const getProject = (id: string): Promise<{ data: { project: Project } }> => 
  cachedGet(`/projects/${id}`);

export const createProject = (projectData: ProjectData) => 
  api.post('/projects', projectData);

export const updateProject = (id: string, projectData: Partial<ProjectData>) => 
  api.put(`/projects/${id}`, projectData);

export const deleteProject = (id: string) => 
  api.delete(`/projects/${id}`);

interface ProjectMemberData {
  user_id: string;
  role?: string;
}

export const addProjectMember = (projectId: string, userData: ProjectMemberData) => 
  api.post(`/projects/${projectId}/members`, userData);

export const removeProjectMember = (projectId: string, userId: string) => 
  api.delete(`/projects/${projectId}/members/${userId}`);

interface TaskData {
  title: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  status_id?: number;
  priority?: number;
  due_date?: string;
  estimated_hours?: number;
}

// Tasks API
export const getTasks = (projectId: string): Promise<{ data: { tasks: Task[] } }> => 
  cachedGet(`/tasks/project/${projectId}`);

export const getTask = (id: string): Promise<{ data: { task: Task; statuses: TaskStatus[] } }> => 
  cachedGet(`/tasks/${id}`);

export const createTask = (taskData: TaskData) => 
  api.post('/tasks', taskData);

export const updateTask = (id: string, taskData: Partial<TaskData>) => 
  api.put(`/tasks/${id}`, taskData);

export const updateTaskStatus = (id: string, statusId: number) => 
  api.patch(`/tasks/${id}/status`, { status_id: statusId });

export const deleteTask = (id: string) => 
  api.delete(`/tasks/${id}`);

export const addTaskComment = (taskId: string, content: string) => 
  api.post(`/tasks/${taskId}/comments`, { content });

// Task Statuses API
export const getTaskStatuses = (projectId: string): Promise<{ data: { statuses: TaskStatus[] } }> => 
  cachedGet(`/statuses/project/${projectId}`);

// Notifications API
export const getNotifications = (): Promise<{ data: { notifications: Notification[] } }> => 
  cachedGet('/notifications');

export const markNotificationRead = (id: string, read: boolean) => 
  api.patch(`/notifications/${id}`, { read });

export const markAllNotificationsRead = () => 
  api.patch('/notifications', { read: true });

// Resource Allocation API
export const getResourceAllocations = (filters?: { user_id?: string; project_id?: string }): Promise<{ data: { allocations: ResourceAllocation[] } }> => {
  let url = '/resources/allocations';
  if (filters) {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (params.toString()) url += `?${params.toString()}`;
  }
  return cachedGet(url);
};

export const getResourceAllocation = (id: number): Promise<{ data: { allocation: ResourceAllocationResponse } }> => 
  cachedGet(`/resources/allocations/${id}`);

export const createResourceAllocation = (allocationData: CreateResourceAllocationRequest) => 
  api.post('/resources/allocations', allocationData);

export const updateResourceAllocation = (id: number, allocationData: Partial<CreateResourceAllocationRequest>) => 
  api.put(`/resources/allocations/${id}`, allocationData);

export const deleteResourceAllocation = (id: number) => 
  api.delete(`/resources/allocations/${id}`);

// User Availability API
export const getUserAvailability = (userId?: string): Promise<{ data: { availability: UserAvailability[] } }> => {
  let url = '/resources/availability';
  if (userId) url += `?user_id=${userId}`;
  return cachedGet(url);
};

export const createUserAvailability = (availabilityData: CreateUserAvailabilityRequest) => 
  api.post('/resources/availability', availabilityData);

export const updateUserAvailability = (id: number, availabilityData: Partial<CreateUserAvailabilityRequest>) => 
  api.put(`/resources/availability/${id}`, availabilityData);

export const deleteUserAvailability = (id: number) => 
  api.delete(`/resources/availability/${id}`);

// Time Off Request API
export const getTimeOffRequests = (filters?: { user_id?: string; status?: string }): Promise<{ data: { requests: TimeOffRequest[] } }> => {
  let url = '/resources/timeoff';
  if (filters) {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.status) params.append('status', filters.status);
    if (params.toString()) url += `?${params.toString()}`;
  }
  return cachedGet(url);
};

export const createTimeOffRequest = (requestData: CreateTimeOffRequestRequest) => 
  api.post('/resources/timeoff', requestData);

export const updateTimeOffRequestStatus = (id: number, status: string) => 
  api.put(`/resources/timeoff/${id}`, { status });


export default api;
