function openTab(evt, tabName) {
  const tabcontents = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontents.length; i++) {
    tabcontents[i].style.display = "none";
  }
  
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
  
  // Load the appropriate appointments
  if (tabName === 'PendingTab') {
    loadPendingAppointments();
  } else if (tabName === 'AcceptedTab') {
    loadAcceptedAppointments();
  } else if (tabName === 'AllTab') {
    loadAllAppointments();
  }
}

// Load pending appointments
function loadPendingAppointments() {
  const appointments = DB.getAppointments().filter(app => app.status === 'pending');
  renderAppointments(appointments, 'pendingAppointments', true);
}

// Load accepted appointments
function loadAcceptedAppointments() {
  const appointments = DB.getAppointments().filter(app => app.status === 'accepted');
  renderAppointments(appointments, 'acceptedAppointments', false);
}

// Load all appointments
function loadAllAppointments() {
  const appointments = DB.getAppointments();
  renderAppointments(appointments, 'allAppointments', false);
}

// Render appointments to the specified container
function renderAppointments(appointments, containerId, showAcceptButton) {
  const container = document.getElementById(containerId);
  
  if (appointments.length === 0) {
    container.innerHTML = '<p>No appointments found.</p>';
    return;
  }
  
  let html = '';
  appointments.forEach(app => {
    let statusClass = app.status === 'pending' ? 'status-pending' : 'status-accepted';
    
    html += `
      <div class="appointment ${app.status}">
        <h3>Appointment on ${formatDate(app.date)} at ${app.time}</h3>
        <p><strong>Customer:</strong> ${app.name}</p>
        <p><strong>Email:</strong> ${app.email}</p>
        <p><strong>Phone:</strong> ${app.phone}</p>
        <p><strong>Address:</strong> ${app.address}</p>
        <p><strong>Service Type:</strong> ${getServiceName(app.type)}</p>
        <p><strong>Customer Notes:</strong> ${app.notes || 'No notes provided.'}</p>
        <p><strong>Status:</strong> <span class="${statusClass}">${app.status.toUpperCase()}</span></p>
        
        ${app.technician ? `
          <div class="technician-info">
            <p><strong>Assigned Technician:</strong> ${app.technician}</p>
            <p><strong>Admin Notes:</strong> ${app.adminNotes || 'No notes provided.'}</p>
          </div>
        ` : ''}
        
        ${showAcceptButton && app.status === 'pending' ? `
          <div class="actions">
            <button onclick="openAcceptModal('${app.id}')">Accept Appointment</button>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Open the accept modal
function openAcceptModal(id) {
  document.getElementById('appointmentId').value = id;
  document.getElementById('acceptModal').style.display = 'block';
}

// Close the accept modal
function closeModal() {
  document.getElementById('acceptModal').style.display = 'none';
  document.getElementById('acceptForm').reset();
}

// Handle accept form submission
document.getElementById('acceptForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const id = document.getElementById('appointmentId').value;
  const technician = document.getElementById('technician').value;
  const adminNotes = document.getElementById('adminNotes').value;
  
  DB.updateAppointment(id, {
    status: 'accepted',
    technician: technician,
    adminNotes: adminNotes
  });
  
  closeModal();
  loadPendingAppointments();
  alert('Appointment has been accepted and assigned to ' + technician);
});

// Helper function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to get service name
function getServiceName(type) {
  const services = {
    'general': 'General Pest Control',
    'termite': 'Termite Treatment',
    'rodent': 'Rodent Control',
    'mosquito': 'Mosquito Treatment',
    'bedbug': 'Bed Bug Treatment'
  };
  return services[type] || type;
}

// Load pending appointments on page load
document.addEventListener('DOMContentLoaded', function() {
  loadPendingAppointments();
});