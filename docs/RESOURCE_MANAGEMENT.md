# Resource Management

## Overview

The Resource Management feature in ProjectFlow allows project managers to efficiently allocate team members to projects, track their availability, and manage time-off requests. This comprehensive system helps in balancing workloads, preventing resource conflicts, and ensuring optimal utilization of team members across projects.

## Key Features

1. **Resource Allocation**
   - Assign team members to projects with specific allocation percentages
   - Set allocation periods with start and end dates
   - Visualize resource allocations across projects

2. **User Availability**
   - Define regular working hours for team members
   - Set availability by day of the week
   - Track recurring availability patterns

3. **Time-Off Management**
   - Request time off for vacation, sick leave, or other purposes
   - Approve or reject time-off requests
   - Visualize team availability considering time-off periods

4. **Resource Calendar**
   - View resource allocations in a calendar format
   - Identify potential resource conflicts
   - Plan resource allocation based on availability

## Database Schema

### Resource Allocations

```sql
CREATE TABLE resource_allocations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    allocation_percentage INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### User Availability

```sql
CREATE TABLE user_availability (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    day_of_week INT NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Time-Off Requests

```sql
CREATE TABLE time_off_requests (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- vacation, sick, personal, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Resource Allocations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources/allocations` | List all resource allocations with optional filtering |
| GET | `/api/resources/allocations/:id` | Get a specific resource allocation |
| POST | `/api/resources/allocations` | Create a new resource allocation |
| PUT | `/api/resources/allocations/:id` | Update an existing resource allocation |
| DELETE | `/api/resources/allocations/:id` | Delete a resource allocation |

### User Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources/availability` | List availability for all users or a specific user |
| GET | `/api/resources/availability/:id` | Get a specific availability record |
| POST | `/api/resources/availability` | Create a new availability record |
| PUT | `/api/resources/availability/:id` | Update an existing availability record |
| DELETE | `/api/resources/availability/:id` | Delete an availability record |

### Time-Off Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources/timeoff` | List all time-off requests with optional filtering |
| GET | `/api/resources/timeoff/:id` | Get a specific time-off request |
| POST | `/api/resources/timeoff` | Create a new time-off request |
| PUT | `/api/resources/timeoff/:id/status` | Update the status of a time-off request (approve/reject) |
| DELETE | `/api/resources/timeoff/:id` | Delete a time-off request |

## Frontend Components

### Resource Allocation Form

The `ResourceAllocationForm` component allows users to create or edit resource allocations. It includes:

- User selection dropdown
- Project selection dropdown
- Allocation percentage input
- Date range selection
- Notes field

### Resource Calendar

The `ResourceCalendar` component provides a visual representation of resource allocations and availability:

- Calendar view with day, week, and month options
- Color-coded allocations by project
- Time-off periods highlighted
- User filtering options

### Resource Allocation List

The `ResourceAllocationList` component displays a list of resource allocations with:

- Filtering by user and project
- Sorting options
- Edit and delete functionality
- Allocation percentage visualization

### Time-Off Request Form

The `TimeOffRequestForm` component allows users to submit time-off requests with:

- Date range selection
- Request type selection (vacation, sick, personal, etc.)
- Notes field
- Validation for date ranges

### Time-Off Request List

The `TimeOffRequestList` component displays time-off requests with:

- Status indicators (pending, approved, rejected)
- Filtering by status and user
- Approval/rejection functionality for managers
- Date range display

### User Availability Form

The `UserAvailabilityForm` component allows setting regular availability with:

- Day of week selection
- Time range selection
- Multiple availability slots per day

## Usage Examples

### Creating a Resource Allocation

```typescript
// Example API call to create a resource allocation
const createAllocation = async (data) => {
  try {
    const response = await api.post('/api/resources/allocations', {
      user_id: 'user123',
      project_id: 'project456',
      allocation_percentage: 50,
      start_date: '2025-03-01',
      end_date: '2025-06-30',
      notes: 'Frontend development phase'
    });
    return response.data;
  } catch (error) {
    console.error('Error creating allocation:', error);
    throw error;
  }
};
```

### Submitting a Time-Off Request

```typescript
// Example API call to submit a time-off request
const submitTimeOffRequest = async (data) => {
  try {
    const response = await api.post('/api/resources/timeoff', {
      user_id: 'user123',
      start_date: '2025-04-10',
      end_date: '2025-04-15',
      request_type: 'vacation',
      notes: 'Family vacation'
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting time-off request:', error);
    throw error;
  }
};
```

## Integration with Other Features

The Resource Management feature integrates with other ProjectFlow features:

- **Project Management**: Resource allocations are linked to projects
- **Task Management**: Resource availability affects task assignments
- **User Management**: User profiles include availability information
- **Dashboard**: Resource utilization metrics are displayed on dashboards
- **Notifications**: Users receive notifications about time-off request status changes

## Best Practices

1. **Resource Allocation**
   - Avoid over-allocating team members (>100% total allocation)
   - Consider time-off periods when planning allocations
   - Regularly review and adjust allocations as project needs change

2. **Time-Off Management**
   - Submit time-off requests well in advance when possible
   - Consider project deadlines when approving time-off requests
   - Ensure adequate coverage during team member absences

3. **Availability Planning**
   - Keep availability information up-to-date
   - Consider different time zones for distributed teams
   - Use the resource calendar for planning meetings and collaborative work
