import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markAllNotificationsRead } from '../lib/api';
import { Notification } from '../lib/types';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';

function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const data = res.data as { notifications: Notification[] };
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-primary transition-colors hover:text-primary/90">
                  ProjectFlow
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-primary text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Projects
                </Link>
                <Link
                  to="/tasks"
                  className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  My Tasks
                </Link>
                <Link
                  to="/resources"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Resources
                </Link>
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* Notifications dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex justify-between items-center p-2 border-b">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`p-3 border-b ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm">{notification.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-3">
                    <Avatar>
                      <AvatarFallback>
                        {user ? getInitials(user.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                to="/tasks"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Tasks
              </Link>
              <Link
                to="/resources"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarFallback>
                      {user ? getInitials(user.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.full_name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default React.memo(Layout);
