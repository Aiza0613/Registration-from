$(document).ready(function() {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'index.html';
        return;
    }

    let allUsers = [];

    // Load users on page load
    loadUsers();

    // Refresh button
    $('#refreshBtn').on('click', function() {
        loadUsers();
    });

    // Logout button
    $('#logoutBtn').on('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            window.location.href = 'index.html';
        }
    });

    // Search functionality
    $('#searchInput').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterUsers(searchTerm);
    });

    // Close modal
    $('#closeModal').on('click', function() {
        $('#userModal').fadeOut();
    });

    // Close modal when clicking outside
    $(window).on('click', function(e) {
        if ($(e.target).is('#userModal')) {
            $('#userModal').fadeOut();
        }
    });

    // Load users from backend
    function loadUsers() {
        $('#refreshBtn').html('<i class="fas fa-spinner fa-spin"></i> Loading...').prop('disabled', true);

        $.ajax({
            url: 'http://localhost:3000/api/users',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    allUsers = response.users;
                    updateStatistics(allUsers);
                    displayUsers(allUsers);
                } else {
                    showError('Failed to load users');
                }
                $('#refreshBtn').html('<i class="fas fa-sync-alt"></i> Refresh').prop('disabled', false);
            },
            error: function(xhr, status, error) {
                console.error('Error loading users:', error);
                showError('Failed to load users. Make sure the server is running.');
                $('#refreshBtn').html('<i class="fas fa-sync-alt"></i> Refresh').prop('disabled', false);
            }
        });
    }

    // Update statistics
    function updateStatistics(users) {
        const totalUsers = users.length;
        const maleUsers = users.filter(u => u.gender === 'Male').length;
        const femaleUsers = users.filter(u => u.gender === 'Female').length;
        const newsletterUsers = users.filter(u => u.newsletter).length;

        $('#totalUsers').text(totalUsers);
        $('#maleUsers').text(maleUsers);
        $('#femaleUsers').text(femaleUsers);
        $('#newsletterUsers').text(newsletterUsers);
    }

    // Display users in table
    function displayUsers(users) {
        if (users.length === 0) {
            $('#tableContent').html('<div class="no-data"><i class="fas fa-inbox"></i><br>No users registered yet</div>');
            return;
        }

        let tableHtml = `
            <table class="users-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>Registered Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach((user, index) => {
            const registeredDate = new Date(user.registeredAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            tableHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${user.fullName}</strong></td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.gender}</td>
                    <td>${user.city}</td>
                    <td>${user.country}</td>
                    <td>${registeredDate}</td>
                    <td>
                        <button class="action-btn view-btn" onclick="viewUser('${user._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteUser('${user._id}', '${user.fullName}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        $('#tableContent').html(tableHtml);
    }

    // Filter users based on search
    function filterUsers(searchTerm) {
        if (!searchTerm) {
            displayUsers(allUsers);
            return;
        }

        const filtered = allUsers.filter(user => {
            return user.fullName.toLowerCase().includes(searchTerm) ||
                   user.email.toLowerCase().includes(searchTerm) ||
                   user.phone.toLowerCase().includes(searchTerm) ||
                   user.city.toLowerCase().includes(searchTerm) ||
                   user.country.toLowerCase().includes(searchTerm);
        });

        displayUsers(filtered);
    }

    // View user details
    window.viewUser = function(userId) {
        const user = allUsers.find(u => u._id === userId);
        if (!user) return;

        const dob = new Date(user.dob).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const registeredDate = new Date(user.registeredAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const modalHtml = `
            <div class="user-detail-grid">
                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Full Name</div>
                        <div class="user-detail-value">${user.fullName}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Email Address</div>
                        <div class="user-detail-value">${user.email}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Phone Number</div>
                        <div class="user-detail-value">${user.phone}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Date of Birth</div>
                        <div class="user-detail-value">${dob}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-venus-mars"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Gender</div>
                        <div class="user-detail-value">${user.gender}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Address</div>
                        <div class="user-detail-value">${user.address}, ${user.city}, ${user.country}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Newsletter Subscription</div>
                        <div class="user-detail-value">${user.newsletter ? 'Yes' : 'No'}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">Registration Date</div>
                        <div class="user-detail-value">${registeredDate}</div>
                    </div>
                </div>

                <div class="user-detail-item">
                    <div class="user-detail-icon">
                        <i class="fas fa-fingerprint"></i>
                    </div>
                    <div class="user-detail-content">
                        <div class="user-detail-label">User ID</div>
                        <div class="user-detail-value">${user._id}</div>
                    </div>
                </div>
            </div>
        `;

        $('#modalUserDetails').html(modalHtml);
        $('#userModal').fadeIn();
    };

    // Delete user
    window.deleteUser = function(userId, userName) {
        if (!confirm(`Are you sure you want to delete ${userName}?`)) {
            return;
        }

        $.ajax({
            url: `http://localhost:3000/api/users/${userId}`,
            method: 'DELETE',
            success: function(response) {
                if (response.success) {
                    alert('User deleted successfully!');
                    loadUsers();
                } else {
                    alert('Failed to delete user: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Delete error:', error);
                alert('Failed to delete user. Please try again.');
            }
        });
    };

    // Show error message
    function showError(message) {
        $('#tableContent').html(`
            <div class="no-data" style="color: #ef4444;">
                <i class="fas fa-exclamation-circle"></i><br>${message}
            </div>
        `);
    }
});
