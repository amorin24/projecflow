// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Create project command
Cypress.Commands.add('createProject', (name, description) => {
  cy.visit('/projects/new')
  cy.get('input[name="name"]').type(name)
  cy.get('textarea[name="description"]').type(description)
  cy.get('button').contains('Create Project').click()
  cy.url().should('include', '/projects/')
})

// Create task command
Cypress.Commands.add('createTask', (title, description, projectId, dueDate, priority = 'medium') => {
  cy.visit(`/tasks/new?projectId=${projectId}`)
  cy.get('input[name="title"]').type(title)
  cy.get('textarea[name="description"]').type(description)
  
  if (dueDate) {
    const formattedDate = dueDate.toISOString().split('T')[0]
    cy.get('input[name="due_date"]').type(formattedDate)
  }
  
  cy.get('select[name="priority"]').select(priority)
  cy.get('button').contains('Create Task').click()
  cy.url().should('include', '/tasks/')
})

// Delete task command
Cypress.Commands.add('deleteTask', (taskId) => {
  cy.visit(`/tasks/${taskId}`)
  cy.get('button').contains('Delete').click()
  cy.get('button').contains('Delete Task').click()
  cy.url().should('include', '/tasks')
})

// Delete project command
Cypress.Commands.add('deleteProject', (projectId) => {
  cy.visit(`/projects/${projectId}`)
  cy.get('button').contains('Delete').click()
  cy.get('button').contains('Delete Project').click()
  cy.url().should('include', '/projects')
})
