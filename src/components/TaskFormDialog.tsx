import React, { useState } from 'react';
import { createTask } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface TaskFormDialogProps {
  projectId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function TaskFormDialog({ projectId, onSuccess, onClose }: TaskFormDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: projectId,
    assignee_id: user?.id || '',
    due_date: '',
    priority: 'medium',
    status_id: 1, // Default to "To Do"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        project_id: formData.project_id,
        assignee_id: formData.assignee_id || user?.id,
        due_date: formData.due_date || null,
        priority: formData.priority,
        status_id: Number(formData.status_id)
      };
      
      console.log('Submitting task data:', submissionData);
      
      await createTask(submissionData);
      setIsLoading(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Error saving task', err);
      // Provide more detailed error message if available
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to save task. Please check all fields and try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
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
          value={formData.due_date}
          onChange={handleChange}
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
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
