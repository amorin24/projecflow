import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createTask, getTask, updateTask, getTaskStatuses } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Task } from '../lib/types';

export default function TaskFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: projectId || '1', // Default to project ID 1 if not provided
    assignee_id: user?.id || '',
    due_date: '',
    priority: 'medium',
    status_id: 1, // Default to "To Do"
  });
  
  const [statuses, setStatuses] = useState<Array<{id: number, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters and set initial form data
    const params = new URLSearchParams(window.location.search);
    const urlTitle = params.get('title');
    const urlDescription = params.get('description');
    const urlDueDate = params.get('due_date');
    
    // Create a new form data object to update
    const newFormData = { ...formData };
    
    // Update with URL parameters if available
    if (urlTitle) newFormData.title = urlTitle;
    if (urlDescription) newFormData.description = urlDescription;
    
    // Handle date format conversion if needed
    if (urlDueDate) {
      try {
        // Check if the date is in a valid format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(urlDueDate)) {
          // Already in YYYY-MM-DD format, validate year is reasonable
          const year = parseInt(urlDueDate.substring(0, 4));
          if (year >= 1900 && year <= 2100) {
            newFormData.due_date = urlDueDate;
            console.log("Using valid date from URL:", urlDueDate);
          } else {
            console.warn('Invalid year in URL date:', urlDueDate);
            // Set today's date as fallback for invalid year
            newFormData.due_date = new Date().toISOString().split('T')[0];
            console.log("Using today's date as fallback for invalid year:", newFormData.due_date);
          }
        } else {
          // Try to parse and convert to YYYY-MM-DD format
          // First try to handle common date formats
          let parsedDate = null;
          
          // Try MM/DD/YYYY format
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(urlDueDate)) {
            const [month, day, year] = urlDueDate.split('/');
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
              parsedDate = dateStr;
            }
          } 
          // Try DD-MM-YYYY format
          else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(urlDueDate)) {
            const [day, month, year] = urlDueDate.split('-');
            const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
              parsedDate = dateStr;
            }
          }
          // Default parsing as last resort
          else {
            const dateObj = new Date(urlDueDate);
            if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() >= 1900 && dateObj.getFullYear() <= 2100) {
              parsedDate = dateObj.toISOString().split('T')[0];
            }
          }
          
          if (parsedDate) {
            newFormData.due_date = parsedDate;
            console.log("Converted URL date to:", parsedDate);
          } else {
            console.warn('Invalid date format in URL:', urlDueDate);
            // Set today's date as fallback
            newFormData.due_date = new Date().toISOString().split('T')[0];
            console.log("Using today's date as fallback for invalid date:", newFormData.due_date);
          }
        }
      } catch (err) {
        console.error('Error parsing date from URL', err);
        // Set today's date as fallback
        newFormData.due_date = new Date().toISOString().split('T')[0];
        console.log("Using today's date as fallback after error:", newFormData.due_date);
      }
    }
    
    // Update form state with all changes at once
    setFormData(newFormData);
    console.log("Updated form data from URL params:", newFormData);
    
    // Load task statuses
    const loadStatuses = async () => {
      try {
        if (!projectId) {
          // Set default statuses if no project ID
          setStatuses([
            { id: 1, name: "To Do" },
            { id: 2, name: "In Progress" },
            { id: 3, name: "Done" }
          ]);
          return;
        }
        const res = await getTaskStatuses(projectId);
        const responseData = res.data as { statuses?: Array<{id: number, name: string}> };
        setStatuses(responseData.statuses || []);
      } catch (err) {
        console.error('Error loading statuses', err);
        // Fallback to default statuses
        setStatuses([
          { id: 1, name: "To Do" },
          { id: 2, name: "In Progress" },
          { id: 3, name: "Done" }
        ]);
      }
    };

    // Load task data if editing
    const loadTask = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const res = await getTask(id);
        const responseData = res.data as unknown as { task: Task };
        if (responseData.task) {
          const task = responseData.task;
          
          setFormData({
            title: task.title || '',
            description: task.description || '',
            project_id: task.project_id || projectId,
            assignee_id: task.assignee_id || user?.id || '',
            due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
            priority: task.priority || 'medium',
            status_id: task.status_id || 1,
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading task', err);
        setError('Failed to load task data');
        setIsLoading(false);
      }
    };

    loadStatuses();
    if (id) {
      loadTask();
    }
  }, [id, projectId, user?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.title) {
        setError('Task title is required');
        setIsSubmitting(false);
        return;
      }
      
      // Skip project ID validation for now since we're using a default value
      // We'll add proper project selection in a future update
      
      // Process date from form state
      let formattedDate: string | null = null;
      
      // Get the date directly from the input element as a fallback
      const dateInputElement = document.querySelector('input[name="due_date"]') as HTMLInputElement;
      const dateValue = formData.due_date || (dateInputElement ? dateInputElement.value : '');
      
      if (dateValue && dateValue.trim() !== '') {
        try {
          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(dateValue)) {
            // Already in YYYY-MM-DD format, validate year is reasonable
            const year = parseInt(dateValue.substring(0, 4));
            if (year >= 1900 && year <= 2100) {
              formattedDate = dateValue;
              console.log("Using validated date:", formattedDate);
            } else {
              setError('Invalid year in date. Please use a year between 1900 and 2100.');
              setIsSubmitting(false);
              return;
            }
          } else {
            // Try to convert to YYYY-MM-DD format
            const dateObj = new Date(dateValue);
            if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() >= 1900 && dateObj.getFullYear() <= 2100) {
              formattedDate = dateObj.toISOString().split('T')[0];
              console.log("Converted date to:", formattedDate);
            } else {
              setError('Invalid date format. Please use YYYY-MM-DD format.');
              setIsSubmitting(false);
              return;
            }
          }
        } catch (err) {
          console.error("Date parsing error:", err);
          setError('Invalid date format. Please use YYYY-MM-DD format.');
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log("Final formatted date for submission:", formattedDate);
      
      console.log("Submitting with date:", formattedDate);
      
      // Format the data for submission
      const priorityMap: Record<string, number> = {
        'low': 1,
        'medium': 2,
        'high': 3
      };
      
      const submissionData = {
        title: formData.title,
        description: formData.description,
        project_id: formData.project_id || '1', // Always include project_id
        assignee_id: formData.assignee_id || user?.id,
        due_date: formattedDate || undefined, // Use undefined instead of null
        priority: priorityMap[formData.priority || 'medium'],
        status_id: Number(formData.status_id) || 1
      };
      
      console.log("Final submission data:", submissionData);
      
      if (id) {
        await updateTask(id, submissionData);
      } else {
        await createTask(submissionData);
      }
      
      setIsSubmitting(false);
      navigate(`/projects/${formData.project_id}`);
    } catch (err) {
      console.error('Error saving task', err);
      // Provide more detailed error message if available
      const errorObj = err as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = errorObj.response?.data?.message || 
                          errorObj.response?.data?.error || 
                          'Failed to save task. Please check all fields and try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Task' : 'Create Task'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
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
            value={formData.description}
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
            value={formData.due_date || ''}
            onChange={(e) => {
              // Get the date value from the input
              const dateValue = e.target.value;
              console.log("Date input changed to:", dateValue);
              
              // Clear any previous errors
              setError(null);
              
              // Directly store the date value from the date input
              // HTML date inputs already use YYYY-MM-DD format
              setFormData(prev => ({ ...prev, due_date: dateValue }));
            }}
          />
          <p className="text-xs text-gray-500">Format: YYYY-MM-DD (e.g., 2025-03-20)</p>
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
        
        {statuses.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status_id.toString()}
              onValueChange={(value) => handleSelectChange('status_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/projects/${formData.project_id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : id ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
