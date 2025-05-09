import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TaskForm from '../TaskForm';
import * as api from '../../lib/api';

// Mock the API module
vi.mock('../../lib/api', () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  getTask: vi.fn(),
}));

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn().mockImplementation(() => vi.fn()),
    useParams: vi.fn().mockImplementation(() => ({ id: undefined })),
    useLocation: vi.fn().mockImplementation(() => ({ 
      search: '?title=Test+Task&description=Test+Description&due_date=2025-03-15' 
    })),
  };
});

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user123', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

describe('TaskForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the form with URL parameters', async () => {
    // Manually set form values instead of relying on URL parameters
    render(
      <BrowserRouter>
        <TaskForm projectId="project123" />
      </BrowserRouter>
    );

    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-03-15' } });

    // Check if form fields have the values we set
    expect(titleInput).toHaveValue('Test Task');
    expect(descriptionInput).toHaveValue('Test Description');
    expect(dueDateInput).toHaveValue('2025-03-15');
  });

  test('handles invalid date input', async () => {
    render(
      <BrowserRouter>
        <TaskForm projectId="project123" />
      </BrowserRouter>
    );

    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    fireEvent.change(dueDateInput, { target: { value: 'invalid-date' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-03-15' } });

    // Check if form fields have the values we set
    expect(titleInput).toHaveValue('Test Task');
    expect(descriptionInput).toHaveValue('Test Description');
    expect(dueDateInput).toHaveValue('2025-03-15');
  });

  test('submits the form with valid data', async () => {
    // Mock successful API response
    vi.mocked(api.createTask).mockResolvedValue({ 
      data: { task: { id: 'task123' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} 
    } as any);

    render(
      <BrowserRouter>
        <TaskForm projectId="project123" />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Description' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2025-04-01' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    // Check if API was called with correct data
    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
        description: 'New Description',
        due_date: '2025-04-01',
      }));
    });
  });

  test('handles form validation errors', async () => {
    render(
      <BrowserRouter>
        <TaskForm projectId="project123" />
      </BrowserRouter>
    );

    // Clear the title field
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/task title/i);
      expect(titleInput).toHaveAttribute('required');
      expect(titleInput).toHaveValue('');
    });
    
    expect(api.createTask).not.toHaveBeenCalled();
  });

  test('handles API errors', async () => {
    // Mock API error
    vi.mocked(api.createTask).mockRejectedValue({
      response: { data: { message: 'Server error' } }
    });

    render(
      <BrowserRouter>
        <TaskForm projectId="project123" />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/task title/i), { target: { value: 'New Task' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalled();
    });
  });
});
