import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getTasks } from '../lib/api';
import { Project, Task } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PlusCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const projectsRes = await getProjects();
        const projectsData = projectsRes.data.projects as Project[];
        setProjects(projectsData);

        // Fetch tasks for all projects in parallel
        if (projectsData.length > 0) {
          const taskPromises = projectsData.map(project => getTasks(project.id));
          const tasksResults = await Promise.all(taskPromises);
          
          // Combine all tasks
          const allTasks = tasksResults.flatMap(result => 
            result.data.tasks as Task[]
          );
          
          setTasks(allTasks);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate task statistics using useMemo
  const taskStatistics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status_id === 3).length; // Assuming status_id 3 is "Done"
    const inProgressTasks = tasks.filter(task => task.status_id === 2).length; // Assuming status_id 2 is "In Progress"
    const todoTasks = tasks.filter(task => task.status_id === 1).length; // Assuming status_id 1 is "To Do"

    // Get tasks due soon (within 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const tasksDueSoon = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    });
    
    return { totalTasks, completedTasks, inProgressTasks, todoTasks, tasksDueSoon };
  }, [tasks]);
  
  const { totalTasks, completedTasks, inProgressTasks, todoTasks, tasksDueSoon } = taskStatistics;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/projects/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-3xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <div className="text-3xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">To Do</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <div className="text-3xl font-bold">{todoTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recent projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No projects yet</p>
              <Link to="/projects/new">
                <Button variant="outline" className="mt-2">
                  Create your first project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
              {projects.length > 5 && (
                <div className="text-center">
                  <Link to="/projects">
                    <Button variant="link">View all projects</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks Due Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Due Soon</CardTitle>
          <CardDescription>Tasks due in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksDueSoon.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No tasks due soon</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasksDueSoon.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <Link to={`/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
