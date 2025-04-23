import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { testCredentials } from '../utils/testData';

interface TestCredentialsDisplayProps {
  className?: string;
}

const TestCredentialsDisplay: React.FC<TestCredentialsDisplayProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Test Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testCredentials.map((cred, index) => (
            <div key={index} className="p-3 border rounded-md bg-background">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{cred.role}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {cred.role === 'Admin' ? 'Full Access' : cred.role === 'Project Manager' ? 'Create & Manage' : cred.role === 'Developer' ? 'Update Tasks' : 'Read Only'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Email:</div>
                <div className="font-mono">{cred.email}</div>
                <div className="text-muted-foreground">Password:</div>
                <div className="font-mono">{cred.password}</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{cred.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCredentialsDisplay;
