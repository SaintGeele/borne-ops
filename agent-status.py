#!/usr/bin/env python3
import json, subprocess, http.server, socketserver, re

PORT = 8888

def get_agent_status():
    try:
        result = subprocess.run(
            ['openclaw', 'sessions', '--json'],
            capture_output=True, text=True, timeout=15,
            cwd='/home/saint'
        )
        if result.returncode == 0:
            text = result.stdout.strip()
            # Find the JSON object - look for matching braces
            start = text.find('{')
            if start >= 0:
                # Count braces to find the end
                depth = 0
                end = len(text)
                for i, c in enumerate(text[start:]):
                    if c == '{': depth += 1
                    elif c == '}': 
                        depth -= 1
                        if depth == 0:
                            end = start + i + 1
                            break
                json_str = text[start:end]
                data = json.loads(json_str)
                sessions = data.get('sessions', [])
                active = [s for s in sessions if s.get('ageMs', 999999999) < 3600000]
                return {'sessions': active, 'count': len(active)}
        return {'sessions': [], 'error': 'No data'}
    except Exception as e:
        return {'error': str(e)[:100], 'sessions': []}

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/status':
            data = get_agent_status()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        else:
            self.send_response(404)
            self.end_headers()

print(f"API on {PORT}")
socketserver.TCPServer(('', PORT), Handler).serve_forever()
