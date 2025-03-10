describe('Project Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123')
  })

  it('creates a new project with valid data', () => {
    // Navigate to project creation page
    cy.visit('/projects/new')
    
    // Fill out the form
    const projectName = `E2E Test Project ${Date.now()}`
    cy.get('input[name="name"]').type(projectName)
    cy.get('textarea[name="description"]').type('This is a project created during E2E testing')
    
    // Submit the form
    cy.get('button').contains('Create Project').click()
    
    // Verify redirect to project detail page
    cy.url().should('include', '/projects/')
    
    // Verify project details are displayed correctly
    cy.contains(projectName)
    cy.contains('This is a project created during E2E testing')
  })

  it('validates required fields when creating a project', () => {
    // Navigate to project creation page
    cy.visit('/projects/new')
    
    // Submit the form without filling required fields
    cy.get('button').contains('Create Project').click()
    
    // Verify validation error is displayed
    cy.contains('Project name is required')
    
    // Fill only the name field
    cy.get('input[name="name"]').type('Validation Test Project')
    cy.get('button').contains('Create Project').click()
    
    // Verify the form submits successfully with just the required field
    cy.url().should('include', '/projects/')
  })

  it('edits an existing project', () => {
    // Create a project to edit
    const projectName = `Project to Edit ${Date.now()}`
    cy.createProject(projectName, 'This project will be edited')
    
    // Get the project ID from the URL
    cy.url().then(url => {
      const projectId = url.split('/').pop()
      
      // Navigate to edit page
      cy.visit(`/projects/${projectId}/edit`)
      
      // Update the project details
      cy.get('input[name="name"]').clear().type(`${projectName} (Edited)`)
      cy.get('textarea[name="description"]').clear().type('This project has been edited during E2E testing')
      
      // Submit the form
      cy.get('button').contains('Update Project').click()
      
      // Verify redirect to project detail page
      cy.url().should('include', `/projects/${projectId}`)
      
      // Verify project details are updated
      cy.contains(`${projectName} (Edited)`)
      cy.contains('This project has been edited during E2E testing')
    })
  })

  it('deletes a project', () => {
    // Create a project to delete
    const projectName = `Project to Delete ${Date.now()}`
    cy.createProject(projectName, 'This project will be deleted')
    
    // Get the project ID from the URL
    cy.url().then(url => {
      const projectId = url.split('/').pop()
      
      // Click delete button
      cy.get('button').contains('Delete').click()
      
      // Confirm deletion
      cy.get('button').contains('Delete Project').click()
      
      // Verify redirect to projects page
      cy.url().should('include', '/projects')
      
      // Verify project is no longer in the list
      cy.contains(projectName).should('not.exist')
    })
  })
})
