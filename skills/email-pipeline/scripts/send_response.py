#!/usr/bin/env python3
"""
Email Pipeline for Leads
Auto-respond based on lead score
"""

import sys
import json
import argparse
import os

TEMPLATES = {
    "hot": {
        "subject": "Quick call to discuss your AI needs",
        "body": """Hi {name},

Thanks for reaching out! I saw you're interested in AI automation for {company}.

I'd love to learn more about your specific needs. Are you available for a 15-min call this week?

Best,
Geele"""
    },
    "warm": {
        "subject": "Questions about your needs",
        "body": """Hi {name},

Thanks for your interest in Borne Systems! I have a few questions:

1. What's your current challenge with AI/automation?
2. What's your timeline?
3. Do you have a budget in mind?

Happy to help however I can.

Best,
Geele"""
    },
    "cool": {
        "subject": "Resources for getting started with AI",
        "body": """Hi {name},

Thanks for checking us out! Here are some resources that might help:

• Our Services: https://borne.ai
• Case Studies: [link]
• Blog: [link]

Let me know if you have questions.

Best,
Geele"""
    },
    "cold": {
        "subject": "Thanks for your interest",
        "body": """Hi {name},

Thanks for reaching out! We'll be in touch when we have openings for new clients.

Best,
Geele"""
    }
}

def get_template(score):
    """Get template based on score"""
    if score >= 80:
        return "hot"
    elif score >= 60:
        return "warm"
    elif score >= 40:
        return "cool"
    else:
        return "cold"

def format_email(name, company, score):
    """Format email with details"""
    template_key = get_template(score)
    template = TEMPLATES[template_key]
    
    body = template["body"].format(name=name, company=company)
    
    return {
        "to": "",  # Would be filled in
        "subject": template["subject"],
        "body": body,
        "template": template_key,
        "score": score
    }

def display_email(name, company, score):
    """Display email for review/copy"""
    email = format_email(name, company, score)
    
    print("=" * 60)
    print(f"TEMPLATE: {email['template'].upper()} (Score: {score})")
    print("=" * 60)
    print(f"\nSubject: {email['subject']}")
    print("\nBody:")
    print(email["body"])
    print("\n" + "=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Email Pipeline")
    parser.add_argument("--name", "-n", required=True, help="Lead name")
    parser.add_argument("--company", "-c", required=True, help="Company name")
    parser.add_argument("--score", "-s", type=int, default=50, help="Lead score")
    parser.add_argument("--template", "-t", choices=["hot", "warm", "cool", "cold"], help="Override template")
    parser.add_argument("--json", "-j", action="store_true", help="Output JSON")
    
    args = parser.parse_args()
    
    template_key = args.template if args.template else get_template(args.score)
    email = format_email(args.name, args.company, args.score)
    
    if args.json:
        print(json.dumps(email, indent=2))
    else:
        display_email(args.name, args.company, args.score)