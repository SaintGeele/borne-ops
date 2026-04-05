#!/usr/bin/env python3
"""
LocalBoost — Free SEO Audit Tool
Uses free APIs: Google PageSpeed, SSL check, header analysis
Generates a client-ready audit report
"""

import sys
import json
import urllib.request
import urllib.parse
import ssl
import socket
from datetime import datetime

def check_ssl(domain):
    """Check SSL certificate validity"""
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(10)
            s.connect((domain, 443))
            cert = s.getpeercert()
            expiry = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
            days_left = (expiry - datetime.now()).days
            return {"valid": True, "expires": cert['notAfter'], "days_left": days_left, "issuer": dict(x[0] for x in cert['issuer'])}
    except Exception as e:
        return {"valid": False, "error": str(e)}

def check_headers(url):
    """Check security headers"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'LocalBoost-SEO-Audit/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            headers = dict(resp.headers)
            security_headers = {
                'X-Content-Type-Options': headers.get('X-Content-Type-Options', '❌ Missing'),
                'X-Frame-Options': headers.get('X-Frame-Options', '❌ Missing'),
                'Strict-Transport-Security': headers.get('Strict-Transport-Security', '❌ Missing'),
                'Content-Security-Policy': '✅ Present' if 'Content-Security-Policy' in headers else '❌ Missing',
                'X-XSS-Protection': headers.get('X-XSS-Protection', '❌ Missing'),
            }
            return {"status": resp.status, "headers": security_headers, "server": headers.get('Server', 'Unknown')}
    except Exception as e:
        return {"error": str(e)}

def check_pagespeed(url):
    """Check Google PageSpeed Insights (free API, no key needed for basic)"""
    try:
        encoded = urllib.parse.quote(url, safe='')
        api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={encoded}&strategy=mobile"
        req = urllib.request.Request(api_url, headers={'User-Agent': 'LocalBoost/1.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
            lh = data.get('lighthouseResult', {})
            cats = lh.get('categories', {})
            audits = lh.get('audits', {})
            return {
                "performance": int(cats.get('performance', {}).get('score', 0) * 100),
                "seo": int(cats.get('seo', {}).get('score', 0) * 100),
                "accessibility": int(cats.get('accessibility', {}).get('score', 0) * 100),
                "best_practices": int(cats.get('best-practices', {}).get('score', 0) * 100),
                "fcp": audits.get('first-contentful-paint', {}).get('displayValue', 'N/A'),
                "lcp": audits.get('largest-contentful-paint', {}).get('displayValue', 'N/A'),
                "cls": audits.get('cumulative-layout-shift', {}).get('displayValue', 'N/A'),
                "speed_index": audits.get('speed-index', {}).get('displayValue', 'N/A'),
            }
    except Exception as e:
        return {"error": str(e)}

def check_mobile(url):
    """Check mobile friendliness via viewport and responsive hints"""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')[:10000]
            has_viewport = 'viewport' in html.lower()
            has_responsive = 'responsive' in html.lower() or '@media' in html.lower()
            return {"has_viewport": has_viewport, "responsive_hints": has_responsive}
    except Exception as e:
        return {"error": str(e)}

def generate_report(domain):
    """Generate full SEO audit report"""
    url = f"https://{domain}" if not domain.startswith('http') else domain
    domain_clean = domain.replace('https://', '').replace('http://', '').split('/')[0]

    print(f"\n{'='*60}")
    print(f"  LOCALBOOST SEO AUDIT — {domain_clean.upper()}")
    print(f"  Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
    print(f"  Powered by Borne Systems")
    print(f"{'='*60}\n")

    # SSL Check
    print("🔒 SSL CERTIFICATE")
    print("-" * 40)
    ssl_result = check_ssl(domain_clean)
    if ssl_result.get('valid'):
        status = "✅ PASS" if ssl_result['days_left'] > 30 else "⚠️ EXPIRING SOON"
        print(f"  Status: {status}")
        print(f"  Expires: {ssl_result['expires']} ({ssl_result['days_left']} days)")
    else:
        print(f"  Status: ❌ FAIL — {ssl_result.get('error', 'Unknown')}")
    print()

    # Security Headers
    print("🛡️ SECURITY HEADERS")
    print("-" * 40)
    header_result = check_headers(url)
    if 'headers' in header_result:
        for header, value in header_result['headers'].items():
            print(f"  {header}: {value}")
        score = sum(1 for v in header_result['headers'].values() if '✅' in str(v) or '❌' not in str(v))
        print(f"\n  Score: {score}/5 headers configured")
    else:
        print(f"  Error: {header_result.get('error', 'Unknown')}")
    print()

    # PageSpeed
    print("⚡ PAGESPEED (Mobile)")
    print("-" * 40)
    ps_result = check_pagespeed(url)
    if 'performance' in ps_result:
        for key, value in ps_result.items():
            label = key.replace('_', ' ').title()
            if isinstance(value, int):
                emoji = "✅" if value >= 90 else "⚠️" if value >= 50 else "❌"
                print(f"  {emoji} {label}: {value}/100")
            else:
                print(f"  {label}: {value}")
    else:
        print(f"  Error: {ps_result.get('error', 'Unknown')}")
    print()

    # Mobile Check
    print("📱 MOBILE FRIENDLINESS")
    print("-" * 40)
    mobile_result = check_mobile(url)
    if 'has_viewport' in mobile_result:
        vp = "✅ Yes" if mobile_result['has_viewport'] else "❌ No"
        rsp = "✅ Yes" if mobile_result['responsive_hints'] else "⚠️ Not detected"
        print(f"  Viewport meta tag: {vp}")
        print(f"  Responsive design: {rsp}")
    else:
        print(f"  Error: {mobile_result.get('error', 'Unknown')}")
    print()

    print(f"{'='*60}")
    print(f"  RECOMMENDATIONS")
    print(f"{'='*60}")
    print(f"  1. Optimize page speed (target 90+ on mobile)")
    print(f"  2. Add missing security headers")
    print(f"  3. Ensure all pages have proper meta descriptions")
    print(f"  4. Verify Google Business Profile is claimed & optimized")
    print(f"  5. Build consistent citations (NAP) across directories")
    print(f"\n  📞 Want help fixing these? Contact Borne Systems")
    print(f"  📧 geele@bornesystems.com | bornesystems.com\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 seo-audit.py <domain>")
        print("Example: python3 seo-audit.py carsonaesthetics.com")
        sys.exit(1)
    generate_report(sys.argv[1])
