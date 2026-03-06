#!/usr/bin/env python3
"""
Tutor - Book Summary & Analysis
Read and summarize educational content
"""

import os
import json
from datetime import datetime

# Books/references for OSCP prep
OSCP_BOOKS = {
    "penetration-testing": {
        "title": "Penetration Testing: A Hands-On Introduction",
        "author": "Georgia Weidman",
        "topics": ["Metasploit", "Nmap", "Burp Suite", "Privilege Escalation"],
        "notes": "Good for beginners"
    },
    "kali-linux": {
        "title": "Kali Linux Revealed",
        "author": "Offensive Security",
        "topics": ["Kali setup", "Tools overview", "Web testing"],
        "notes": "Free PDF available"
    },
    "rtfm": {
        "title": "Red Team Field Manual",
        "author": "Ben Clark",
        "topics": ["Commands", "Cheat sheets", "Quick reference"],
        "notes": "Must-have for exams"
    },
    "ptf": {
        "title": "The Penetration Tester's Guide",
        "author": "Jim O'Gorman",
        "topics": ["Linux", "Python", "Bash", "Networking"],
        "notes": "Balbasty's favorite"
    }
}

def list_books():
    print("📚 **OSCP REFERENCE BOOKS:**\n")
    for key, book in OSCP_BOOKS.items():
        print(f"**{key}**")
        print(f"   {book['title']}")
        print(f"   by {book['author']}")
        print(f"   Topics: {', '.join(book['topics'])}")
        print(f"   → {book['notes']}\n")

def add_book_notes(book_key, notes):
    """Add notes to a book"""
    notes_file = os.path.expanduser("~/.openclaw/borne-book-notes.json")
    
    if os.path.exists(notes_file):
        with open(notes_file) as f:
            data = json.load(f)
    else:
        data = {}
    
    if book_key not in data:
        data[book_key] = []
    
    data[book_key].append({
        "notes": notes,
        "date": datetime.now().isoformat()
    })
    
    with open(notes_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    return f"✓ Added notes to {book_key}"

def get_book_notes(book_key):
    notes_file = os.path.expanduser("~/.openclaw/borne-book-notes.json")
    
    if not os.path.exists(notes_file):
        return f"No notes for {book_key}"
    
    with open(notes_file) as f:
        data = json.load(f)
    
    notes = data.get(book_key, [])
    if not notes:
        return f"No notes for {book_key}"
    
    output = f"📝 **Notes: {book_key}**\n\n"
    for n in notes:
        output += f"• {n['notes']}\n"
        output += f"  Added: {n['date'][:10]}\n\n"
    
    return output

def summarize_text(text, max_length=200):
    """Simple extractive summarization - first few paragraphs"""
    paragraphs = text.split('\n\n')
    summary = ""
    
    for p in paragraphs[:3]:
        if len(summary) + len(p) < max_length:
            summary += p + "\n\n"
    
    if len(text) > max_length:
        summary += f"\n[... {len(text) - max_length} more characters]"
    
    return summary

def read_file_summary(filepath):
    """Read a file and summarize it"""
    if not os.path.exists(filepath):
        return f"File not found: {filepath}"
    
    with open(filepath) as f:
        content = f.read()
    
    if len(content) < 500:
        return content
    
    return summarize_text(content)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        list_books()
    elif sys.argv[1] == "list":
        list_books()
    elif sys.argv[1] == "notes" and len(sys.argv) > 2:
        if len(sys.argv) > 3 and sys.argv[2] == "add":
            print(add_book_notes(sys.argv[3], " ".join(sys.argv[4:])))
        else:
            print(get_book_notes(sys.argv[2]))
    elif sys.argv[1] == "read" and len(sys.argv) > 2:
        print(read_file_summary(sys.argv[2]))
    else:
        list_books()
