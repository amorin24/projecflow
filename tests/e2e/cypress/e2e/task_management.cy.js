describe('Task Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Wait for login to complete and redirect to dashboard
    cy.url().should('include', '/dashboard')
  })

  it('creates a new task with valid data', () => {
    // Navigate to task creation page
    cy.visit('/tasks/new')
    
    // Fill out the form
    cy.get('input[name="title"]').type('E2E Test Task')
    cy.get('textarea[name="description"]').type('This is a task created during E2E testing')
    
    // Select a project
    cy.get('select[name="project_id"]').select('1')
    
    // Set due date to 7 days from now
    const date = new Date()
    date.setDate(date.getDate() + 7)
    const formattedDate = date.toISOString().split('T')[0]
    cy.get('input[name="due_date"]').type(formattedDate)
    
    // Set priority
    cy.get('select[name="priority"]').select('high')
    
    // Submit the form
    cy.get('button').contains('Create Task').click()
    
    // Verify redirect to task detail page
    cy.url().should('include', '/tasks/')
    
    // Verify task details are displayed correctly
    cy.contains('E2E Test Task')
    cy.contains('This is a task created during E2E testing')
    cy.contains('High')
    cy.contains(formattedDate.replace(/-/g, '/'))
  })

  it('handles invalid date inputs gracefully', () => {
    // Navigate to task creation page with invalid date parameter
    cy.visit('/tasks/new?title=Invalid+Date+Task&description=Testing+invalid+date+handling&due_date=99999-99-99')
    
    // Verify form loads with today's date as fallback
    const today = new Date().toISOString().split('T')[0]
    cy.get('input[name="due_date"]').should('have.value', today)
    
    // Verify other fields are populated correctly
    cy.get('input[name="title"]').should('have.value', 'Invalid Date Task')
    cy.get('textarea[name="description"]').should('have.value', 'Testing invalid date handling')
    
    // Submit the form
    cy.get('button').contains('Create Task').click()
    
    // Verify redirect to task detail page
    cy.url().should('include', '/tasks/')
    
    // Verify task was created with correct data
    cy.contains('Invalid Date Task')
    cy.contains('Testing invalid date handling')
  })

  it('updates task status', () => {
    // Navigate to an existing task
    cy.visit('/tasks')
    cy.get('.task-card').first().click()
    
    // Get current status
    cy.get('select[name="status_id"]').invoke('val').then(initialStatus => {
      // Select a different status
      const newStatus = initialStatus === '1' ? '2' : '1'
      cy.get('select[name="status_id"]').select(newStatus)
      
      // Verify status was updated
      cy.get('select[name="status_id"]').should('have.value', newStatus)
    })
  })

  it('adds a comment to a task', () => {
    // Navigate to an existing task
    cy.visit('/tasks')
    cy.get('.task-card').first().click()
    
    // Add a comment
    const comment = 'E2E test comment ' + Date.now()
    cy.get('textarea[placeholder="Add a comment..."]').type(comment)
    cy.get('button').contains('Post').click()
    
    // Verify comment was added
    cy.contains(comment)
  })

  it('deletes a task', () => {
    // Create a task to delete
    cy.visit('/tasks/new')
    cy.get('input[name="title"]').type('Task to Delete')
    cy.get('textarea[name="description"]').type('This task will be deleted')
    cy.get('select[name="project_id"]').select('1')
    cy.get('button').contains('Create Task').click()
    
    // Get the task ID from the URL
    cy.url().then(url => {
      const taskId = url.split('/').pop()
      
      // Click delete button
      cy.get('button').contains('Delete').click()
      
      // Confirm deletion
      cy.get('button').contains('Delete Task').click()
      
      // Verify redirect to tasks page
      cy.url().should('include', '/tasks')
      
      // Verify task is no longer in the list
      cy.visit(`/tasks/${taskId}`)
      cy.contains('Task not found')
    })
  })
})
