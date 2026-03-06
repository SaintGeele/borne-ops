#!/usr/bin/env python3
"""
Local Business Cold Call Outreach
VAPI AI assistant to call local businesses and pitch website/GMB services
"""

import json
import os
import argparse

# VAPI Assistant Configuration for Cold Outreach
OUTREACH_ASSISTANT = {
    "name": "Borne Systems Local Outreach",
    "model": "gpt-4",
    "voice": "emma",
    
    # System instructions for the outreach call
    "instructions": """You are calling from Borne Systems, a local web design and digital marketing company.

Your goal is to:
1. Introduce yourself and the company briefly (10 seconds max)
2. Ask if they have a website for their business
3. If they don't have one or it's outdated, offer to help
4. If they have one, mention Google Business Profile optimization
5. Get their email to send more info or schedule a call
6. If not interested, thank them politely and end

Key points:
- Keep it SHORT - under 2 minutes
- Be friendly and professional
- Don't be pushy
- Offer VALUE first (free website audit or GMB claim)

Pitch:
"Hi, this is [name] from Borne Systems. We're a local web design company helping small businesses in [area] get more customers online. I wanted to ask - do you have a website for your business?"

If yes: "Great! And is it helping you get new customers? We also help businesses show up on Google Maps for free - would that be helpful?"

If no: "We actually help businesses like yours get found online. Would you be open to a quick 5-minute call where I can show you some options at no cost?"

Always end with: "Thanks so much for your time! We'll be in touch." """,

    # First message when call connects
    "first_message": "Hi, this is calling from Borne Systems, a local web design company. How are you doing today?",
    
    # End call after this many minutes
    "max_duration": 2,
}

# Business types to target
TARGET_INDUSTRIES = [
    "restaurant",
    "auto repair", 
    "hvac",
    "plumber",
    "salon",
    "barber",
    "pet grooming",
    "home cleaning",
    "landscaping",
    "medical practice",
    "law firm",
    "accountant",
    "realtor",
]

# Local areas to target (can customize)
AREAS = [
    "Milford, CT",
    "New Haven, CT",
    "Bridgeport, CT",
    "Stamford, CT",
    "Hartford, CT",
    "White Plains, NY",
    "Jersey City, NJ",
    "Boston, MA",
]

def create_outreach_assistant():
    """Create VAPI assistant for local outreach"""
    # This would use VAPI API to create the assistant
    # For now, just print the config
    return OUTREACH_ASSISTANT

def generate_lead_list(area, industry):
    """Generate search queries to find leads"""
    queries = [
        f"{industry} near {area}",
        f"{industry} in {area} phone address",
        f"best {industry} {area}",
    ]
    return queries

def create_call_script(business_name, business_type, area):
    """Generate a personalized call script for a business"""
    script = f"""
Call Script for {business_name} ({business_type})

Introduction:
"Hi, this is calling from Borne Systems. We're a local web design company helping small businesses in {area} get more customers online."

Qualifying Questions:
1. "I wanted to ask - do you have a website for your business?"
2. "How is that working for you in terms of getting new customers?"

Value Pitch (if no website):
"We help businesses like yours get found online. We can build you a simple website starting at $500, or we can help you show up on Google Maps for free."

Appointment Setting:
"Would you have 10 minutes this week for a quick call where I can show you some options at no cost?"

Close:
"Thanks so much for your time! We'll be in touch."
"""
    return script

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local Business Outreach")
    parser.add_argument("--create-assistant", action="store_true", help="Create VAPI outreach assistant")
    parser.add_argument("--list-areas", action="store_true", help="List target areas")
    parser.add_argument("--list-industries", action="store_true", help="List target industries")
    parser.add_argument("--business", "-b", help="Business name")
    parser.add_argument("--type", "-t", help="Business type")
    parser.add_argument("--area", "-a", help="Local area")
    
    args = parser.parse_args()
    
    if args.create_assistant:
        assistant = create_outreach_assistant()
        print("VAPI Outreach Assistant Config:")
        print(json.dumps(assistant, indent=2))
        
    elif args.list_areas:
        print("Target Areas:")
        for area in AREAS:
            print(f"  - {area}")
            
    elif args.list_industries:
        print("Target Industries:")
        for ind in TARGET_INDUSTRIES:
            print(f"  - {ind}")
            
    elif args.business and args.area:
        script = create_call_script(args.business, args.type or "small business", args.area)
        print(script)
        
    else:
        print("Local Lead Generation System")
        print("Usage:")
        print("  --create-assistant    Create VAPI outreach assistant")
        print("  --list-areas          Show target areas")
        print("  --list-industries     Show target industries")
        print("  -b 'Business Name' -a 'City, ST'   Generate call script")