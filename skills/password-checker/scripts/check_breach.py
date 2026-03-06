#!/usr/bin/env python3
"""
Password/Breach Checker
Check if emails have been in data breaches using HaveIBeenPwned API
"""

import sys
import json
import os
import argparse
import urllib.request
import urllib.parse

def check_breach(email):
    """Check if email has been in breaches"""
    
    url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{urllib.parse.quote(email)}"
    
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "BorneSecurity-PasswordChecker")
    req.add_header("hibp-api-key", "")  # Free tier - no API key needed for search
    
    try:
        # Try without API key (limited)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode())
            return {"found": True, "breaches": data}
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"found": False, "breaches": []}
        elif e.code == 429:
            return {"error": "Rate limited - try again later"}
        else:
            return {"error": f"HTTP {e.code}"}
    except Exception as e:
        return {"error": str(e)}

def format_output(email, result):
    """Format breach check output"""
    
    output = []
    output.append("=" * 50)
    output.append(f"BREACH CHECK: {email}")
    output.append("=" * 50)
    
    if "error" in result:
        output.append(f"\n❌ Error: {result['error']}")
        return "\n".join(output)
    
    if result["found"]:
        output.append("\n⚠️ FOUND IN BREACHES")
        output.append("\nBreaches:")
        for breach in result["breaches"]:
            name = breach.get("Name", "Unknown")
            date = breach.get("BreachDate", "Unknown date")
            desc = breach.get("Description", "")[:100]
            output.append(f"  • {name} ({date})")
            output.append(f"    {desc}...")
    else:
        output.append("\n✅ No breaches found")
    
    output.append("\n" + "=" * 50)
    output.append("RECOMMENDATIONS")
    output.append("=" * 50)
    
    if result["found"]:
        output.append("• Change password immediately")
        output.append("• Enable 2FA")
        output.append("• Use password manager")
        output.append("• Check other accounts using this email")
    else:
        output.append("• Continue good security practices")
        output.append("• Enable 2FA where available")
    
    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Breach Checker")
    parser.add_argument("email", help="Email address to check")
    parser.add_argument("--raw", "-r", action="store_true", help="Raw JSON output")
    
    args = parser.parse_args()
    
    result = check_breach(args.email)
    
    if args.raw:
        print(json.dumps(result, indent=2))
    else:
        print(format_output(args.email, result))
