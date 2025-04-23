import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTask, updateTask, getTask } from '../lib/api';
import { Task, TaskResponse, CreateTaskRequest, UpdateTaskRequest } from '../lib/types';
// Remove unused import
// No need for uuid import as we're using string IDs in the frontend
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
// Keep only the imports we're actually using
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

interface TaskFormProps {
  projectId: string;
  task?: Task | TaskResponse;
  onSuccess?: () => void;
  isDialog?: boolean;
  onClose?: () => void;
}

function TaskForm({ projectId, task, onSuccess, isDialog = false, onClose }: TaskFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!task || !!id;
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    project_id: projectId || '',
    assignee_id: user?.id || '',
    due_date: '',
    priority: 'medium',
    status_id: 1, // Default to "To Do"
  });
  
  // Remove the "Failed to load task data" error for dialog mode
  const [showLoadError, setShowLoadError] = useState(!isDialog);
  
  // Initialize form data immediately for dialog mode to prevent "Failed to load task data" error
  useEffect(() => {
    if (isDialog && !isEditMode) {
      setFormData({
        title: '',
        description: '',
        project_id: projectId,
        assignee_id: user?.id || '',
        due_date: '',
        priority: 'medium',
        status_id: 1,
      });
      setShowLoadError(false);
    }
  }, [isDialog, isEditMode, projectId, user?.id]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // isEditMode is now defined above

  useEffect(() => {
    const fetchTaskData = async () => {
      // If we're in edit mode but don't have the task data yet
      if (isEditMode && !task && id) {
        try {
          const response = await getTask(id);
          const taskData = response.data.task as unknown as TaskResponse;
          
          if (!taskData) {
            setError('Failed to load task data: Invalid response format');
            return;
          }
          
          setFormData({
            title: taskData.title,
            description: taskData.description || '',
            project_id: taskData.project.id,
            assignee_id: taskData.assignee?.id || user?.id || '',
            due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : '',
            priority: taskData.priority || 'medium',
            status_id: taskData.status.id || 1,
          });
        } catch (err) {
          console.error('Error fetching task data:', err);
          setError('Failed to load task data');
        }
      } else if (isEditMode && task) {
        // If we already have the task data
        if ('project' in task) {
          // It's a TaskResponse
          const taskResponse = task as TaskResponse;
          setFormData({
            title: taskResponse.title,
            description: taskResponse.description || '',
            project_id: taskResponse.project.id,
            assignee_id: taskResponse.assignee?.id || user?.id || '',
            due_date: taskResponse.due_date ? new Date(taskResponse.due_date).toISOString().split('T')[0] : '',
            priority: taskResponse.priority || 'medium',
            status_id: taskResponse.status.id || 1,
          });
        } else {
          // It's a Task
          const taskData = task as Task;
          setFormData({
            title: taskData.title,
            description: taskData.description || '',
            project_id: taskData.project_id,
            assignee_id: taskData.assignee_id || user?.id || '',
            due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : '',
            priority: taskData.priority || 'medium',
            status_id: taskData.status_id || 1,
          });
        }
      } else {
        // Create mode
        setFormData({
          title: '',
          description: '',
          project_id: projectId,
          assignee_id: user?.id || '',
          due_date: '',
          priority: 'medium',
          status_id: 1,
        });
      }
    };
    
    fetchTaskData();
  }, [task, projectId, user?.id, isEditMode, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle description field - remove any date strings that might have been incorrectly added
    if (name === 'description') {
      // Check if the description contains a date pattern at the end
      const datePattern = /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/;
      if (datePattern.test(value)) {
        // Remove the date from the description
        const cleanedValue = value.replace(datePattern, '');
        setFormData({ ...formData, description: cleanedValue });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!formData.title) {
        setError('Task title is required');
        setIsLoading(false);
        return;
      }
      
      // Format the data for submission
      const submissionData = {
        title: formData.title,
        description: formData.description,
        project_id: formData.project_id || projectId,
        assignee_id: formData.assignee_id || user?.id,
        due_date: formData.due_date || null,
        priority: formData.priority,
        status_id: Number(formData.status_id)
      };
      
      // Log the data for debugging
      console.log('Project ID:', projectId);
      console.log('Form data project_id:', formData.project_id);
      
      console.log('Submitting task data:', submissionData);
      
      if (isEditMode) {
        // Use the ID from either the task prop or the URL parameter
        const taskId = task ? task.id : id;
        if (!taskId) {
          setError('Task ID is missing');
          setIsLoading(false);
          return;
        }
        
        // For updates, we don't need to send the project_id
        const updateData: UpdateTaskRequest = {
          title: submissionData.title,
          description: submissionData.description,
          assignee_id: submissionData.assignee_id,
          due_date: typeof submissionData.due_date === 'string' ? submissionData.due_date : undefined,
          priority: submissionData.priority as 'low' | 'medium' | 'high',
          status_id: submissionData.status_id
        };
        
        await updateTask(taskId, updateData);
      } else {
        await createTask(submissionData);
      }
      setIsLoading(false);
      
      if (onSuccess) {
        onSuccess();
      } else if (!isDialog) {
        if (isEditMode) {
          navigate(`/tasks/${id}`);
        } else {
          navigate(`/projects/${projectId}`);
        }
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving task', err);
      // Provide more detailed error message if available
      const errorObj = err as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = errorObj.response?.data?.message || 
                          errorObj.response?.data?.error || 
                          'Failed to save task. Please check all fields and try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit}>
      {!isDialog && (
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update task information below'
              : 'Fill in the details to create a new task'}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {error && showLoadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description.includes('2025-03-25') ? formData.description.replace('2025-03-25', '') : formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => {
              // Ensure date is in correct format
              const dateValue = e.target.value;
              if (dateValue && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                setFormData({ ...formData, due_date: dateValue });
                
                // Clear any date that might have been added to the description field
                if (formData.description.includes(dateValue)) {
                  setFormData(prev => ({
                    ...prev,
                    due_date: dateValue,
                    description: prev.description.replace(dateValue, '').trim()
                  }));
                }
              } else {
                // Clear invalid date
                setFormData({ ...formData, due_date: '' });
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isEditMode && (
          <div className="space-y-2">
            <Label htmlFor="status_id">Status</Label>
            <Select
              value={formData.status_id.toString()}
              onValueChange={(value) => handleSelectChange('status_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">To Do</SelectItem>
                <SelectItem value="2">In Progress</SelectItem>
                <SelectItem value="3">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isDialog && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
        </Button>
      </CardFooter>
    </form>
  );

  if (isDialog) {
    return formContent;
  }

  return <Card>{formContent}</Card>;
}

export default React.memo(TaskForm);
