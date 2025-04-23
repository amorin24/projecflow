import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserAvailabilityForm } from '../components/UserAvailabilityForm';

export function UserAvailability() {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch user availability
    // This would be replaced with an actual API call
    setUsers([
      { id: 1, name: 'John Doe', availability: 80, projects: ['Project A', 'Project B'] },
      { id: 2, name: 'Jane Smith', availability: 100, projects: ['Project C'] },
      { id: 3, name: 'Bob Johnson', availability: 50, projects: ['Project A', 'Project D'] },
    ]);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Availability</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Update Availability'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Update Availability</CardTitle>
            <CardDescription>Update your availability for projects</CardDescription>
          </CardHeader>
          <CardContent>
            <UserAvailabilityForm onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>
                Availability: {user.availability}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Assigned Projects:</h3>
              <ul className="list-disc pl-5">
                {user.projects.map((project, index) => (
                  <li key={index}>{project}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
