#!/usr/bin/env python3
"""
Cover Letter Generator
Generates tailored cover letters based on job postings
"""

import sys

def generate_cover_letter(company_name, job_title, resume_type='devops'):
    """Generate a cover letter template"""
    
    if resume_type.lower() in ['security', 'penetrat', 'oscp']:
        focus = "penetration testing and offensive security"
        experience = "conducting comprehensive penetration tests across web applications, networks, cloud environments, and endpoints"
        skills = "vulnerability assessment,OWASP Top 10, Metasploit, Burp Suite, Nmap, and various security tools"
    else:
        focus = "DevOps and cloud engineering"
        experience = "designing, deploying, and managing cloud infrastructure and automation"
        skills = "AWS, Azure, Terraform, Ansible, Docker, Kubernetes, and CI/CD pipelines"
    
    letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company_name}. As a Marine Corps veteran with over 10 years of IT experience {focus}, I am confident that my skills and dedication would make me a valuable addition to your team.

In my current role, I have experience {experience}. I have worked with {skills}, delivering results that improve efficiency, security, and reliability.

My background includes:
- Strong technical skills in cloud platforms (AWS, Azure) and infrastructure automation
- Experience with security assessments and vulnerability management
- A proven track record of automating processes to improve efficiency
- Excellent communication skills with the ability to explain technical concepts to non-technical stakeholders
- A commitment to continuous learning and professional growth

I am particularly drawn to {company_name} because of your commitment to innovation and excellence in the field. I am eager to contribute my skills to your team and help drive your mission forward.

Thank you for considering my application. I would welcome the opportunity to discuss how my background and skills would benefit your organization.

Best regards,
Geoffrey Evans
geele.evans@gmail.com
203-522-3029
linkedin.com/in/geele-evans
"""
    return letter

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python cover_letter.py <company_name> <job_title> [devops|security]")
        sys.exit(1)
    
    company = sys.argv[1]
    title = ' '.join(sys.argv[2:])
    resume_type = sys.argv[3] if len(sys.argv) > 3 else 'devops'
    
    print(generate_cover_letter(company, title, resume_type))
