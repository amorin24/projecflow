import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../lib/api';
import { Project, User, CreateResourceAllocationRequest } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';

interface ResourceAllocationFormProps {
  users: User[];
  onSubmit: (data: CreateResourceAllocationRequest) => Promise<void>;
  initialData?: Partial<CreateResourceAllocationRequest>;
  isEditing?: boolean;
}

export default function ResourceAllocationForm({
  users,
  onSubmit,
  initialData,
  isEditing = false,
}: ResourceAllocationFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateResourceAllocationRequest>({
    user_id: initialData?.user_id || '',
    project_id: initialData?.project_id || '',
    allocation_percentage: initialData?.allocation_percentage || 100,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchProjects();
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.user_id || !formData.project_id || !formData.start_date || formData.allocation_percentage <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.allocation_percentage > 100) {
      toast({
        title: 'Validation Error',
        description: 'Allocation percentage cannot exceed 100%.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: isEditing 
          ? 'Resource allocation updated successfully' 
          : 'Resource allocation created successfully',
      });
      navigate('/resources');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resource allocation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Resource Allocation' : 'Create Resource Allocation'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user_id">Team Member</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) => handleSelectChange('user_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project_id">Project</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => handleSelectChange('project_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Allocation Percentage */}
          <div className="space-y-2">
            <Label htmlFor="allocation_percentage">Allocation Percentage</Label>
            <div className="flex items-center">
              <Input
                id="allocation_percentage"
                name="allocation_percentage"
                type="number"
                min="1"
                max="100"
                value={formData.allocation_percentage}
                onChange={handleChange}
                className="w-24"
              />
              <span className="ml-2">%</span>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date (Optional)</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/resources')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
