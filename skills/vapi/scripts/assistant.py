#!/usr/bin/env python3
"""
VAPI - Create AI Assistant for businesses
"""

import sys
import json
import os
import argparse
import urllib.request

def load_credentials():
    """Load VAPI credentials"""
    cred_path = os.path.expanduser("~/.openclaw/credentials/vapi.json")
    try:
        with open(cred_path, "r") as f:
            data = json.load(f)
            return data.get("vapi", {})
    except Exception as e:
        print(f"Error loading credentials: {e}", file=sys.stderr)
        return None

def create_assistant(name, business_type="general", custom_instructions=""):
    """Create an AI assistant"""
    creds = load_credentials()
    if not creds:
        print("Error: No VAPI credentials found", file=sys.stderr)
        sys.exit(1)
    
    private_key = creds.get("private_key")
    
    # Default instructions based on business type
    default_instructions = {
        "medspa": """You are a professional receptionist for a medical spa called {name}.
Your job is to:
1. Answer the phone warmly and professionally
2. Get the caller's name and phone number
3. Ask what they're calling about
4. If they're interested in services, take a detailed message
5. If it's urgent, notify the owner immediately
6. Thank them for calling

Never give medical advice. Just take messages and be helpful.""",
        "general": f"""You are a professional receptionist for {name}.
Your job is to:
1. Answer the phone warmly and professionally
2. Get the caller's name and phone number
3. Ask what they're calling about
4. Take a detailed message
5. Thank them for calling"""
    }
    
    instructions = custom_instructions or default_instructions.get(business_type, default_instructions["general"]).format(name=name)
    
    # Build request
    payload = {
        "name": name,
        "model": "gpt-4",
        "instructions": instructions,
        "voice": "male-1",  # Default voice
    }
    
    payload_json = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(
        "https://api.vapi.ai/assistant",
        data=payload_json,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {private_key}"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
            return data
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read().decode())
        print(f"Error: {e.code}", file=sys.stderr)
        print(json.dumps(error_body, indent=2), file=sys.stderr)
        sys.exit(1)

def list_assistants():
    """List all assistants"""
    creds = load_credentials()
    if not creds:
        print("Error: No VAPI credentials found", file=sys.stderr)
        sys.exit(1)
    
    private_key = creds.get("private_key")
    
    req = urllib.request.Request(
        "https://api.vapi.ai/assistant",
        headers={
            "Authorization": f"Bearer {private_key}"
        }
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
            return data
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read().decode())
        print(f"Error: {e.code}", file=sys.stderr)
        print(json.dumps(error_body, indent=2), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VAPI Assistant Management")
    parser.add_argument("--create", action="store_true", help="Create new assistant")
    parser.add_argument("--list", action="store_true", help="List assistants")
    parser.add_argument("--name", help="Business name")
    parser.add_argument("--type", choices=["medspa", "general"], default="general", help="Business type")
    parser.add_argument("--instructions", help="Custom instructions")
    
    args = parser.parse_args()
    
    if args.list:
        list_assistants()
    elif args.create:
        if not args.name:
            print("Error: --name required with --create", file=sys.stderr)
            sys.exit(1)
        create_assistant(args.name, args.type, args.instructions)
    else:
        parser.print_help()
