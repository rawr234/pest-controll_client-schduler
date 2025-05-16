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
}

// Handle form submission
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const appointment = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    type: document.getElementById('type').value,
    notes: document.getElementById('notes').value,
    createdAt: new Date().toISOString()
  };
  
  DB.addAppointment(appointment);
  
  alert('Appointment scheduled successfully! We will contact you shortly to confirm.');
  document.getElementById('appointmentForm').reset();
});

// Check appointments by email
document.getElementById('checkAppointmentsBtn').addEventListener('click', function() {
  const email = document.getElementById('checkEmail').value;
  if (!email) {
    alert('Please enter your email address');
    return;
  }
  
  const appointments = DB.getCustomerAppointments(email);
  const appointmentsList = document.getElementById('appointmentsList');
  
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<p>No appointments found for this email.</p>';
    return;
  }
  
  let html = '';
  appointments.forEach(app => {
    let statusClass = app.status === 'pending' ? 'status-pending' : 'status-accepted';
    
    html += `
      <div class="appointment ${app.status}">
        <h3>Appointment on ${formatDate(app.date)} at ${app.time}</h3>
        <p><strong>Service Type:</strong> ${getServiceName(app.type)}</p>
        <p><strong>Address:</strong> ${app.address}</p>
        <p><strong>Status:</strong> <span class="${statusClass}">${app.status.toUpperCase()}</span></p>
        
        ${app.technician ? (
          `<div class="technician-info">
            <p><strong>Assigned Technician:</strong> ${app.technician}</p>
            <p><strong>Notes from Admin:</strong> ${app.adminNotes || 'No notes provided.'}</p>
          </div>`
        ) : ''}
      </div>
    `;
  });
  
  appointmentsList.innerHTML = html;
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