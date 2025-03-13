-- User availability table to track when users are available
CREATE TABLE IF NOT EXISTS user_availability (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6 for Sunday-Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_availability UNIQUE (user_id, day_of_week, start_time, end_time)
);

-- Resource allocations table to track user assignments to projects
CREATE TABLE IF NOT EXISTS resource_allocations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  allocation_percentage INTEGER NOT NULL CHECK (allocation_percentage BETWEEN 0 AND 100),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_project_allocation UNIQUE (user_id, project_id, start_date)
);

-- Time off requests table
CREATE TABLE IF NOT EXISTS time_off_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  request_type VARCHAR(20) NOT NULL, -- vacation, sick, personal, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_availability_user_id ON user_availability(user_id);
CREATE INDEX idx_resource_allocations_user_id ON resource_allocations(user_id);
CREATE INDEX idx_resource_allocations_project_id ON resource_allocations(project_id);
CREATE INDEX idx_time_off_requests_user_id ON time_off_requests(user_id);
CREATE INDEX idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX idx_time_off_requests_dates ON time_off_requests(start_date, end_date);
