// Contact form handler for Borne Systems website
// Submits to AWS Lambda -> SES

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('formStatus');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        statusDiv.textContent = '';
        statusDiv.className = 'form-status';
        
        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value
        };
        
        try {
            // REPLACE THIS with your actual Lambda API Gateway URL
            const LAMBDA_URL = 'YOUR_API_GATEWAY_URL_HERE';
            
            const response = await fetch(LAMBDA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusDiv.textContent = result.message || 'Message sent! We\'ll be in touch soon.';
                statusDiv.className = 'form-status success';
                form.reset();
            } else {
                throw new Error(result.message || 'Failed to send');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            statusDiv.textContent = 'Oops! Something went wrong. Try emailing us directly at geele.evans@gmail.com';
            statusDiv.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
});

// Fallback: if Lambda not configured, use mailto
const LAMBDA_URL = null; // Set this when you deploy Lambda
