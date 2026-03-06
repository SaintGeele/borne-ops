#!/usr/bin/env python3
"""
Client Onboarding Automation
"""

import sys
import json
import os
import argparse
from datetime import datetime

CLIENTS_FILE = os.path.expanduser("~/.openclaw/borne-clients.json")

def load_clients():
    if os.path.exists(CLIENTS_FILE):
        with open(CLIENTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_clients(clients):
    with open(CLIENTS_FILE, 'w') as f:
        json.dump(clients, f, indent=2)

def generate_onboarding_checklist(client_name, service, email):
    """Generate onboarding checklist"""
    
    checklist = f"""
🚀 CLIENT ONBOARDING: {client_name}
==========================================
Service: {service}
Email: {email}
Started: {datetime.now().strftime('%Y-%m-%d')}

TASK CHECKLIST:
===============

□ WELCOME (Day 0)
  □ Send welcome email
  □ Send service agreement
  □ Send pricing summary
  □ Add to CRM

□ SETUP (Days 1-2)
  □ Collect access credentials
  □ Set up VAPI account
  □ Configure AI receptionist
  □ Test functionality
  □ Connect to existing systems

□ KICKOFF (Day 3)
  □ Schedule kickoff call
  □ Review goals and timeline
  □ Set expectations
  □ Document requirements

□ DELIVERY (Days 4-7)
  □ Complete initial setup
  □ Provide login credentials
  □ Run training session
  □ Document process

□ FOLLOW-UP (Day 14)
  □ Check in with client
  □ Gather feedback
  □ Address issues
  □ Request testimonial

NOTES:
------
"""

    return checklist

def onboard_client(client_name, service, email, phone=""):
    """Onboard a new client"""
    
    clients = load_clients()
    
    # Check if client exists
    for c in clients:
        if c['name'].lower() == client_name.lower():
            print(f"Client {client_name} already exists!")
            return
    
    # Create new client
    client = {
        "id": len(clients) + 1,
        "name": client_name,
        "email": email,
        "phone": phone,
        "service": service,
        "status": "Onboarding",
        "started": datetime.now().strftime("%Y-%m-%d"),
        "tasks": [
            {"task": "Welcome email sent", "done": False},
            {"task": "Service agreement sent", "done": False},
            {"task": "Access credentials collected", "done": False},
            {"task": "VAPI configured", "done": False},
            {"task": "Kickoff scheduled", "done": False},
            {"task": "Setup complete", "done": False},
        ]
    }
    
    clients.append(client)
    save_clients(clients)
    
    # Generate checklist
    checklist = generate_onboarding_checklist(client_name, service, email)
    
    print(f"\n✓ Client {client_name} added to onboarding!")
    print(checklist)
    
    return client

def list_clients():
    """List all clients"""
    clients = load_clients()
    
    if not clients:
        print("No clients yet")
        return
    
    print("\n=== CLIENTS ===")
    for c in clients:
        print(f"\n{c['name']} ({c['service']})")
        print(f"  Status: {c['status']}")
        print(f"  Started: {c['started']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Client Onboarding")
    parser.add_argument("--add", "-a", help="Add new client")
    parser.add_argument("--service", "-s", help="Service name")
    parser.add_argument("--email", "-e", help="Client email")
    parser.add_argument("--phone", "-p", help="Client phone")
    parser.add_argument("--list", "-l", action="store_true", help="List clients")
    
    args = parser.parse_args()
    
    if args.list:
        list_clients()
    elif args.add:
        if not args.service or not args.email:
            print("Error: --service and --email required")
            sys.exit(1)
        onboard_client(args.add, args.service, args.email, args.phone or "")
    else:
        print("Client Onboarding")
        print("-a, --add 'Client Name' --service 'AI Receptionist' --email 'email@...'")
        print("-l, --list                          List all clients")