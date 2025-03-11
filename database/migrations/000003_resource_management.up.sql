CREATE TABLE IF NOT EXISTS user_availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS resource_allocations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    allocation_percentage INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_allocation_percentage CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS time_off_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- vacation, sick, personal, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_availability_user_id ON user_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_user_id ON resource_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project_id ON resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_task_id ON resource_allocations(task_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_user_id ON time_off_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
