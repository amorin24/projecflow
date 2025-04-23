import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import React from 'react';

export const getStatusColor = (statusId: number): string => {
  switch (statusId) {
    case 1: // To Do
      return 'text-yellow-500';
    case 2: // In Progress
      return 'text-blue-500';
    case 3: // Done
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export const getStatusIcon = (statusId: number): React.ReactNode => {
  switch (statusId) {
    case 1: // To Do
      return React.createElement(AlertCircle, { className: "h-5 w-5 text-yellow-500" });
    case 2: // In Progress
      return React.createElement(Clock, { className: "h-5 w-5 text-blue-500" });
    case 3: // Done
      return React.createElement(CheckCircle, { className: "h-5 w-5 text-green-500" });
    default:
      return null;
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};
