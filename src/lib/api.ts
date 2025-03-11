import axios from 'axios';
import { Task, Project, TaskStatus, Notification, CommentResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Simple request cache
const cache: Record<string, { data: any; timestamp: number }> = {};
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

export const register = (userData: any) => 
  api.post('/auth/register', userData);

export const getCurrentUser = () => 
  api.get('/auth/me');

// Projects API
export const getProjects = (): Promise<{ data: { projects: Project[] } }> => 
  cachedGet('/projects');

export const getProject = (id: string): Promise<{ data: { project: Project } }> => 
  cachedGet(`/projects/${id}`);

export const createProject = (projectData: any) => 
  api.post('/projects', projectData);

export const updateProject = (id: string, projectData: any) => 
  api.put(`/projects/${id}`, projectData);

export const deleteProject = (id: string) => 
  api.delete(`/projects/${id}`);

export const addProjectMember = (projectId: string, userData: any) => 
  api.post(`/projects/${projectId}/members`, userData);

export const removeProjectMember = (projectId: string, userId: string) => 
  api.delete(`/projects/${projectId}/members/${userId}`);

// Tasks API
export const getTasks = (projectId: string): Promise<{ data: { tasks: Task[] } }> => 
  cachedGet(`/tasks/project/${projectId}`);

export const getTask = (id: string): Promise<{ data: { task: Task; statuses: TaskStatus[] } }> => 
  cachedGet(`/tasks/${id}`);

export const createTask = (taskData: any) => 
  api.post('/tasks', taskData);

export const updateTask = (id: string, taskData: any) => 
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

export default api;
