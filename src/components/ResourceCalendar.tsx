import React, { useState, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { ResourceAllocation, User, TimeOffRequest } from '../lib/types';
import { getResourceAllocations, getTimeOffRequests } from '../lib/api';

interface ResourceCalendarProps {
  users: User[];
  selectedUserId?: string;
  onUserSelect?: (userId: string) => void;
}

export default function ResourceCalendar({
  users,
  selectedUserId,
  onUserSelect,
}: ResourceCalendarProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResourceData = async () => {
      if (!selectedUserId) return;
      
      setIsLoading(true);
      try {
        const [allocationsRes, timeOffRes] = await Promise.all([
          getResourceAllocations({ user_id: selectedUserId }),
          getTimeOffRequests({ user_id: selectedUserId, status: 'approved' })
        ]);
        
        setAllocations(allocationsRes.data.allocations || []);
        setTimeOffRequests(timeOffRes.data.requests || []);
      } catch (error) {
        console.error('Error fetching resource data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resource data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResourceData();
  }, [selectedUserId, toast]);

  const getDayContent = (day: Date) => {
    const allocationsForDay = allocations.filter(allocation => {
      const startDate = new Date(allocation.start_date);
      const endDate = allocation.end_date ? new Date(allocation.end_date) : null;
      return (
        startDate <= day && (!endDate || endDate >= day)
      );
    });

    const timeOffForDay = timeOffRequests.filter(request => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      return startDate <= day && endDate >= day;
    });

    const totalAllocation = allocationsForDay.reduce(
      (sum, allocation) => sum + allocation.allocation_percentage,
      0
    );

    return (
      <div className="h-full p-1">
        {timeOffForDay.length > 0 && (
          <div className="text-xs bg-red-100 dark:bg-red-900 rounded px-1 mb-1">
            Time Off
          </div>
        )}
        {allocationsForDay.map((allocation) => (
          <div
            key={allocation.id}
            className="text-xs bg-blue-100 dark:bg-blue-900 rounded px-1 mb-1"
            title={`${allocation.project?.name}: ${allocation.allocation_percentage}%`}
          >
            {allocation.project?.name}: {allocation.allocation_percentage}%
          </div>
        ))}
        {totalAllocation > 100 && (
          <div className="text-xs text-red-500 font-bold">
            Overallocated: {totalAllocation}%
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resource Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Team Member</Label>
            <Select
              value={selectedUserId}
              onValueChange={(value) => onUserSelect?.(value)}
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

          <div className={`transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
              components={{
                DayContent: ({ date }) => getDayContent(date),
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
