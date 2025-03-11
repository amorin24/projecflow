import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, getTasks } from '../lib/api';
import { Project, Task } from '../lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const projectsRes = await getProjects();
      const projectsData = projectsRes.data as { projects: Project[] };
      setProjects(projectsData.projects);

      // Fetch tasks for each project
      let allTasks: Task[] = [];
      for (const project of projectsData.projects) {
        try {
          const tasksRes = await getTasks(project.id);
          const data = tasksRes.data as { tasks: Task[] };
          if (data && data.tasks && Array.isArray(data.tasks)) {
            allTasks = [...allTasks, ...data.tasks];
          }
        } catch (err) {
          console.error(`Error fetching tasks for project ${project.id}`, err);
        }
      }
      setTasks(allTasks);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching tasks', err);
      setError('Failed to load tasks');
      setIsLoading(false);
    }
  };

  // Filter tasks by project if a project is selected
  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.project_id === selectedProject);

  // Filter tasks assigned to the current user
  const myTasks = filteredTasks.filter(task => task.assignee_id === user?.id);

  // Group tasks by status
  const todoTasks = myTasks.filter(task => task.status_id === 1);
  const inProgressTasks = myTasks.filter(task => task.status_id === 2);
  const doneTasks = myTasks.filter(task => task.status_id === 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link to="/projects">
            <Button variant="outline">View Projects</Button>
          </Link>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">To Do</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <div className="text-3xl font-bold">{todoTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <div className="text-3xl font-bold">{inProgressTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-3xl font-bold">{doneTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* To Do Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              To Do
            </CardTitle>
            <CardDescription>Tasks that need to be started</CardDescription>
          </CardHeader>
          <CardContent>
            {todoTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No tasks to do</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todoTasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              In Progress
            </CardTitle>
            <CardDescription>Tasks that are currently being worked on</CardDescription>
          </CardHeader>
          <CardContent>
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No tasks in progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressTasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Completed
            </CardTitle>
            <CardDescription>Tasks that have been completed</CardDescription>
          </CardHeader>
          <CardContent>
            {doneTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No completed tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doneTasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed: {new Date(task.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
