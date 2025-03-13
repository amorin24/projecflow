import React, { useState, useEffect } from 'react';
import { getTimeOffRequests, updateTimeOffRequestStatus } from '../lib/api';
import { TimeOffRequest, User } from '../lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface TimeOffRequestListProps {
  users: User[];
  isAdmin?: boolean;
  currentUserId?: string;
}

export default function TimeOffRequestList({
  users,
  isAdmin = false,
  currentUserId,
}: TimeOffRequestListProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    user_id: currentUserId || '',
    status: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [filters, currentUserId]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await getTimeOffRequests(filters);
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Error fetching time off requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time off requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateTimeOffRequestStatus(id, status);
      toast({
        title: 'Success',
        description: `Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle>Time Off Requests</CardTitle>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          {isAdmin && (
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
          )}
          <div className="space-y-1">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No time off requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border p-4 transition-all hover:border-primary/30 hover:bg-accent/50"
              >
                <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">
                        {request.user?.full_name || 'Unknown User'}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.start_date).toLocaleDateString()} to{' '}
                      {new Date(request.end_date).toLocaleDateString()}
                    </p>
                    {request.notes && (
                      <p className="mt-2 text-sm italic">
                        "{request.notes}"
                      </p>
                    )}
                  </div>
                  {isAdmin && request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 hover:bg-green-200 text-green-800"
                        onClick={() => handleStatusChange(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 hover:bg-red-200 text-red-800"
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
