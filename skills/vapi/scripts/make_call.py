#!/usr/bin/env python3
"""
VAPI - Make outbound calls
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

def create_call(to_number, assistant_id=None, message=None):
    """Create an outbound call"""
    creds = load_credentials()
    if not creds:
        print("Error: No VAPI credentials found", file=sys.stderr)
        sys.exit(1)
    
    private_key = creds.get("private_key")
    public_key = creds.get("public_key")
    
    # Build request
    payload = {
        "assistant_id": assistant_id if assistant_id else "default",
        "phone_number": to_number,
    }
    
    if message:
        payload["message"] = message
    
    payload_json = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(
        "https://api.vapi.ai/call/phone",
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VAPI Make Call")
    parser.add_argument("--to", required=True, help="Phone number to call")
    parser.add_argument("--assistant", help="Assistant ID")
    parser.add_argument("--message", help="Message for outbound call")
    
    args = parser.parse_args()
    
    create_call(args.to, args.assistant, args.message)
