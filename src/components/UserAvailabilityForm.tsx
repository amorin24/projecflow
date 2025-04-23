import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserAvailability } from '../lib/api';
import { CreateUserAvailabilityRequest, User } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';

interface UserAvailabilityFormProps {
  users: User[];
  currentUserId?: string;
  onSubmit?: (data: CreateUserAvailabilityRequest) => Promise<void>;
}

const daysOfWeek = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00:00`, label: `${hour}:00` };
});

export function UserAvailabilityForm({
  users,
  currentUserId,
  onSubmit,
}: UserAvailabilityFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserAvailabilityRequest>({
    user_id: currentUserId || '',
    day_of_week: 1, // Monday by default
    start_time: '09:00:00',
    end_time: '17:00:00',
  });

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'day_of_week') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.user_id || formData.day_of_week === undefined || !formData.start_time || !formData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate time range
    if (formData.start_time >= formData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await createUserAvailability(formData);
      }
      
      toast({
        title: 'Success',
        description: 'Availability schedule saved successfully',
      });
      navigate('/resources/availability');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to save availability schedule. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Set Availability Schedule</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* User Selection (only for admins) */}
          {!currentUserId && (
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
          )}

          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select
              value={formData.day_of_week.toString()}
              onValueChange={(value) => handleSelectChange('day_of_week', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Select
                value={formData.start_time}
                onValueChange={(value) => handleSelectChange('start_time', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Select
                value={formData.end_time}
                onValueChange={(value) => handleSelectChange('end_time', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/resources/availability')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Availability'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
