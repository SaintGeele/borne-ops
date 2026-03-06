#!/usr/bin/env python3
"""
Tutor - Assignment & Study Tracker
"""

import json
import os
from datetime import datetime, timedelta

TASKS_FILE = os.path.expanduser("~/.openclaw/borne-tasks.json")

def load_tasks():
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE) as f:
            return json.load(f)
    return {"assignments": [], "exams": [], "oscp": []}

def save_tasks(tasks):
    with open(TASKS_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

def add_assignment(name, due_date, course="", notes=""):
    tasks = load_tasks()
    tasks["assignments"].append({
        "name": name,
        "due": due_date,
        "course": course,
        "notes": notes,
        "added": datetime.now().isoformat(),
        "completed": False
    })
    save_tasks(tasks)
    return f"✓ Added: {name} due {due_date}"

def list_tasks():
    tasks = load_tasks()
    
    output = "📚 **SCHOOL TASKS**\n\n"
    
    # Assignments
    output += "**Assignments:**\n"
    pending = [a for a in tasks["assignments"] if not a.get("completed")]
    if pending:
        for a in sorted(pending, key=lambda x: x.get("due", "")):
            due = a.get("due", "No date")
            course = a.get("course", "")
            output += f"  • {a['name']}"
            if course:
                output += f" [{course}]"
            output += f" - Due: {due}\n"
    else:
        output += "  No pending assignments\n"
    
    # OSCP Progress
    output += "\n**OSCP Progress:**\n"
    if tasks.get("oscp"):
        for o in tasks["oscp"][-5:]:
            output += f"  • {o}\n"
    else:
        output += "  No progress logged\n"
    
    # Upcoming
    output += "\n**This Week:**\n"
    today = datetime.now()
    week = [today + timedelta(days=i) for i in range(7)]
    week_dates = [d.strftime("%Y-%m-%d") for d in week]
    
    due_soon = [a for a in pending if a.get("due", "") in week_dates]
    if due_soon:
        for a in due_soon:
            output += f"  • {a['name']} - {a.get('due')}\n"
    else:
        output += "  Nothing due this week\n"
    
    return output

def mark_done(name):
    tasks = load_tasks()
    for a in tasks["assignments"]:
        if a["name"].lower() == name.lower():
            a["completed"] = True
            save_tasks(tasks)
            return f"✓ Marked complete: {a['name']}"
    return f"✗ Not found: {name}"

def add_oscp(topic):
    tasks = load_tasks()
    tasks["oscp"].append({
        "topic": topic,
        "date": datetime.now().isoformat()
    })
    save_tasks(tasks)
    return f"✓ OSCP update: {topic}"

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print(list_tasks())
    elif sys.argv[1] == "add":
        name = sys.argv[2] if len(sys.argv) > 2 else "Untitled"
        due = sys.argv[3] if len(sys.argv) > 3 else ""
        course = sys.argv[4] if len(sys.argv) > 4 else ""
        print(add_assignment(name, due, course))
    elif sys.argv[1] == "done":
        print(mark_done(sys.argv[2] if len(sys.argv) > 2 else ""))
    elif sys.argv[1] == "oscp":
        print(add_oscp(sys.argv[2] if len(sys.argv) > 2 else ""))
    else:
        print(list_tasks())
