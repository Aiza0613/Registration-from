// jQuery Document Ready
$(document).ready(function() {
    
    // ========== NAVBAR FUNCTIONALITY ==========
    // Hamburger menu toggle
    $('#hamburger').on('click', function() {
        $(this).toggleClass('active');
        $('#navMenu').toggleClass('active');
    });

    // Close mobile menu when clicking on a nav link
    $('.nav-link').on('click', function() {
        $('#hamburger').removeClass('active');
        $('#navMenu').removeClass('active');
    });

    // Close mobile menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.navbar').length) {
            $('#hamburger').removeClass('active');
            $('#navMenu').removeClass('active');
        }
    });

    // Navbar scroll effect
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').css('box-shadow', '0 4px 30px rgba(0, 0, 0, 0.15)');
        } else {
            $('.navbar').css('box-shadow', '0 2px 20px rgba(0, 0, 0, 0.1)');
        }
    });

    // Prevent default behavior for demo links in navbar and footer
    $('.nav-link, .footer-links a, .social-link').on('click', function(e) {
        if ($(this).attr('href') === '#') {
            e.preventDefault();
            
            // Scroll to top smoothly for Home link
            if ($(this).text().includes('Home')) {
                $('html, body').animate({ scrollTop: 0 }, 600);
            } else {
                // Show alert for other demo links
                const linkText = $(this).text().trim();
                console.log(`${linkText} clicked - Demo link`);
            }
        }
    });

    // ========== FORM VALIDATION AND SUBMISSION ==========
    // Form validation and submission
    $('#registrationForm').on('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        $('.form-group').removeClass('error');
        $('.error-message').text('').hide();
        
        let isValid = true;
        
        // Validate Full Name
        const fullName = $('#fullName').val().trim();
        if (fullName.length < 3) {
            showError('fullName', 'Please enter your full name (minimum 3 characters)');
            isValid = false;
        }
        
        // Validate Email
        const email = $('#email').val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate Phone
        const phone = $('#phone').val().trim();
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (phone.length < 10 || !phoneRegex.test(phone)) {
            showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Validate Date of Birth
        const dob = $('#dob').val();
        if (!dob) {
            showError('dob', 'Please select your date of birth');
            isValid = false;
        } else {
            const dobDate = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - dobDate.getFullYear();
            if (age < 13 || age > 120) {
                showError('dob', 'You must be at least 13 years old');
                isValid = false;
            }
        }
        
        // Validate Gender
        const gender = $('#gender').val();
        if (!gender) {
            showError('gender', 'Please select your gender');
            isValid = false;
        }
        
        // Validate Address
        const address = $('#address').val().trim();
        if (address.length < 5) {
            showError('address', 'Please enter a valid address');
            isValid = false;
        }
        
        // Validate City
        const city = $('#city').val().trim();
        if (city.length < 2) {
            showError('city', 'Please enter a valid city name');
            isValid = false;
        }
        
        // Validate Country
        const country = $('#country').val();
        if (!country) {
            showError('country', 'Please select your country');
            isValid = false;
        }
        
        // Validate Password
        const password = $('#password').val();
        if (password.length < 6) {
            showError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        // Validate Confirm Password
        const confirmPassword = $('#confirmPassword').val();
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate Terms
        const terms = $('#terms').is(':checked');
        if (!terms) {
            showError('terms', 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        // If all validations pass
        if (isValid) {
            // Get newsletter preference
            const newsletter = $('#newsletter').is(':checked');
            
            // Prepare data for backend
            const formData = {
                fullName,
                email,
                phone,
                dob,
                gender,
                address,
                city,
                country,
                password,
                newsletter
            };
            
            // Show loading state
            $('.submit-btn').html('<i class="fas fa-spinner fa-spin"></i> Submitting...').prop('disabled', true);
            
            // Send data to backend
            $.ajax({
                url: 'http://localhost:3000/api/register',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function(response) {
                    if (response.success) {
                        // Animate form out
                        $('#formSection').fadeOut(400, function() {
                            // Display success section with user data
                            displayUserData({
                                fullName,
                                email,
                                phone,
                                dob,
                                gender,
                                address,
                                city,
                                country,
                                newsletter: newsletter ? 'Yes' : 'No'
                            });
                            
                            // Show success section
                            $('#successSection').addClass('active').fadeIn(400);
                            
                            // Scroll to top
                            $('html, body').animate({ scrollTop: 0 }, 300);
                        });
                        
                        console.log('✅ User registered successfully:', response.user);
                    } else {
                        alert('Registration failed: ' + response.message);
                        $('.submit-btn').html('<i class="fas fa-paper-plane"></i> Register Now').prop('disabled', false);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Registration error:', error);
                    let errorMessage = 'Registration failed. Please try again.';
                    
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    }
                    
                    alert(errorMessage);
                    $('.submit-btn').html('<i class="fas fa-paper-plane"></i> Register Now').prop('disabled', false);
                }
            });
        } else {
            // Scroll to first error
            const firstError = $('.form-group.error').first();
            if (firstError.length) {
                $('html, body').animate({
                    scrollTop: firstError.offset().top - 100
                }, 400);
            }
        }
    });
    
    // Show error function
    function showError(fieldId, message) {
        const field = $(`#${fieldId}`);
        const formGroup = field.closest('.form-group');
        formGroup.addClass('error');
        formGroup.find('.error-message').text(message).show();
    }
    
    // Display user data function
    function displayUserData(data) {
        const userDetailsHtml = `
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${data.fullName}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Email Address</div>
                    <div class="detail-value">${data.email}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Phone Number</div>
                    <div class="detail-value">${data.phone}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-calendar"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Date of Birth</div>
                    <div class="detail-value">${formatDate(data.dob)}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-venus-mars"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Gender</div>
                    <div class="detail-value">${data.gender}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${data.address}, ${data.city}, ${data.country}</div>
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="detail-content">
                    <div class="detail-label">Newsletter Subscription</div>
                    <div class="detail-value">${data.newsletter}</div>
                </div>
            </div>
        `;
        
        $('#userDetails').html(userDetailsHtml);
    }
    
    // Format date function
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }
    
    // Back button functionality
    $('#backBtn').on('click', function() {
        $('#successSection').removeClass('active').fadeOut(400, function() {
            // Reset form
            $('#registrationForm')[0].reset();
            $('.form-group').removeClass('error');
            $('.error-message').text('').hide();
            
            // Show form section
            $('#formSection').fadeIn(400);
            
            // Scroll to top
            $('html, body').animate({ scrollTop: 0 }, 300);
        });
    });
    
    // Real-time validation on blur
    $('#registrationForm input, #registrationForm select').on('blur', function() {
        const field = $(this);
        const formGroup = field.closest('.form-group');
        
        // Remove error state when field gets focus again
        formGroup.removeClass('error');
        formGroup.find('.error-message').hide();
    });
    
    // Prevent form links from navigating
    $('.link').on('click', function(e) {
        e.preventDefault();
        alert('This is a demo link. In a real application, this would navigate to the respective page.');
    });
    
    // Add smooth animations to inputs
    $('input, select').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
    
});

// Pure JavaScript for additional functionality
document.addEventListener('DOMContentLoaded', function() {
    // Console log for debugging
    console.log('Registration Form Loaded Successfully!');
    console.log('jQuery Version:', $.fn.jquery);
    
    // Add current year to footer if exists
    const currentYear = new Date().getFullYear();
    console.log('Current Year:', currentYear);
});
