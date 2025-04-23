import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStatusColor, getStatusIcon, getPriorityColor } from '../utils/statusUtils';
import { getTask, updateTaskStatus, addTaskComment } from '../lib/api';
import { TaskResponse, TaskStatus, CommentResponse } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
// Remove unused import
import { Textarea } from '../components/ui/textarea';
import { AlertCircle, MessageSquare, Calendar, Flag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // We'll use the auth hook in a future implementation
  useAuth();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchTaskData(id);
  }, [id]);

  const fetchTaskData = async (taskId: string) => {
    try {
      setIsLoading(true);
      const res = await getTask(taskId);
      const data = res.data as unknown as { task: TaskResponse; statuses: TaskStatus[] };
      setTask(data.task);
      setStatuses(data.statuses || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching task data', err);
      setError('Failed to load task data');
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (!task || !id) return;
    
    try {
      setIsSaving(true);
      await updateTaskStatus(id, parseInt(newStatusId));
      setTask({ ...task, status: { ...task.status, id: parseInt(newStatusId) } });
      setIsSaving(false);
    } catch (err) {
      console.error('Error updating task status', err);
      setError('Failed to update task status');
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !id) return;
    
    try {
      setIsSaving(true);
      const res = await addTaskComment(id, comment);
      const data = res.data as { comment: CommentResponse };
      
      // Update task with new comment
      if (task) {
        const updatedComments = [...(task.comments || []), data.comment];
        setTask({ ...task, comments: updatedComments });
      }
      
      setComment('');
      setIsSaving(false);
    } catch (err) {
      console.error('Error adding comment', err);
      setError('Failed to add comment');
      setIsSaving(false);
    }
  };

  // Using shared utility functions from statusUtils.ts

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
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

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">Task not found</h3>
        <p className="mt-1 text-sm text-gray-500">The task you're looking for doesn't exist or you don't have access to it.</p>
        <div className="mt-6">
          <Link to="/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to={`/projects/${task.project.id}`}>
            <Button variant="ghost" size="sm">
              {task.project?.name || 'Back to Project'}
            </Button>
          </Link>
          <span className="text-gray-500">/</span>
          <h1 className="text-2xl font-bold">{task.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/tasks/${id}/edit`)}>
            Edit Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment: CommentResponse) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{comment.user.full_name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="mt-1 text-gray-700">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No comments yet</p>
                  </div>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mt-6">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSaving || !comment.trim()}>
                        {isSaving ? 'Adding...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statuses.length > 0 ? (
                <Select
                  value={task.status.id.toString()}
                  onValueChange={handleStatusChange}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        <div className="flex items-center">
                          {getStatusIcon(status.id)}
                          <span className="ml-2">{status.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center">
                  {getStatusIcon(task.status.id)}
                  <span className={`ml-2 ${getStatusColor(task.status.id)}`}>
                    {task.status?.name || 'Unknown Status'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Assignee */}
                <div>
                  <div className="text-sm font-medium text-gray-500">Assignee</div>
                  <div className="mt-1">
                    {task.assignee ? task.assignee.full_name : 'Unassigned'}
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <div className="text-sm font-medium text-gray-500">Reporter</div>
                  <div className="mt-1">
                    {task.reporter ? task.reporter.full_name : 'Unknown'}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <div className="text-sm font-medium text-gray-500">Priority</div>
                  <div className="mt-1 flex items-center">
                    <Flag className={`h-4 w-4 mr-1 ${getPriorityColor(task.priority)}`} />
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <div className="text-sm font-medium text-gray-500">Due Date</div>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : 'No due date'}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <div className="text-sm font-medium text-gray-500">Created</div>
                  <div className="mt-1 text-sm">
                    {new Date(task.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Updated At */}
                <div>
                  <div className="text-sm font-medium text-gray-500">Last Updated</div>
                  <div className="mt-1 text-sm">
                    {new Date(task.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TaskDetail);
