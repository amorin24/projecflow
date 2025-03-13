import React, { useState, useEffect } from 'react';
import { getUsers, getProjects } from '../lib/api';
import { User, Project } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import ResourceAllocationList from '../components/ResourceAllocationList';
import ResourceCalendar from '../components/ResourceCalendar';
import { useToast } from '../components/ui/use-toast';

export default function ResourceManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersRes, projectsRes] = await Promise.all([
          getUsers(),
          getProjects()
        ]);
        
        setUsers(usersRes.data.users || []);
        setProjects(projectsRes.data.projects || []);
        
        if (usersRes.data.users?.length > 0) {
          setSelectedUserId(usersRes.data.users[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching resource data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resource data. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-bold">Resource Management</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/resources/allocations/new">
            <Button>
              New Allocation
            </Button>
          </Link>
          <Link to="/resources/timeoff">
            <Button variant="outline">
              Time Off Requests
            </Button>
          </Link>
          <Link to="/resources/availability">
            <Button variant="outline">
              User Availability
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Resource Allocations</CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div>
              <TabsContent value="list" className="mt-0">
                <ResourceAllocationList 
                  users={users} 
                  projects={projects}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-0">
                <ResourceCalendar 
                  users={users}
                  selectedUserId={selectedUserId}
                  onUserSelect={handleUserSelect}
                />
              </TabsContent>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
