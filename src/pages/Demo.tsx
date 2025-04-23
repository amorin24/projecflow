import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { InfoIcon } from 'lucide-react';

const demoProjects = [
  {
    id: 'demo-project-1',
    name: 'Marketing Campaign',
    description: 'Q2 Digital Marketing Campaign for Product Launch',
    status: 'Active',
    progress: 65,
    tasks: 12,
    completedTasks: 8,
    dueDate: '2025-06-15',
  },
  {
    id: 'demo-project-2',
    name: 'Website Redesign',
    description: 'Redesign company website with new branding',
    status: 'Planning',
    progress: 25,
    tasks: 18,
    completedTasks: 4,
    dueDate: '2025-07-30',
  },
  {
    id: 'demo-project-3',
    name: 'Mobile App Development',
    description: 'Develop iOS and Android mobile applications',
    status: 'On Hold',
    progress: 40,
    tasks: 24,
    completedTasks: 10,
    dueDate: '2025-09-01',
  }
];

const demoTasks = [
  {
    id: 'demo-task-1',
    title: 'Create wireframes',
    description: 'Design wireframes for homepage and product pages',
    status: 'Completed',
    priority: 'High',
    assignee: 'Demo User',
    dueDate: '2025-05-10',
    projectId: 'demo-project-2',
  },
  {
    id: 'demo-task-2',
    title: 'Content strategy',
    description: 'Develop content strategy for blog and social media',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Demo User',
    dueDate: '2025-05-15',
    projectId: 'demo-project-1',
  },
  {
    id: 'demo-task-3',
    title: 'API development',
    description: 'Create RESTful APIs for mobile app',
    status: 'To Do',
    priority: 'High',
    assignee: 'Demo User',
    dueDate: '2025-05-20',
    projectId: 'demo-project-3',
  },
  {
    id: 'demo-task-4',
    title: 'User testing',
    description: 'Conduct user testing sessions for new features',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Demo User',
    dueDate: '2025-05-25',
    projectId: 'demo-project-2',
  },
  {
    id: 'demo-task-5',
    title: 'SEO optimization',
    description: 'Implement SEO best practices across website',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Demo User',
    dueDate: '2025-05-18',
    projectId: 'demo-project-1',
  }
];

const demoResources = [
  {
    id: 'demo-resource-1',
    name: 'Demo User',
    role: 'Project Manager',
    allocation: 100,
    projects: ['Marketing Campaign', 'Website Redesign'],
    availability: 'Full-time',
  },
  {
    id: 'demo-resource-2',
    name: 'Jane Smith',
    role: 'Designer',
    allocation: 75,
    projects: ['Website Redesign'],
    availability: 'Part-time',
  },
  {
    id: 'demo-resource-3',
    name: 'John Doe',
    role: 'Developer',
    allocation: 100,
    projects: ['Website Redesign', 'Mobile App Development'],
    availability: 'Full-time',
  }
];

export default function Demo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : ''}`}>
      {/* Header */}
      <header className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ProjectFlow Demo</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Button>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>
      </header>

      {/* Demo notice */}
      <div className="container mx-auto mt-4 px-4">
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            You are viewing ProjectFlow in demo mode. All data is simulated and no account is required.
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>
              Create an account
            </Button> to access all features.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main content */}
      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Total active projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{demoProjects.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>Total tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{demoTasks.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>Team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{demoResources.length}</p>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-bold mb-4">Project Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-4 text-sm">
                      <span>Tasks: {project.completedTasks}/{project.tasks}</span>
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Projects</h2>
              <Button>New Project</Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {demoProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{project.name}</CardTitle>
                      <span className={`px-2 py-1 rounded text-sm ${
                        project.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        project.status === 'Planning' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-4 text-sm">
                      <span>Tasks: {project.completedTasks}/{project.tasks}</span>
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Tasks</h2>
              <Button>New Task</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {demoTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{task.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex justify-between mt-4 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Resources</h2>
              <Button>Add Resource</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle>{resource.name}</CardTitle>
                    <CardDescription>{resource.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Allocation:</span>
                        <span>{resource.allocation}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Availability:</span>
                        <span>{resource.availability}</span>
                      </div>
                      <div>
                        <span className="block mb-1">Projects:</span>
                        <div className="flex flex-wrap gap-2">
                          {resource.projects.map((project, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm"
                            >
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className={`p-4 border-t mt-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ProjectFlow Demo Mode | <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>Create Account</Button> | <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>Sign In</Button>
          </p>
        </div>
      </footer>
    </div>
  );
}
