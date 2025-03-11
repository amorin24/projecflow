describe('User Management', () => {
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'password123'
  const testName = 'E2E Test User'

  it('registers a new user', () => {
    // Navigate to registration page
    cy.visit('/register')
    
    // Fill out the form
    cy.get('input[name="name"]').type(testName)
    cy.get('input[name="email"]').type(testEmail)
    cy.get('input[name="password"]').type(testPassword)
    cy.get('input[name="confirmPassword"]').type(testPassword)
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Verify redirect to login page
    cy.url().should('include', '/login')
    cy.contains('Registration successful')
  })

  it('logs in with valid credentials', () => {
    // Navigate to login page
    cy.visit('/login')
    
    // Fill out the form
    cy.get('input[name="email"]').type(testEmail)
    cy.get('input[name="password"]').type(testPassword)
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Verify user is logged in
    cy.contains('Welcome')
    cy.contains(testName)
  })

  it('shows validation errors for invalid login', () => {
    // Navigate to login page
    cy.visit('/login')
    
    // Submit with invalid credentials
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Verify error message
    cy.contains('Invalid email or password')
    
    // Verify still on login page
    cy.url().should('include', '/login')
  })

  it('updates user profile', () => {
    // Login first
    cy.login(testEmail, testPassword)
    
    // Navigate to profile page
    cy.visit('/profile')
    
    // Update profile information
    const updatedName = `${testName} Updated`
    cy.get('input[name="name"]').clear().type(updatedName)
    
    // Submit the form
    cy.get('button').contains('Update Profile').click()
    
    // Verify success message
    cy.contains('Profile updated successfully')
    
    // Verify profile information is updated
    cy.reload()
    cy.get('input[name="name"]').should('have.value', updatedName)
  })

  it('logs out successfully', () => {
    // Login first
    cy.login(testEmail, testPassword)
    
    // Click logout button
    cy.get('button').contains('Logout').click()
    
    // Verify redirect to login page
    cy.url().should('include', '/login')
    
    // Verify protected routes are no longer accessible
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })
})
