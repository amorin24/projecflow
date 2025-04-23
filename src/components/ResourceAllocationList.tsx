import { useState, useEffect } from 'react';
import { getResourceAllocations, deleteResourceAllocation } from '../lib/api';
import { ResourceAllocation, User, Project } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface ResourceAllocationListProps {
  users: User[];
  projects: Project[];
  onEdit?: (allocation: ResourceAllocation) => void;
}

export default function ResourceAllocationList({
  users,
  projects,
  onEdit,
}: ResourceAllocationListProps) {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    user_id: '',
    project_id: '',
  });

  useEffect(() => {
    fetchAllocations();
  }, [filters]);

  const fetchAllocations = async () => {
    try {
      setIsLoading(true);
      const res = await getResourceAllocations(filters);
      setAllocations(res.data.allocations || []);
    } catch (error) {
      console.error('Error fetching resource allocations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resource allocations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this allocation?')) return;
    
    try {
      await deleteResourceAllocation(id);
      toast({
        title: 'Success',
        description: 'Resource allocation deleted successfully',
      });
      fetchAllocations();
    } catch (error) {
      console.error('Error deleting resource allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource allocation',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle>Resource Allocations</CardTitle>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <div className="space-y-1">
            <Label htmlFor="user-filter">User</Label>
            <Select
              value={filters.user_id}
              onValueChange={(value) => handleFilterChange('user_id', value)}
            >
              <SelectTrigger id="user-filter" className="w-[180px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="project-filter">Project</Label>
            <Select
              value={filters.project_id}
              onValueChange={(value) => handleFilterChange('project_id', value)}
            >
              <SelectTrigger id="project-filter" className="w-[180px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : allocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No resource allocations found</p>
            <Button asChild className="mt-4">
              <Link to="/resources/new">Create Allocation</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="rounded-lg border p-4 transition-all hover:border-primary/30 hover:bg-accent/50"
              >
                <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                  <div>
                    <h3 className="font-medium">
                      {allocation.user?.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {allocation.project?.name || 'Unknown Project'} - {allocation.allocation_percentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(allocation.start_date).toLocaleDateString()} to{' '}
                      {allocation.end_date
                        ? new Date(allocation.end_date).toLocaleDateString()
                        : 'Ongoing'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(allocation)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(allocation.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
