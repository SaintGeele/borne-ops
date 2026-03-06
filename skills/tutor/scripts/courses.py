#!/usr/bin/env python3
"""
NYIT Course Tracker
Full-time student: Geele
Spring 2026
"""

import json
import os
from datetime import datetime

COURSES_FILE = os.path.expanduser("~/.openclaw/borne-courses.json")

COURSES = {
    "cs280": {
        "code": "CS 280",
        "name": "Computer Programming II",
        "credits": 3,
        "progress": 0,
        "grade": None,
        "instructor": "",
        "schedule": "",
        "priority": "HIGH",  # Just started
        "focus_areas": ["Python", "Data Structures", "OOP", "Algorithms"]
    },
    "eng205": {
        "code": "ENG 205", 
        "name": "Global Literature and Digital Media",
        "credits": 3,
        "progress": 31.43,
        "grade": None,
        "instructor": "",
        "schedule": "",
        "priority": "MEDIUM",
        "focus_areas": ["Essays", "Digital Media Analysis", "Literature"]
    },
    "eng210": {
        "code": "ENG 210",
        "name": "Communication for Technical Professions",
        "credits": 3,
        "progress": 22.22,
        "grade": None,
        "instructor": "",
        "schedule": "",
        "priority": "MEDIUM",
        "focus_areas": ["Technical Writing", "Presentations", "Reports"]
    }
}

def load_courses():
    if os.path.exists(COURSES_FILE):
        with open(COURSES_FILE) as f:
            return json.load(f)
    # Initialize with default courses
    with open(COURSES_FILE, 'w') as f:
        json.dump(COURSES, f, indent=2)
    return COURSES

def save_courses(courses):
    with open(COURSES_FILE, 'w') as f:
        json.dump(courses, f, indent=2)

def list_courses():
    courses = load_courses()
    
    output = "📚 **NYIT - SPRING 2026**\n"
    output += f"**Status:** Full-Time Student\n"
    output += f"**Credits:** 9\n"
    output += f"**Due:** May 15, 2026\n\n"
    
    # Sort by priority
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    sorted_courses = sorted(courses.values(), key=lambda x: priority_order.get(x["priority"], 3))
    
    output += "**COURSES:**\n"
    for c in sorted_courses:
        emoji = "🔴" if c["priority"] == "HIGH" else "🟡" if c["priority"] == "MEDIUM" else "🟢"
        output += f"\n{emoji} **{c['code']}** - {c['name']}\n"
        output += f"   Progress: {c['progress']}%\n"
        output += f"   Focus: {', '.join(c['focus_areas'][:3])}\n"
    
    return output

def update_progress(course_code, progress):
    courses = load_courses()
    
    for code, c in courses.items():
        if course_code.lower() in code or course_code.lower() in c["name"].lower():
            c["progress"] = progress
            save_courses(courses)
            return f"✓ {c['code']} progress: {progress}%"
    
    return f"✗ Course not found: {course_code}"

def study_plan():
    """Generate study plan based on courses"""
    courses = load_courses()
    
    # Priority order
    priority = ["cs280", "eng205", "eng210"]  # Programming first (0%)
    
    plan = """
🎯 **WEEKLY STUDY PLAN**

**Monday/Wednesday:**
- CS 280: Computer Programming II (2 hrs)
  Focus: Python basics review → Data structures

**Tuesday/Thursday:**  
- ENG 205: Global Literature (1.5 hrs)
  Focus: Reading assignments, essays
- ENG 210: Technical Communication (1.5 hrs)
  Focus: Technical writing exercises

**Friday:**
- Review week + catch up
- Work on outstanding assignments

**Weekend:**
- Light review (2 hrs)
- OSCP practice if time permits

**Current Priority:** CS 280 is at 0% - focus here first!
"""
    return plan

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "plan":
            print(study_plan())
        elif sys.argv[1] == "update" and len(sys.argv) > 3:
            print(update_progress(sys.argv[2], int(sys.argv[3])))
        else:
            print(list_courses())
    else:
        print(list_courses())
        print(study_plan())
