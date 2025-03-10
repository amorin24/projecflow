// User types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  owner: UserResponse;
  members?: UserResponse[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
}

export interface AddMemberRequest {
  user_id: string;
  role: string;
}

// Task types
export interface TaskStatus {
  id: number;
  name: string;
  display_order: number;
  project_id: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id: string;
  status_id: number;
  assignee_id?: string;
  reporter_id: string;
  due_date?: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  project: ProjectResponse;
  status: TaskStatus;
  assignee?: UserResponse;
  reporter: UserResponse;
  due_date?: string;
  priority: string;
  comments?: CommentResponse[];
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  project_id: string;
  status_id: number;
  assignee_id?: string;
  due_date?: string;
  priority: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  status_id: number;
  assignee_id?: string;
  due_date?: string;
  priority: string;
}

export interface UpdateTaskStatusRequest {
  status_id: number;
}

// Comment types
export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  user: UserResponse;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  content: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  content: string;
  type: string;
  read: boolean;
  related_id?: string;
  created_at: string;
}

export interface NotificationResponse {
  id: string;
  content: string;
  type: string;
  read: boolean;
  related_id?: string;
  created_at: string;
}

export interface MarkNotificationReadRequest {
  read: boolean;
}
