import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { TimeOffRequestForm } from '../components/TimeOffRequestForm';

export function TimeOffRequests() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<{id: number; user: string; startDate: string; endDate: string; status: string;}[]>([]);

  useEffect(() => {
    // Fetch time off requests
    // This would be replaced with an actual API call
    setRequests([
      { id: 1, user: 'John Doe', startDate: '2025-05-01', endDate: '2025-05-05', status: 'Pending' },
      { id: 2, user: 'Jane Smith', startDate: '2025-06-10', endDate: '2025-06-15', status: 'Approved' },
    ]);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Time Off Requests</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New Time Off Request</CardTitle>
            <CardDescription>Submit a new time off request</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOffRequestForm onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>{request.user}</CardTitle>
              <CardDescription>Status: {request.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Start Date: {request.startDate}</p>
              <p>End Date: {request.endDate}</p>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                {request.status === 'Pending' && (
                  <>
                    <Button variant="outline" size="sm">Approve</Button>
                    <Button variant="outline" size="sm">Deny</Button>
                  </>
                )}
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
