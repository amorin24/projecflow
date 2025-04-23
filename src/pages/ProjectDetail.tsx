import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, getTasks, getTaskStatuses, deleteTask } from '../lib/api';
import { Project, Task, TaskStatus } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PlusCircle, Edit, Trash2, AlertCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

// No inline form needed anymore since we're using a dedicated page

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Will use user for permissions checking in future
  // const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // No longer needed with direct navigation
  // const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProjectData(id);
  }, [id]);

  const fetchProjectData = async (projectId: string) => {
    try {
      setIsLoading(true);
      const [projectRes, tasksRes, statusesRes] = await Promise.all([
        getProject(projectId),
        getTasks(projectId),
        getTaskStatuses(projectId),
      ]);

      const projectData = projectRes.data as { project: Project };
      const tasksData = tasksRes.data as { tasks: Task[] };
      const statusesData = statusesRes.data as { statuses: TaskStatus[] };

      setProject(projectData.project);
      setTasks(tasksData.tasks);
      setStatuses(statusesData.statuses.sort((a, b) => a.display_order - b.display_order));
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching project data', err);
      setError('Failed to load project data');
      setIsLoading(false);
    }
  };

  // Will be implemented for drag-and-drop functionality in future
  // const handleStatusChange = async (taskId: string, newStatusId: number) => {
  //   try {
  //     await updateTaskStatus(taskId, newStatusId);
  //     setTasks(
  //       tasks.map((task) =>
  //         task.id === taskId ? { ...task, status_id: newStatusId } : task
  //       )
  //     );
  //   } catch (err) {
  //     console.error('Error updating task status', err);
  //     setError('Failed to update task status');
  //   }
  // };
  
  // No longer needed with direct navigation
  // const handleTaskCreated = async () => {
  //   setIsTaskFormOpen(false);
  //   if (id) {
  //     await fetchProjectData(id);
  //   }
  // };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(taskToDelete.id);
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error('Error deleting task', err);
      setError('Failed to delete task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
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

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">Project not found</h3>
        <p className="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist or you don't have access to it.</p>
        <div className="mt-6">
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-500">{project.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/members`)}>
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => navigate(`/tasks/new?projectId=${id}`)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <div key={status.id} className="bg-gray-50 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-4">{status.name}</h3>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status_id === status.id)
                .map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></span>
                          <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                        </div>
                        {task.due_date && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                        View
                      </Button>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteClick(task)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              {tasks.filter((task) => task.status_id === status.id).length === 0 && (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                  <p className="text-sm text-gray-500">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
