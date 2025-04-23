import React, { useState, useEffect } from 'react';
import { '../lib/api';
import { User } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import UserAvailabilityList from '../components/UserAvailabilityList';
import UserAvailabilityForm from '../components/UserAvailabilityForm';
import { useToast } from '../components/ui/use-toast';

export default function UserAvailability() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await getUsers();
        setUsers(res.data.users || []);
        
        // For demo purposes, set the first user as current user
        if (res.data.users?.length > 0) {
          setCurrentUserId(res.data.users[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-bold">User Availability</h1>
        <div className="flex flex-wrap gap-2">
          {view === 'list' ? (
            <Button onClick={() => setView('form')}>
              Add Availability
            </Button>
          ) : (
            <Button onClick={() => setView('list')}>
              View Availability
            </Button>
          )}
          <Link to="/resources">
            <Button variant="outline">
              Back to Resources
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      ) : (
        <>
          {view === 'list' ? (
            <UserAvailabilityList 
              users={users}
              currentUserId={currentUserId}
            />
          ) : (
            <UserAvailabilityForm 
              users={users}
              currentUserId={currentUserId}
            />
          )}
        </>
      )}
    </div>
  );
}
