# Borne System Monitor

Lightweight, background system monitoring for client machines.

## Features

- **CPU/Memory/Disk monitoring** - Real-time stats
- **Top processes** - Track resource-heavy apps
- **Network interfaces** - IP addresses and connectivity
- **Health status** - OK / WARNING / CRITICAL
- **Silent logging** - Writes to `~/.system-healthd.log`
- **Optional reporting** - Send data to webhook endpoint

## Installation

```bash
pip install psutil
```

## Usage

**Single check:**
```bash
python monitor.py
```

**Run as daemon (background):**
```bash
python monitor.py daemon
```

**Install as service (Linux):**
```bash
# Copy to system folder
sudo cp monitor.py /usr/local/bin/borne-monitor
sudo chmod +x /usr/local/bin/borne-monitor

# Create systemd service
sudo nano /etc/systemd/system/borne-monitor.service
```

## Output Example

```json
{
  "hostname": "client-pc-01",
  "os": "Linux 5.10.0",
  "cpu_percent": 23.5,
  "memory_percent": 61.2,
  "disk_percent": 45.0,
  "health": "OK",
  "warnings": []
}
```

## Client Deployment

1. Install on client machine
2. Run as systemd service or cron
3. Configure webhook to receive data at your endpoint
4. Track health from central dashboard

## Note

This is a legitimate monitoring tool for IT support businesses. 
Use only on machines you have permission to monitor.
