#!/usr/bin/env python3
"""
Borne Systems - Lightweight System Monitor
Runs in background, monitors client computer health
"""

import os
import sys
import time
import json
import logging
import psutil
import platform
from datetime import datetime
from pathlib import Path

# Config
CONFIG = {
    "interval": 300,  # 5 minutes between checks
    "log_file": os.path.expanduser("~/.system-healthd.log"),
    "endpoint": None,  # Optional: URL to send data
    "quiet": True
}

def setup_logging():
    """Silent logging to file"""
    logging.basicConfig(
        filename=CONFIG["log_file"],
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def get_system_info():
    """Gather system information"""
    try:
        return {
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
            "cpu_percent": psutil.cpu_percent(interval=1),
            "cpu_count": psutil.cpu_count(),
            "memory_percent": psutil.virtual_memory().percent,
            "memory_available": psutil.virtual_memory().available / (1024**3),  # GB
            "disk_percent": psutil.disk_usage('/').percent,
            "disk_free": psutil.disk_usage('/').free / (1024**3),  # GB
            "boot_time": datetime.fromtimestamp(psutil.boot_time()).isoformat(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logging.error(f"Error gathering system info: {e}")
        return {"error": str(e)}

def check_critical_services():
    """Check if critical services are running"""
    critical = ["ssh", "nginx", "apache2", "mysql", "docker"]
    stopped = []
    
    try:
        for service in psutil.service_iter():
            try:
                name = service.name()
                if any(c in name.lower() for c in critical):
                    if service.status() != psutil.STATUS_RUNNING:
                        stopped.append(name)
            except:
                pass
    except:
        pass  # May require root
    
    return stopped

def get_top_processes():
    """Get top 5 processes by CPU usage"""
    processes = []
    for p in psutil.process_iter(['name', 'cpu_percent', 'memory_percent']):
        try:
            processes.append({
                "name": p.info['name'],
                "cpu": p.info['cpu_percent'],
                "mem": p.info['memory_percent']
            })
        except:
            pass
    
    processes.sort(key=lambda x: x.get('cpu', 0), reverse=True)
    return processes[:5]

def check_network():
    """Check network connectivity"""
    connected = []
    for iface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == psutil.AF_INET:
                connected.append({"interface": iface, "ip": addr.address})
    return connected

def generate_report():
    """Generate health report"""
    info = get_system_info()
    if "error" in info:
        return info
    
    # Add extras
    info["top_processes"] = get_top_processes()
    info["network_interfaces"] = check_network()
    info["critical_services"] = check_critical_services()
    
    # Health status
    health = "OK"
    warnings = []
    
    if info["cpu_percent"] > 90:
        health = "WARNING"
        warnings.append("High CPU usage")
    if info["memory_percent"] > 90:
        health = "WARNING"
        warnings.append("High memory usage")
    if info["disk_percent"] > 90:
        health = "CRITICAL"
        warnings.append("Disk space low")
    
    info["health"] = health
    info["warnings"] = warnings
    
    return info

def run_daemon():
    """Run as background daemon"""
    setup_logging()
    logging.info("Borne System Monitor started")
    
    print(f"Borne Monitor running ( PID: {os.getpid()} )")
    print(f"Log file: {CONFIG['log_file']}")
    print(f"Check interval: {CONFIG['interval']}s")
    
    while True:
        try:
            report = generate_report()
            logging.info(f"Health: {report.get('health', 'UNKNOWN')}")
            
            # Send to endpoint if configured
            if CONFIG.get("endpoint"):
                try:
                    import urllib.request
                    req = urllib.request.Request(
                        CONFIG["endpoint"],
                        data=json.dumps(report).encode(),
                        headers={'Content-Type': 'application/json'}
                    )
                    urllib.request.urlopen(req, timeout=10)
                except:
                    pass
            
            if not CONFIG["quiet"]:
                print(f"[{datetime.now().strftime('%H:%M')}] {report['health']} - CPU: {report['cpu_percent']}% | RAM: {report['memory_percent']}% | Disk: {report['disk_percent']}%")
                
        except Exception as e:
            logging.error(f"Error in loop: {e}")
        
        time.sleep(CONFIG["interval"])

def run_once():
    """Single check and exit"""
    report = generate_report()
    print(json.dumps(report, indent=2))
    return 0 if report.get("health") == "OK" else 1

def main():
    """Entry point"""
    if len(sys.argv) > 1 and sys.argv[1] == "daemon":
        run_daemon()
    else:
        return run_once()

if __name__ == "__main__":
    sys.exit(main())
