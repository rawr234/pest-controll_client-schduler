const DB = {
  // Initialize the database if it doesn't exist
  init: function() {
    if (!localStorage.getItem('appointments')) {
      localStorage.setItem('appointments', JSON.stringify([]));
    }
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([
        // Default admin user
        {
          id: 'admin-1',
          email: 'admin@pestcontrol.com',
          password: 'admin123', // In a real app, this would be hashed
          name: 'System Administrator',
          role: 'admin'
        }
      ]));
    }
  },
  
  // User operations
  registerUser: function(user) {
    const users = this.getUsers();
    // Check if user already exists
    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
      return { success: false, message: 'A user with this email already exists' };
    }
    
    // Generate user ID
    user.id = 'user-' + Date.now().toString();
    user.role = 'customer'; // Default role for new registrations
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, user: { ...user, password: undefined } }; // Return user without password
  },
  
  authenticateUser: function(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a session (in real app, this would be a proper token)
      const session = {
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem('currentSession', JSON.stringify(session));
      return { success: true, user: { ...user, password: undefined }, session };
    }
    
    return { success: false, message: 'Invalid email or password' };
  },
  
  getCurrentUser: function() {
    const sessionStr = localStorage.getItem('currentSession');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    // Check if session is expired
    if (session.expiry < Date.now()) {
      localStorage.removeItem('currentSession'); // Clear expired session
      return null;
    }
    
    return session;
  },
  
  logoutUser: function() {
    localStorage.removeItem('currentSession');
  },
  
  getUsers: function() {
    return JSON.parse(localStorage.getItem('users')) || [];
  },
  
  // Get all appointments
  getAppointments: function() {
    return JSON.parse(localStorage.getItem('appointments')) || [];
  },
  
  // Add a new appointment
  addAppointment: function(appointment) {
    const appointments = this.getAppointments();
    // Generate a simple ID
    appointment.id = Date.now().toString();
    appointment.status = 'pending';
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    return appointment;
  },
  
  // Update an appointment
  updateAppointment: function(id, updates) {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(app => app.id === id);
    
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      localStorage.setItem('appointments', JSON.stringify(appointments));
      return appointments[index];
    }
    return null;
  },
  
  // Get customer appointments by user ID
  getCustomerAppointments: function(userId) {
    const appointments = this.getAppointments();
    return appointments.filter(app => app.userId === userId);
  },
  
  // Get customer appointments by email (for backward compatibility)
  getAppointmentsByEmail: function(email) {
    const appointments = this.getAppointments();
    return appointments.filter(app => app.email === email);
  }
};

// Initialize the database
DB.init();