#!/bin/bash
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-r1:1.5b","messages":[{"role":"user","content":"Say a one-line daily status."}],"temperature":0.3}' | jq -r '.choices[0].message.content' > /tmp/heartbeat.txt
