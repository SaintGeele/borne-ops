#!/usr/bin/env python3
"""
Lead Capture Widget Generator
Creates embeddable lead capture forms for clients
"""

import sys
import json
import os
import argparse

DEFAULT_HTML = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us</title>
  <style>
    .borne-lead-form {max-width: 400px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}
    .borne-lead-form h3 {text-align: center; margin-bottom: 20px; color: #333;}
    .borne-lead-form input, .borne-lead-form textarea, .borne-lead-form select {width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box;}
    .borne-lead-form button {width: 100%; padding: 14px; BACKGROUND: COLOR_PLACEHOLDER; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s;}
    .borne-lead-form button:hover {background: HOVER_PLACEHOLDER;}
    .borne-lead-form .honeypot {display: none;}
    .borne-lead-form .success {display: none; padding: 20px; background: #d4edda; border-radius: 8px; color: #155724; text-align: center;}
    .borne-lead-form .error {display: none; padding: 15px; background: #f8d7da; border-radius: 8px; color: #721c24; margin-bottom: 15px;}
  </style>
</head>
<body>
  <div class="borne-lead-form">
    <h3>TITLE_PLACEHOLDER</h3>
    <div class="error" id="error"></div>
    <div class="success" id="success">Thanks! We'll be in touch soon.</div>
    <form id="leadForm">
      <input type="text" name="name" placeholder="Your Name *" required>
      <input type="email" name="email" placeholder="Email Address *" required>
      <input type="tel" name="phone" placeholder="Phone Number">
      <input type="text" name="company" placeholder="Company Name">
      <select name="service">
        <option value="">What can we help with?</option>
        <option value="ai-receptionist">AI Receptionist</option>
        <option value="lead-automation">Lead Automation</option>
        <option value="security">Security Services</option>
        <option value="full-stack">Full Stack</option>
        <option value="other">Other</option>
      </select>
      <textarea name="message" rows="4" placeholder="How can we help you?"></textarea>
      <input type="text" name="website" class="honeypot" tabindex="-1" autocomplete="off">
      <button type="submit">BUTTON_PLACEHOLDER</button>
    </form>
  </div>
  <script>
    document.getElementById('leadForm').addEventListener('submit', async function(e) {{
      e.preventDefault();
      const form = e.target;
      const errorEl = document.getElementById('error');
      const successEl = document.getElementById('success');
      const submitBtn = form.querySelector('button');
      if (form.website.value) {{ errorEl.textContent = 'Error'; errorEl.style.display = 'block'; return; }}
      submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
      const formData = {{name: form.name.value, email: form.email.value, phone: form.phone.value, company: form.company.value, service: form.service.value, message: form.message.value, business: 'BUSINESS_PLACEHOLDER', source: 'SOURCE_PLACEHOLDER'}};
      try {{
        const response = await fetch('WEBHOOK_PLACEHOLDER', {{method: 'POST', headers: {{'Content-Type': 'application/json'}}, body: JSON.stringify(formData)}});
        if (response.ok) {{ form.style.display = 'none'; successEl.style.display = 'block'; }} else {{ throw new Error('Failed'); }}
      }} catch (err) {{ errorEl.textContent = 'Please try again.'; errorEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.textContent = 'BUTTON_PLACEHOLDER'; }}
    }});
  </script>
</body>
</html>'''

def generate_widget(business_name, source_url="", primary_color="#667eea", 
                    form_title="Get In Touch", button_text="Send Message", 
                    webhook_url="", output_file=""):
    """Generate a lead capture widget"""
    
    if not webhook_url:
        webhook_url = "YOUR_WEBHOOK_URL"
    
    hover_color = primary_color + "dd" if len(primary_color) == 7 else "#5568d3"
    
    html = DEFAULT_HTML
    html = html.replace("COLOR_PLACEHOLDER", primary_color)
    html = html.replace("HOVER_PLACEHOLDER", hover_color)
    html = html.replace("TITLE_PLACEHOLDER", form_title)
    html = html.replace("BUTTON_PLACEHOLDER", button_text)
    html = html.replace("BUSINESS_PLACEHOLDER", business_name)
    html = html.replace("SOURCE_PLACEHOLDER", source_url or f"https://{business_name.lower().replace(' ', '')}.com")
    html = html.replace("WEBHOOK_PLACEHOLDER", webhook_url)
    
    if output_file:
        with open(output_file, 'w') as f:
            f.write(html)
        print(f"Widget saved to: {output_file}")
        return output_file
    else:
        filename = f"{business_name.lower().replace(' ', '-')}-lead-form.html"
        with open(filename, 'w') as f:
            f.write(html)
        print(f"Widget saved to: {filename}")
        return filename

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lead Capture Widget Generator")
    parser.add_argument("business", help="Business name")
    parser.add_argument("--url", "-u", default="", help="Business URL")
    parser.add_argument("--color", "-c", default="#667eea", help="Primary color")
    parser.add_argument("--title", "-t", default="Get In Touch", help="Form title")
    parser.add_argument("--button", "-b", default="Send Message", help="Button text")
    parser.add_argument("--webhook", "-w", help="Webhook URL")
    parser.add_argument("--output", "-o", help="Output file")
    
    args = parser.parse_args()
    generate_widget(args.business, args.url, args.color, args.title, args.button, args.webhook, args.output)