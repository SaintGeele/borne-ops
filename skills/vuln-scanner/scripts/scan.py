#!/usr/bin/env python3
"""
Website Vulnerability Scanner
Scan websites for basic security issues
"""

import sys
import json
import os
import argparse
import urllib.request
import urllib.parse
import ssl
import socket
from urllib.parse import urlparse

def normalize_url(url):
    """Normalize URL"""
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    return url

def check_ssl(domain):
    """Check SSL certificate"""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                return {"valid": True, "issuer": cert.get("issuer", "Unknown")}
    except Exception as e:
        return {"valid": False, "error": str(e)}

def check_headers(url):
    """Check security headers"""
    try:
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "BorneSecurity-Scanner/1.0")
        
        with urllib.request.urlopen(req, timeout=15) as response:
            headers = dict(response.headers)
            
            checks = {
                "Strict-Transport-Security": "HSTS" in headers,
                "Content-Security-Policy": "Content-Security-Policy" in headers,
                "X-Frame-Options": "X-Frame-Options" in headers,
                "X-Content-Type-Options": "X-Content-Type-Options" in headers,
                "X-XSS-Protection": "X-XSS-Protection" in headers,
                "Referrer-Policy": "Referrer-Policy" in headers,
            }
            
            return {"headers": headers, "checks": checks}
    except Exception as e:
        return {"error": str(e)}

def scan_website(url):
    """Full website scan"""
    url = normalize_url(url)
    parsed = urlparse(url)
    domain = parsed.netloc
    
    results = {
        "url": url,
        "domain": domain,
        "ssl": check_ssl(domain),
        "headers": check_headers(url)
    }
    
    return results

def format_output(results):
    """Format scan results"""
    output = []
    output.append("=" * 60)
    output.append(f" SECURITY SCAN: {results['domain']}")
    output.append("=" * 60)
    
    # SSL
    output.append("\n### SSL/TLS")
    ssl = results.get("ssl", {})
    if ssl.get("valid"):
        output.append("✅ SSL: Certificate valid")
    else:
        output.append(f"❌ SSL: {ssl.get('error', 'Invalid')}")
    
    # Headers
    output.append("\n### Security Headers")
    headers = results.get("headers", {})
    checks = headers.get("checks", {})
    
    score = 0
    total = len(checks)
    
    for header, present in checks.items():
        if present:
            output.append(f"✅ {header}: Present")
            score += 1
        else:
            output.append(f"⚠️ {header}: Not set")
    
    # Final score
    final_score = int((score / total) * 10) if total > 0 else 0
    output.append("\n" + "=" * 60)
    output.append(f"SECURITY SCORE: {final_score}/10")
    output.append("=" * 60)
    
    # Recommendations
    output.append("\n### Recommendations")
    missing = [h for h, p in checks.items() if not p]
    if missing:
        for m in missing:
            output.append(f"• Add {m} header")
    else:
        output.append("✅ Good security headers")
    
    return "\n".join(output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Website Vulnerability Scanner")
    parser.add_argument("website", help="Website to scan")
    parser.add_argument("--quick", "-q", action="store_true", help="Quick scan (headers only)")
    parser.add_argument("--raw", "-r", action="store_true", help="Raw JSON output")
    
    args = parser.parse_args()
    
    results = scan_website(args.website)
    
    if args.raw:
        print(json.dumps(results, indent=2))
    else:
        print(format_output(results))
