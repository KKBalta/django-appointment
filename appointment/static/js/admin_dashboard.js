/**
 * Dashboard functionality for the Staff Admin panel
 */

function fetchDashboardData() {
    // Fetch appointment count for today
    fetch('/appointment/ajax/is_user_staff_admin/')
        .then(response => response.json())
        .then(data => {
            if (!data.is_staff_admin) {
                showErrorMessage('You do not have access to this dashboard');
                return;
            }
            
            // Continue with dashboard data fetching
            fetchTodayAppointments();
            fetchStaffCount();
            fetchServiceCount();
            fetchStaffListForSidebar();
        })
        .catch(error => {
            console.error('Error checking permissions:', error);
            showErrorMessage('Error loading dashboard data');
        });
}

function fetchTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/appointment/app-admin/appointments/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.appointments) {
                const todayAppointments = data.appointments.filter(
                    appointment => appointment.start_time && appointment.start_time.startsWith(today)
                );
                document.getElementById('today-appointments-count').textContent = todayAppointments.length;
            } else {
                document.getElementById('today-appointments-count').textContent = '0';
            }
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
            document.getElementById('today-appointments-count').textContent = '0';
        });
}

function fetchStaffCount() {
    fetch('/appointment/ajax/fetch_staff_list/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('staff-count').textContent = data.staff_members.length;
        })
        .catch(error => {
            console.error('Error fetching staff count:', error);
            document.getElementById('staff-count').textContent = '0';
        });
}

function fetchServiceCount() {
    fetch('/appointment/app-admin/service-list/json/')
        .then(response => response.json())
        .then(data => {
            if (data.services) {
                document.getElementById('service-count').textContent = data.services.length;
            } else {
                document.getElementById('service-count').textContent = '0';
            }
        })
        .catch(error => {
            console.error('Error fetching service count:', error);
            document.getElementById('service-count').textContent = '0';
        });
}

function fetchStaffListForSidebar() {
    fetch('/appointment/ajax/fetch_staff_list/')
        .then(response => response.json())
        .then(data => {
            const staffList = document.getElementById('staff-list');
            staffList.innerHTML = '';
            
            // Display staff members in the sidebar
            if (data.staff_members.length === 0) {
                const item = document.createElement('li');
                item.className = 'staff-list-empty';
                item.innerHTML = 'No staff members found';
                staffList.appendChild(item);
                return;
            }
            
            // Display up to 5 staff members in the sidebar
            const displayCount = Math.min(data.staff_members.length, 5);
            for (let i = 0; i < displayCount; i++) {
                const staff = data.staff_members[i];
                const item = document.createElement('li');
                item.innerHTML = `
                    <div class="staff-name">${staff.name}</div>
                    <a href="/appointment/app-admin/user-profile/${staff.id}/" class="staff-action">
                        View
                    </a>
                `;
                staffList.appendChild(item);
            }
            
            // Add a "View All" button if there are more staff members
            if (data.staff_members.length > 5) {
                const viewAllItem = document.createElement('li');
                viewAllItem.className = 'view-all';
                const viewAllLink = document.createElement('a');
                viewAllLink.href = '#';
                viewAllLink.className = 'staff-action';
                viewAllLink.textContent = 'View All Staff';
                viewAllLink.onclick = function(e) {
                    e.preventDefault();
                    const staffModal = new bootstrap.Modal(document.getElementById('staffListModal'));
                    staffModal.show();
                    fetchStaffListForModal();
                };
                viewAllItem.appendChild(viewAllLink);
                staffList.appendChild(viewAllItem);
            }
        })
        .catch(error => {
            console.error('Error fetching staff list:', error);
            const staffList = document.getElementById('staff-list');
            staffList.innerHTML = '<li class="staff-list-error">Error loading staff list</li>';
        });
}

function fetchStaffListForModal() {
    fetch('/appointment/ajax/fetch_staff_list/')
        .then(response => response.json())
        .then(data => {
            const staffModalList = document.getElementById('staff-modal-list');
            staffModalList.innerHTML = '';
            
            if (data.staff_members.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="3" class="text-center">No staff members found</td>';
                staffModalList.appendChild(row);
                return;
            }
            
            data.staff_members.forEach(staff => {
                fetchStaffServices(staff.id).then(services => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${staff.name}</td>
                        <td>${services}</td>
                        <td class="text-end">
                            <div class="btn-group btn-group-sm">
                                <a href="/appointment/app-admin/user-profile/${staff.id}/" class="btn btn-outline-primary">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="/appointment/app-admin/update-staff-member/${staff.id}/" class="btn btn-outline-secondary">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteStaff(${staff.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    staffModalList.appendChild(row);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching staff list for modal:', error);
            const staffModalList = document.getElementById('staff-modal-list');
            staffModalList.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading staff members</td></tr>';
        });
}

function fetchStaffServices(staffId) {
    return fetch(`/appointment/ajax/fetch_service_list_for_staff/?staff_member=${staffId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.services_offered && data.services_offered.length > 0) {
                return data.services_offered.map(service => service.name).join(', ');
            }
            return 'No services';
        })
        .catch(error => {
            console.error('Error fetching staff services:', error);
            return 'Error loading services';
        });
}

function confirmDeleteStaff(staffId) {
    if (confirm('Are you sure you want to remove this staff member?')) {
        window.location.href = `/appointment/app-admin/remove-staff-member/${staffId}/`;
    }
}

function initializeMiniCalendar() {
    const calendarEl = document.getElementById('mini-calendar');
    
    if (!calendarEl) {
        console.error('Calendar element not found');
        return;
    }
    
    try {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridDay',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridDay,timeGridWeek'
            },
            height: 'auto',
            navLinks: true,
            editable: false,
            selectable: true,
            nowIndicator: true,
            events: function(info, successCallback, failureCallback) {
                fetch('/appointment/app-admin/appointments/json/')
                    .then(response => response.json())
                    .then(data => {
                        if (data.appointments) {
                            const formattedEvents = data.appointments
                                .filter(appt => appt.start_time && appt.end_time)
                                .map(appt => ({
                                    id: appt.id,
                                    title: `${appt.service_name || 'Service'} - ${appt.client_name || 'Client'}`,
                                    start: appt.start_time,
                                    end: appt.end_time,
                                    backgroundColor: appt.background_color || '#007aff',
                                    url: `/appointment/app-admin/display-appointment/${appt.id}/`
                                }));
                            successCallback(formattedEvents);
                        } else {
                            successCallback([]);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching calendar events:', error);
                        failureCallback(error);
                        showErrorMessage('Failed to load calendar events');
                    });
            },
            eventDidMount: function(info) {
                // Add tooltip to events
                if (info.event.title) {
                    info.el.setAttribute('title', info.event.title);
                }
            }
        });
        
        calendar.render();
    } catch (error) {
        console.error('Error initializing calendar:', error);
        if (calendarEl) {
            calendarEl.innerHTML = '<div class="alert alert-danger">Failed to load calendar</div>';
        }
    }
}

function showErrorMessage(message) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    mainContent.prepend(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
        if (alert) alert.close();
    }, 5000);
}