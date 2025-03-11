import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Card } from '../components/ui/card';
import ThemeToggle from '../components/ui/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">ProjectFlow</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Streamline your project management</p>
        </div>
        
        <Card className="w-full p-6 shadow-lg">
          <Outlet />
        </Card>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ProjectFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
