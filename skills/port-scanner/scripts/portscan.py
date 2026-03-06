#!/usr/bin/env python3
"""
Port Scanner
Simple port scanner for basic network reconnaissance
"""

import sys
import json
import argparse
import socket
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

COMMON_PORTS = {
    21: ("FTP", "High - unencrypted file transfer"),
    22: ("SSH", "Medium - secure shell"),
    23: ("Telnet", "Critical - unencrypted"),
    25: ("SMTP", "Low - email"),
    53: ("DNS", "Medium"),
    80: ("HTTP", "Medium - unencrypted web"),
    110: ("POP3", "Medium - email"),
    143: ("IMAP", "Medium - email"),
    443: ("HTTPS", "Low - encrypted web"),
    445: ("SMB", "High - file sharing"),
    993: ("IMAPS", "Low - encrypted email"),
    995: ("POP3S", "Low - encrypted email"),
    3306: ("MySQL", "High - database"),
    3389: ("RDP", "High - remote desktop"),
    5432: ("PostgreSQL", "High - database"),
    5900: ("VNC", "High - remote desktop"),
    8080: ("HTTP-Proxy", "Medium - alt web"),
    8443: ("HTTPS-Alt", "Low - alt web"),
}

QUICK_PORTS = [21, 22, 23, 80, 443, 3389, 3306, 8080]

def scan_port(host, port, timeout=3):
    """Scan a single port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

def get_ip(host):
    """Resolve hostname to IP"""
    try:
        return socket.gethostbyname(host)
    except:
        return None

def format_output(host, open_ports, closed_ports, scan_time):
    """Format scan results"""
    output = []
    output.append("=" * 60)
    output.append(f"PORT SCAN: {host}")
    output.append("=" * 60)
    
    if open_ports:
        output.append("\n### OPEN PORTS")
        for port in open_ports:
            info = COMMON_PORTS.get(port, ("Unknown", ""))
            risk = info[1] if len(info) > 1 else ""
            output.append(f"  ✅ {port} ({info[0]}) - {risk}")
    else:
        output.append("\n### No common ports open")
    
    output.append(f"\nScan completed in {scan_time:.2f} seconds")
    
    return "\n".join(output)

def main():
    parser = argparse.ArgumentParser(description="Port Scanner")
    parser.add_argument("target", help="Target host or IP")
    parser.add_argument("--full", "-f", action="store_true", help="Full scan (all common ports)")
    parser.add_argument("--quick", "-q", action="store_true", help="Quick scan (default)")
    parser.add_argument("--ports", "-p", help="Comma-separated ports to scan")
    
    args = parser.parse_args()
    
    # Get IP
    ip = get_ip(args.target)
    if not ip:
        print(f"Error: Could not resolve {args.target}")
        sys.exit(1)
    
    print(f"Scanning {args.target} ({ip})...")
    
    # Determine ports to scan
    if args.ports:
        ports = [int(p.strip()) for p in args.ports.split(",")]
    elif args.full:
        ports = list(COMMON_PORTS.keys())
    else:
        ports = QUICK_PORTS
    
    # Scan
    start_time = time.time()
    open_ports = []
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(scan_port, ip, port): port for port in ports}
        for future in as_completed(futures):
            port = futures[future]
            try:
                if future.result():
                    open_ports.append(port)
                    print(f"  ✅ Port {port} open")
            except:
                pass
    
    scan_time = time.time() - start_time
    
    # Output
    print(format_output(args.target, open_ports, [], scan_time))

if __name__ == "__main__":
    main()