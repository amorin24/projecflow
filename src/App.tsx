import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import AuthLayout from './pages/AuthLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import TaskFormPage from './pages/TaskForm';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route path="/" element={<Layout />}>
          <Route index element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          
          <Route path="projects/new" element={
            <ProtectedRoute>
              <ProjectForm />
            </ProtectedRoute>
          } />
          
          <Route path="projects/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          
          <Route path="projects/:id/edit" element={
            <ProtectedRoute>
              <ProjectForm />
            </ProtectedRoute>
          } />
          
          <Route path="tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />
          
          <Route path="tasks/:id" element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          } />
          
          <Route path="tasks/new" element={
            <ProtectedRoute>
              <TaskFormPage />
            </ProtectedRoute>
          } />
          
          <Route path="projects/:projectId/tasks/new" element={
            <ProtectedRoute>
              <TaskFormPage />
            </ProtectedRoute>
          } />
          
          <Route path="tasks/:id/edit" element={
            <ProtectedRoute>
              <TaskFormPage />
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
