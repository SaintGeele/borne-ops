#!/usr/bin/env python3
"""
VAPI Cold Call Setup
Create personalized assistants for each business
"""

import json
import os
import argparse
import urllib.request

VAPI_KEY = os.getenv("VAPI_API_KEY", "")

def create_assistant(name, business_type="general", industry="", area=""):
    """Create a VAPI assistant for cold outreach"""
    
    # Custom instructions based on business type
    instructions = f"""You are calling from Borne Systems, a local web design and digital marketing company helping small businesses in {area or 'your area'} get more customers online.

Your goal is to:
1. Introduce yourself briefly (10 seconds)
2. Ask if they have a website
3. If no/outdated, offer help
4. If yes, mention Google Business Profile
5. Get email for more info or schedule call
6. Be friendly, not pushy - under 2 minutes total

Key points:
- Keep it SHORT
- Be professional
- Offer VALUE first

Introduction: "Hi, this is calling from Borne Systems. We're a local company helping businesses get more customers online. How are you today?"

If they ask what we do: "We build websites and help businesses show up on Google Maps - at no cost for the basics."

Always end with: "Thanks so much for your time! We'll be in touch." """
    
    payload = {
        "name": name,
        "model": "gpt-4",
        "voice": "emma-azure"
    }
    
    req = urllib.request.Request(
        "https://api.vapi.ai/assistant",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {VAPI_KEY}"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            print(f"✓ Created assistant: {data['id']}")
            return data
    except Exception as e:
        print(f"Error: {e}")
        return None

def make_call(assistant_id, phone_number):
    """Make a call using an assistant"""
    
    payload = {
        "assistantId": assistant_id,
        "phoneNumber": phone_number
    }
    
    req = urllib.request.Request(
        "https://api.vapi.ai/call",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {VAPI_KEY}"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            print(f"✓ Call initiated: {data.get('id', 'started')}")
            return data
    except Exception as e:
        print(f"Error: {e}")
        return None

def list_assistants():
    """List all assistants"""
    req = urllib.request.Request(
        "https://api.vapi.ai/assistant",
        headers={"Authorization": f"Bearer {VAPI_KEY}"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            print(f"\n=== Assistants ({len(data)}) ===\n")
            for a in data:
                print(f"  • {a['name']} ({a['id']})")
            return data
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VAPI Cold Call")
    parser.add_argument("--create", "-c", help="Create assistant for business")
    parser.add_argument("--call", help="Make call with assistant ID")
    parser.add_argument("--phone", "-p", help="Phone number to call")
    parser.add_argument("--list", "-l", action="store_true", help="List assistants")
    parser.add_argument("--industry", "-i", default="general", help="Business type")
    parser.add_argument("--area", "-a", default="Connecticut", help="Area")
    
    args = parser.parse_args()
    
    if args.list:
        list_assistants()
    elif args.create:
        create_assistant(args.create, args.industry, "", args.area)
    elif args.call and args.phone:
        make_call(args.call, args.phone)
    else:
        print("VAPI Cold Call")
        print("-c, --create 'Business Name'  Create assistant")
        print("-l, --list                    List assistants")
        print("-call ID -p +1234567890      Make call")