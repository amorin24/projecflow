import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import TaskDetail from '../TaskDetail';
import * as api from '../../lib/api';

// Mock the API module
vi.mock('../../lib/api', () => ({
  getTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  addTaskComment: vi.fn(),
  deleteTask: vi.fn(),
}));

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: () => ({ id: 'task123' }),
  };
});

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user123', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

describe('TaskDetail Component', () => {
  const mockTask = {
    id: 'task123',
    title: 'Test Task',
    description: 'This is a test task',
    project_id: 1,
    project: { id: 1, name: 'Test Project' },
    status_id: 1,
    status: { id: 1, name: 'To Do' },
    priority: 'medium',
    due_date: '2025-03-15',
    assignee_id: 'user123',
    assignee: { id: 'user123', full_name: 'Test User' },
    reporter_id: 'user456',
    reporter: { id: 'user456', full_name: 'Another User' },
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
    comments: [
      { id: 'comment1', content: 'Test comment', user_id: 'user456', user: { full_name: 'Another User' }, created_at: '2025-03-02T00:00:00Z' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    vi.mocked(api.getTask).mockResolvedValue({ data: { task: mockTask } });
  });

  test('renders task details correctly', async () => {
    render(
      <BrowserRouter>
        <TaskDetail />
      </BrowserRouter>
    );

    // Wait for the task to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('This is a test task')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Due: Mar 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
  });

  test('handles status update', async () => {
    // Mock successful status update
    vi.mocked(api.updateTaskStatus).mockResolvedValue({ data: { task: { ...mockTask, status_id: 2, status: { id: 2, name: 'In Progress' } } } });

    render(
      <BrowserRouter>
        <TaskDetail />
      </BrowserRouter>
    );

    // Wait for the task to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Change the status
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: '2' } });

    // Check if API was called with correct data
    await waitFor(() => {
      expect(api.updateTaskStatus).toHaveBeenCalledWith('task123', 2);
    });
  });

  test('handles adding a comment', async () => {
    // Mock successful comment addition
    vi.mocked(api.addTaskComment).mockResolvedValue({
      data: {
        comment: {
          id: 'comment2',
          content: 'New comment',
          user_id: 'user123',
          user: { name: 'Test User' },
          created_at: '2025-03-10T00:00:00Z'
        }
      }
    });

    render(
      <BrowserRouter>
        <TaskDetail />
      </BrowserRouter>
    );

    // Wait for the task to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Add a comment
    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), { target: { value: 'New comment' } });
    fireEvent.click(screen.getByText('Post'));

    // Check if API was called with correct data
    await waitFor(() => {
      expect(api.addTaskComment).toHaveBeenCalledWith('task123', 'New comment');
    });
  });

  test('handles task deletion', async () => {
    // Mock successful deletion
    vi.mocked(api.deleteTask).mockResolvedValue({});
    const navigateMock = vi.fn();
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(navigateMock);

    render(
      <BrowserRouter>
        <TaskDetail />
      </BrowserRouter>
    );

    // Wait for the task to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByText('Delete'));

    // Confirm deletion
    fireEvent.click(screen.getByText('Delete Task'));

    // Check if API was called
    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith('task123');
      expect(navigateMock).toHaveBeenCalledWith('/tasks');
    });
  });

  test('handles API errors', async () => {
    // Mock API error
    vi.mocked(api.getTask).mockRejectedValue({
      response: { data: { message: 'Task not found' } }
    });

    render(
      <BrowserRouter>
        <TaskDetail />
      </BrowserRouter>
    );

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to load task/i)).toBeInTheDocument();
    });
  });
});
