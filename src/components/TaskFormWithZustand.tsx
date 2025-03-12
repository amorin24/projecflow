import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useTasks, useProjects, useUser } from '../store';
import { getErrorMessage } from '../utils/errorUtils';
import { createTask, updateTask } from '../lib/api';

interface TaskFormProps {
  taskId?: string;
  projectId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const TaskFormWithZustand: React.FC<TaskFormProps> = ({
  taskId,
  projectId,
  onSuccess,
  onClose,
}) => {
  const { currentUser } = useUser();
  const { projects } = useProjects();
  const { tasks, selectedTask, setTasks, setSelectedTask, setError: setTasksError } = useTasks();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: selectedTask?.title || '',
    description: selectedTask?.description || '',
    project_id: projectId || selectedTask?.project_id || '',
    assignee_id: selectedTask?.assignee_id || currentUser?.id || '',
    due_date: selectedTask?.due_date || '',
    priority: selectedTask?.priority || 'medium',
    status_id: selectedTask?.status_id?.toString() || '1',
  });

  // Memoized event handlers for better performance
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setFormData(prev => ({ ...prev, due_date: date }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        assignee_id: formData.assignee_id || currentUser?.id,
        due_date: formData.due_date || null,
        priority: formData.priority,
        status_id: Number(formData.status_id)
      };
      
      let result;
      if (taskId) {
        result = await updateTask(taskId, submissionData);
        
        // Update the tasks list and selected task in the store
        setTasks(tasks.map(task => task.id === taskId ? { ...task, ...result } : task));
        setSelectedTask(result);
      } else {
        result = await createTask(submissionData);
        
        // Add the new task to the tasks list in the store
        setTasks([...tasks, result]);
      }
      
      setIsLoading(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      // Use the standardized error handling utility
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setTasksError(errorMessage);
      setIsLoading(false);
    }
  }, [formData, taskId, currentUser, tasks, setTasks, setSelectedTask, setTasksError, onSuccess, onClose]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1"
        />
      </div>
      
      <div>
        <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
          Project
        </label>
        <select
          id="project_id"
          name="project_id"
          value={formData.project_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={!!projectId}
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <Input
          id="due_date"
          name="due_date"
          type="date"
          value={formData.due_date}
          onChange={handleChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="status_id" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status_id"
          name="status_id"
          value={formData.status_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="1">To Do</option>
          <option value="2">In Progress</option>
          <option value="3">Review</option>
          <option value="4">Done</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskFormWithZustand;
