#!/usr/bin/env python3
"""
Resume Tailoring Tool
Takes a job posting and tailors the resume to match keywords and requirements
"""

import sys
import re

# Resume templates
DEVOPS_RESUME = """
GEOFFREY EVANS
geele.evans@gmail.com | 203-522-3029
LinkedIn: linkedin.com/in/geele-evans

SUMMARY
Marine Corps veteran and Infrastructure Engineer with 10+ years experience in cloud, DevOps, and systems administration. Skilled in AWS, Azure, Terraform, Ansible, and automation.

EXPERIENCE
Systems Engineer | Circulent | 04/2023 - Present
- Configure and manage Cisco network components, routers, switches, firewalls
- Design and deploy client IT infrastructure, servers, networks, storage
- Monitor network performance and troubleshoot issues
- Incorporate security defenses into cloud and on-premise systems
- Led cloud migration to AWS/Azure, improving efficiency 40%
- Automated deployments using Ansible and PowerShell
- Conduct regular security audits and vulnerability assessments

Owner/Systems Engineer | Borne Technologies | 12/2018 - Present
- Design and implement scalable IT infrastructure solutions
- Manage projects: system upgrades, migrations, implementations
- Support virtualization (VMware, Hyper-V)
- Provide technical support for Azure, Active Directory, GPOs
- Configure network infrastructure, switches, routers, firewalls

DevOps Engineer Intern | Intellectual Point | 09/2022 - 11/2022
- Built/managed Linux and Windows VMs (VirtualBox, VMware, Hyper-V)
- Deployed SIEM dashboards in Splunk
- Implemented CI/CD pipelines using AWS, Azure
- Infrastructure as Code using Terraform, Ansible

System Administrator | US Marine Corps | 06/2010 - 08/2018
- Monitored and resolved end-user issues
- Installed system upgrades, security patches (DoD standards)
- Windows Server 2012/2016 administration
- Active Directory, Terminal Services, filesharing
- Network security, encryption devices

SKILLS
AWS | Azure | GCP | Terraform | Ansible | Docker | Kubernetes
Linux | Windows Server | Active Directory | IAM
Networking | Firewall | VPN | TCP/IP | DNS | DHCP
Python | Bash | PowerShell | Git | Jenkins
Security | SIEM | Vulnerability Assessment

CERTIFICATIONS
AWS Solutions Architect Associate | CompTIA Security+ | CEH
Splunk Core User | TCM Linux 101
"""

SECURITY_RESUME = """
GEOFFREY EVANS
geele.evans@gmail.com | 203-522-3029
LinkedIn: linkedin.com/in/geele-evans

SUMMARY
Marine Corps veteran and penetration tester specializing in offensive security. Experienced in simulating attacks, finding vulnerabilities, and delivering actionable insights across cloud, network, and application environments.

EXPERIENCE
Penetration Tester | RightClick Professional Services | 02/2025 - Present
- Conduct comprehensive penetration tests across web apps, networks, cloud, endpoints
- Develop and execute custom attack scenarios to simulate real-world threats
- Deliver reports to technical and non-technical stakeholders
- Advise on remediation strategies and secure system design
- OWASP Top 10 methodologies

Penetration Tester | Circulent | 04/2023 - 02/2025
- Security testing and risk assessments on cloud and on-prem systems
- Automated vulnerability scanning, improving efficiency 40%
- Collaborated on implementing controls and closing audit gaps
- Deployed/managed virtualization and disaster recovery
- Monitored SIEM dashboards, threat analysis, incident response
- Trained users to reduce phishing risks

Owner/Security Analyst | Borne Technologies | 04/2023 - 02/2025
- Penetration testing, vulnerability management, consulting
- Advise on OWASP Top 10 risks and application security
- Deploy and tune SIEM, EDR, secure network architectures
- Provide remediation guidance and ongoing support

DevOps Engineer Intern | Intellectual Point | 09/2022 - 12/2022
- Built security dashboards and developed use cases in Splunk
- Implemented CI/CD pipelines (AWS, Azure)
- Infrastructure as Code (Terraform, Ansible)

System Administrator | US Marine Corps | 06/2010 - 08/2018
- Managed secure IT infrastructure, system hardening
- Monitored and resolved end-user/system issues
- Windows Server administration, DoD security standards
- Network security, incident investigation

SKILLS
Penetration Testing | Web App Testing | Network Testing
Metasploit | Burp Suite | Nmap | Nessus | Wireshark
Python | Bash | PowerShell
AWS | Azure | GCP | Cloud Security
OWASP Top 10 | Vulnerability Assessment
SIEM | EDR | Incident Response

CERTIFICATIONS
OSCP (expected) | CEH | CompTIA Security+
AWS Solutions Architect Associate | Splunk Core User
"""

def extract_keywords(job_text):
    """Extract key skills and requirements from job posting"""
    # Common tech keywords to look for
    keywords = [
        'aws', 'azure', 'gcp', 'terraform', 'ansible', 'docker', 'kubernetes',
        'linux', 'windows', 'active directory', ' networking', 'security',
        'python', 'bash', 'powershell', 'jenkins', 'ci/cd', 'devops',
        'penetration', 'vulnerability', 'oscp', 'ceh', 'siem', 'firewall',
        'cloud', ' vmware', 'hyper-v', 'scripting', 'automation'
    ]
    
    found = []
    job_lower = job_text.lower()
    for kw in keywords:
        if kw in job_lower:
            found.append(kw)
    return found

def tailor_resume(resume_type, keywords):
    """Tailor resume to focus on matching keywords"""
    # For now, just return the appropriate resume
    # In future, could highlight matching sections
    if 'security' in resume_type.lower() or 'penetrat' in resume_type.lower() or 'oscp' in resume_type.lower():
        return SECURITY_RESUME
    else:
        return DEVOPS_RESUME

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python tailor.py <devops|security>")
        sys.exit(1)
    
    resume_type = sys.argv[1]
    resume = tailor_resume(resume_type, [])
    print(resume)
