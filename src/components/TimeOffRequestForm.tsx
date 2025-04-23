import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTimeOffRequest } from '../lib/api';
import { CreateTimeOffRequestRequest, User } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

interface TimeOffRequestFormProps {
  users: User[];
  currentUserId?: string;
  onSubmit?: (data: CreateTimeOffRequestRequest) => Promise<void>;
}

const requestTypes = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'remote', label: 'Remote Work' },
  { value: 'other', label: 'Other' },
];

export function TimeOffRequestForm({
  users,
  currentUserId,
  onSubmit,
}: TimeOffRequestFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTimeOffRequestRequest>({
    user_id: currentUserId || '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    request_type: 'vacation',
    notes: '',
  });

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
    if (!formData.user_id || !formData.start_date || !formData.end_date || !formData.request_type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate date range
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate < startDate) {
      toast({
        title: 'Validation Error',
        description: 'End date cannot be before start date.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await createTimeOffRequest(formData);
      }
      
      toast({
        title: 'Success',
        description: 'Time off request submitted successfully',
      });
      navigate('/resources/timeoff');
    } catch (error) {
      console.error('Error submitting time off request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit time off request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request Time Off</CardTitle>
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

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="request_type">Request Type</Label>
            <Select
              value={formData.request_type}
              onValueChange={(value) => handleSelectChange('request_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Provide any additional details about your request"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/resources/timeoff')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
