#!/bin/bash
cd ~/.openclaw/workspace/skills/last30days && python3 -c "import subprocess; subprocess.run([\"python3\", \"scripts/last30days.py\", \"--quick\", \"AI micro-saas productivity Bornes\", \"--days=1\"], stdout=open(\"/tmp/borne-brief.txt\", \"w\"))"
