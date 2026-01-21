// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Order Form Submission
const orderForm = document.getElementById('orderForm');
const formMessage = document.getElementById('formMessage');

if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(orderForm);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = orderForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Send to Google Sheets (replace with your Apps Script URL)
            const scriptURL = 'https://script.google.com/macros/s/AKfycby.../exec';
            
            const response = await fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    timestamp: new Date().toISOString(),
                    source: 'landing_page'
                })
            });
            
            // Show success message
            formMessage.textContent = 'Thank you! Your order request has been submitted. We will contact you within 24 hours.';
            formMessage.className = 'message success';
            formMessage.style.display = 'block';
            
            // Reset form
            orderForm.reset();
            
            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            // Show error message
            formMessage.textContent = 'There was an error submitting your request. Please try again or call us directly.';
            formMessage.className = 'message error';
            formMessage.style.display = 'block';
            
            console.error('Error:', error);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Hide message after 10 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 10000);
        }
    });
}

// Set minimum date for appointment to today
const dateInput = document.getElementById('preferred-date');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Set placeholder to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    dateInput.placeholder = tomorrowStr;
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Form validation enhancement
const validateForm = () => {
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    
    if (email) {
        email.addEventListener('input', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value) && email.value) {
                email.style.borderColor = 'var(--secondary-color)';
            } else {
                email.style.borderColor = '#ddd';
            }
        });
    }
    
    if (phone) {
        phone.addEventListener('input', () => {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleaned = phone.value.replace(/\D/g, '');
            if (!phoneRegex.test(cleaned) && phone.value) {
                phone.style.borderColor = 'var(--secondary-color)';
            } else {
                phone.style.borderColor = '#ddd';
            }
        });
    }
};

// Initialize form validation
document.addEventListener('DOMContentLoaded', validateForm);

// Testimonials carousel for mobile
const initTestimonialsCarousel = () => {
    if (window.innerWidth < 768) {
        const testimonialGrid = document.querySelector('.testimonial-grid');
        if (testimonialGrid && !testimonialGrid.classList.contains('carousel-initialized')) {
            testimonialGrid.classList.add('carousel-initialized');
            
            let currentIndex = 0;
            const cards = testimonialGrid.querySelectorAll('.testimonial-card');
            const totalCards = cards.length;
            
            // Show only first card
            cards.forEach((card, index) => {
                card.style.display = index === 0 ? 'block' : 'none';
            });
            
            // Add navigation dots
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'carousel-dots';
            dotsContainer.style.textAlign = 'center';
            dotsContainer.style.marginTop = '1rem';
            
            for (let i = 0; i < totalCards; i++) {
                const dot = document.createElement('span');
                dot.className = 'carousel-dot';
                dot.style.display = 'inline-block';
                dot.style.width = '10px';
                dot.style.height = '10px';
                dot.style.margin = '0 5px';
                dot.style.borderRadius = '50%';
                dot.style.backgroundColor = i === 0 ? 'var(--secondary-color)' : '#ddd';
                dot.style.cursor = 'pointer';
                
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                });
                
                dotsContainer.appendChild(dot);
            }
            
            testimonialGrid.parentNode.insertBefore(dotsContainer, testimonialGrid.nextSibling);
            
            // Auto rotate every 5 seconds
            setInterval(() => {
                currentIndex = (currentIndex + 1) % totalCards;
                updateCarousel();
            }, 5000);
            
            function updateCarousel() {
                cards.forEach((card, index) => {
                    card.style.display = index === currentIndex ? 'block' : 'none';
                });
                
                dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                    dot.style.backgroundColor = index === currentIndex ? 'var(--secondary-color)' : '#ddd';
                });
            }
        }
    }
};

// Initialize carousel on load and resize
window.addEventListener('load', initTestimonialsCarousel);
window.addEventListener('resize', initTestimonialsCarousel);

// Add active class to current nav item based on scroll
const updateActiveNav = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', updateActiveNav);