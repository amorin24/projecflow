import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const taskCompletionData = [
  { name: 'Jan', completed: 45, pending: 15, total: 60 },
  { name: 'Feb', completed: 50, pending: 20, total: 70 },
  { name: 'Mar', completed: 35, pending: 25, total: 60 },
  { name: 'Apr', completed: 60, pending: 10, total: 70 },
  { name: 'May', completed: 40, pending: 30, total: 70 },
  { name: 'Jun', completed: 55, pending: 15, total: 70 },
];

const resourceAllocationData = [
  { name: 'Frontend', value: 40 },
  { name: 'Backend', value: 30 },
  { name: 'Design', value: 15 },
  { name: 'QA', value: 15 },
];

const teamPerformanceData = [
  { name: 'Team A', tasks: 120, hours: 240, efficiency: 0.5 },
  { name: 'Team B', tasks: 100, hours: 180, efficiency: 0.56 },
  { name: 'Team C', tasks: 80, hours: 160, efficiency: 0.5 },
  { name: 'Team D', tasks: 150, hours: 270, efficiency: 0.56 },
];

const projectProgressData = [
  { name: 'Week 1', actual: 10, planned: 15 },
  { name: 'Week 2', actual: 25, planned: 30 },
  { name: 'Week 3', actual: 40, planned: 45 },
  { name: 'Week 4', actual: 55, planned: 60 },
  { name: 'Week 5', actual: 70, planned: 75 },
  { name: 'Week 6', actual: 85, planned: 90 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-500">↑ 8%</span> from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">64</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-red-500">↓ 12%</span> from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-500">↑ 4%</span> from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">87%</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-500">↑ 6%</span> from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const TaskCompletionChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Task Completion</CardTitle>
        <CardDescription>Monthly task completion statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={taskCompletionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#8884d8" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#82ca9d" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const ResourceAllocationChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Allocation</CardTitle>
        <CardDescription>Current resource distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={resourceAllocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {resourceAllocationData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const TeamPerformanceChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Task completion efficiency by team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={teamPerformanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#8884d8" name="Tasks Completed" />
              <Bar dataKey="hours" fill="#82ca9d" name="Hours Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProjectProgressChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>Actual vs planned progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={projectProgressData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Progress" />
              <Line type="monotone" dataKey="planned" stroke="#82ca9d" name="Planned Progress" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReportFilters = ({ onApplyFilters }: { onApplyFilters: () => void }) => {
  const [dateRange, setDateRange] = useState('last30');
  const [project, setProject] = useState('all');
  const [team, setTeam] = useState('all');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Project</label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="project1">Website Redesign</SelectItem>
                <SelectItem value="project2">Mobile App Development</SelectItem>
                <SelectItem value="project3">API Integration</SelectItem>
                <SelectItem value="project4">Database Migration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Team</label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="team1">Frontend Team</SelectItem>
                <SelectItem value="team2">Backend Team</SelectItem>
                <SelectItem value="team3">Design Team</SelectItem>
                <SelectItem value="team4">QA Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onApplyFilters} className="w-full">Apply Filters</Button>
      </CardFooter>
    </Card>
  );
};

export const ExportOptions = () => {
  const handleExport = (format: string) => {
    alert(`Exporting report in ${format} format...`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleExport('pdf')}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Export as PDF
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleExport('excel')}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            Export as Excel
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleExport('csv')}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 17 12 21 16 17" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
            </svg>
            Export as CSV
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleExport('image')}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Export as Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReportingAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleApplyFilters = () => {
    console.log('Applying filters...');
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <DashboardMetrics />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TaskCompletionChart />
            <ResourceAllocationChart />
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-6">
              <ReportFilters onApplyFilters={handleApplyFilters} />
              <ExportOptions />
            </div>
            
            <div className="md:col-span-3 space-y-6">
              <TaskCompletionChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResourceAllocationChart />
                <TeamPerformanceChart />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-6">
              <ReportFilters onApplyFilters={handleApplyFilters} />
              <Card>
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Productivity Trend</h4>
                      <p className="text-sm text-muted-foreground">
                        Team productivity increased by 12% this month.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Resource Utilization</h4>
                      <p className="text-sm text-muted-foreground">
                        Frontend team is overallocated by 15%.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Project Risk</h4>
                      <p className="text-sm text-muted-foreground">
                        Database Migration project is at risk of delay.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3 space-y-6">
              <ProjectProgressChart />
              <TeamPerformanceChart />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingAnalytics;
