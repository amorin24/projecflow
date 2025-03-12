// React components for test data display

// Test user credentials for display in the UI
// Note: These are placeholder credentials for development/demo purposes only
export const testCredentials = [
  {
    role: 'Admin',
    email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'demo-password',
    description: 'Full access to all features and settings'
  },
  {
    role: 'Project Manager',
    email: import.meta.env.VITE_MANAGER_EMAIL || 'manager@example.com',
    password: import.meta.env.VITE_MANAGER_PASSWORD || 'demo-password',
    description: 'Can create and manage projects and assign tasks'
  },
  {
    role: 'Developer',
    email: import.meta.env.VITE_DEVELOPER_EMAIL || 'developer@example.com',
    password: import.meta.env.VITE_DEVELOPER_PASSWORD || 'demo-password',
    description: 'Can view and update assigned tasks'
  },
  {
    role: 'Viewer',
    email: import.meta.env.VITE_VIEWER_EMAIL || 'viewer@example.com',
    password: import.meta.env.VITE_VIEWER_PASSWORD || 'demo-password',
    description: 'Read-only access to projects and tasks'
  }
];

// Helper function to display test credentials in the login page
export const renderTestCredentials = () => {
  return (
    <div className="mt-8 p-4 bg-muted rounded-md">
      <h3 className="font-medium mb-2">Test Credentials</h3>
      <div className="space-y-2">
        {testCredentials.map((cred, index) => (
          <div key={index} className="p-2 border rounded-md">
            <div className="font-medium">{cred.role}</div>
            <div className="text-sm">Email: {cred.email}</div>
            <div className="text-sm">Password: {cred.password}</div>
            <div className="text-xs text-muted-foreground">{cred.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
