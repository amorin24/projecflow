import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProject, getProject, updateProject } from '../lib/api';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setIsFetching(true);
      const res = await getProject(id!);
      const data = res.data as { project: Project };
      setFormData({
        name: data.project.name,
        description: data.project.description,
      });
      setIsFetching(false);
    } catch (err) {
      console.error('Error fetching project', err);
      setError('Failed to load project data');
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      if (isEditMode) {
        await updateProject(id!, formData as UpdateProjectRequest);
      } else {
        await createProject(formData);
      }
      setIsLoading(false);
      navigate('/projects');
    } catch (err) {
      console.error('Error saving project', err);
      setError('Failed to save project');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Project' : 'Create Project'}</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Project Details' : 'Project Details'}</CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update your project information below'
                : 'Fill in the details to create a new project'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
