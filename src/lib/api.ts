import axios from 'axios';
import { Task } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// Auth API
export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });

export const register = (userData: any) => 
  api.post('/auth/register', userData);

export const getCurrentUser = () => 
  api.get('/auth/me');

// Projects API
export const getProjects = () => 
  api.get('/projects');

export const getProject = (id: string) => 
  api.get(`/projects/${id}`);

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
export const getTasks = (projectId: string) => 
  api.get(`/tasks/project/${projectId}`);

export const getTask = (id: string) => 
  api.get<{ task: Task }>(`/tasks/${id}`);

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
export const getTaskStatuses = (projectId: string) => 
  api.get(`/statuses/project/${projectId}`);

// Notifications API
export const getNotifications = () => 
  api.get('/notifications');

export const markNotificationRead = (id: string, read: boolean) => 
  api.patch(`/notifications/${id}`, { read });

export const markAllNotificationsRead = () => 
  api.patch('/notifications', { read: true });

export default api;
