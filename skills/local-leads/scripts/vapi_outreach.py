#!/usr/bin/env python3
"""
VAPI Outreach - Call businesses from our lead list
"""

import json
import csv
import os
import argparse

# Load leads from CSV
def load_leads(csv_file="leads/local-businesses.csv"):
    """Load leads from CSV file"""
    leads = []
    try:
        with open(csv_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                leads.append(row)
    except FileNotFoundError:
        # Try other paths
        for path in [
            "/home/saint/.openclaw/workspace/leads/local-businesses.csv",
            "leads/local-businesses.csv",
            "local-businesses.csv"
        ]:
            try:
                with open(path, 'r') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        leads.append(row)
                break
            except:
                continue
    
    return leads

def get_leads_to_call(leads):
    """Get leads without websites that need calling"""
    return [l for l in leads if l.get('Has Website', '').lower() == 'no']

def prepare_vapi_call(lead):
    """Prepare VAPI call parameters for a lead"""
    business_name = lead.get('Business Name', '')
    phone = lead.get('Phone', '')
    area = lead.get('Area', '')
    
    return {
        "business_name": business_name,
        "phone": phone,
        "area": area,
        "script": generate_script(business_name, area)
    }

def generate_script(business_name, area):
    """Generate personalized call script"""
    script = f"""Hi, this is calling from Borne Systems, a local web design company helping small businesses in {area} get more customers online.

I wanted to ask - do you have a website for your business?

(If yes) Great! And is it helping you get new customers? We also help businesses show up on Google Maps for free.

(If no) We help businesses like yours get found online. Would you be open to a quick 5-minute call where I can show you some free options?

Thanks for your time!"""
    return script

def generate_call_batch(leads, output_file="vapi-calls.json"):
    """Generate a batch of calls for VAPI"""
    calls = []
    
    for lead in leads:
        call = prepare_vapi_call(lead)
        if call['phone']:
            calls.append(call)
    
    with open(output_file, 'w') as f:
        json.dump(calls, f, indent=2)
    
    print(f"✓ Generated {len(calls)} calls")
    return calls

def list_leads():
    """List all leads"""
    leads = load_leads()
    print(f"\nTotal leads: {len(leads)}")
    
    no_website = get_leads_to_call(leads)
    print(f"Need websites: {len(no_website)}")
    
    if no_website:
        print("\n=== Leads to Call ===")
        for i, lead in enumerate(no_website[:10], 1):
            print(f"{i}. {lead.get('Business Name', 'Unknown')}")
            print(f"   Phone: {lead.get('Phone', 'N/A')}")
            print(f"   Area: {lead.get('Area', 'N/A')}")
            print()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VAPI Outreach")
    parser.add_argument("--list", "-l", action="store_true", help="List all leads")
    parser.add_argument("--to-call", "-c", action="store_true", help="Show leads to call")
    parser.add_argument("--batch", "-b", action="store_true", help="Generate VAPI call batch")
    parser.add_argument("--csv", "-f", default="leads/local-businesses.csv", help="CSV file")
    
    args = parser.parse_args()
    
    if args.list or args.to_call:
        leads = load_leads(args.csv)
        get_leads_to_call(leads)
        list_leads()
    elif args.batch:
        leads = load_leads(args.csv)
        to_call = get_leads_to_call(leads)
        generate_call_batch(to_call)
    else:
        print("Local Lead Management")
        print("-l, --list     List all leads")
        print("-c, --to-call  Show leads to call")
        print("-b, --batch    Generate VAPI call batch")