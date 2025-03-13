import React, { useState, useEffect } from 'react';
import { getUserAvailability, deleteUserAvailability } from '../lib/api';
import { UserAvailability, User } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface UserAvailabilityListProps {
  users: User[];
  currentUserId?: string;
  onEdit?: (availability: UserAvailability) => void;
}

const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function UserAvailabilityList({
  users,
  currentUserId,
  onEdit,
}: UserAvailabilityListProps) {
  const { toast } = useToast();
  const [availabilities, setAvailabilities] = useState<UserAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || '');

  useEffect(() => {
    if (selectedUserId) {
      fetchAvailability();
    }
  }, [selectedUserId]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await getUserAvailability(selectedUserId);
      setAvailabilities(res.data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load availability schedule',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this availability schedule?')) return;
    
    try {
      await deleteUserAvailability(id);
      toast({
        title: 'Success',
        description: 'Availability schedule deleted successfully',
      });
      fetchAvailability();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete availability schedule',
        variant: 'destructive',
      });
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  // Sort availabilities by day of week
  const sortedAvailabilities = [...availabilities].sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle>Availability Schedule</CardTitle>
        {!currentUserId && (
          <div className="space-y-1">
            <Label htmlFor="user-filter">Team Member</Label>
            <Select
              value={selectedUserId}
              onValueChange={handleUserChange}
            >
              <SelectTrigger id="user-filter" className="w-[180px]">
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
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : !selectedUserId ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">Please select a team member to view their availability</p>
          </div>
        ) : sortedAvailabilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No availability schedules found</p>
            <Button asChild className="mt-4">
              <a href="/resources/availability/new">Add Availability</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAvailabilities.map((availability) => (
              <div
                key={availability.id}
                className="rounded-lg border p-4 transition-all hover:border-primary/30 hover:bg-accent/50"
              >
                <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                  <div>
                    <h3 className="font-medium">
                      {getDayName(availability.day_of_week)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(availability)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(availability.id)}
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
