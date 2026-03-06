#!/usr/bin/env python3
"""
Tutor - Paper Writing Assistant
Help with essays, research papers, citations
"""

import os
import json
from datetime import datetime

PAPERS_FILE = os.path.expanduser("~/.openclaw/borne-papers.json")

def load_papers():
    if os.path.exists(PAPERS_FILE):
        with open(PAPERS_FILE) as f:
            return json.load(f)
    return []

def save_papers(papers):
    with open(PAPERS_FILE, 'w') as f:
        json.dump(papers, f, indent=2)

def add_paper(title, course, due_date, notes=""):
    papers = load_papers()
    paper = {
        "title": title,
        "course": course,
        "due": due_date,
        "notes": notes,
        "outline": [],
        "sources": [],
        "status": "planning",  # planning, outline, draft, revision, done
        "added": datetime.now().isoformat()
    }
    papers.append(paper)
    save_papers(papers)
    return f"✓ Added paper: {title} ({course})"

def list_papers():
    papers = load_papers()
    
    output = "📝 **PAPERS**\n\n"
    
    if not papers:
        return output + "No papers. Add one with: papers add [title] [course] [due_date]"
    
    for p in papers:
        status_emoji = {
            "planning": "📋",
            "outline": "📑",
            "draft": "✍️",
            "revision": "🔧",
            "done": "✅"
        }.get(p["status"], "📋")
        
        output += f"{status_emoji} **{p['title']}**\n"
        output += f"   Course: {p['course']} | Due: {p['due']}\n"
        output += f"   Status: {p['status']}\n"
        if p.get("outline"):
            output += f"   Outline: {len(p['outline'])} sections\n"
        output += "\n"
    
    return output

def generate_outline(title, paper_type="essay"):
    """Generate a basic outline based on paper type"""
    
    outlines = {
        "essay": [
            "Introduction (hook, thesis statement)",
            "Background/Context",
            "Argument 1 (main point)",
            "Argument 2 (supporting point)",
            "Argument 3 (supporting point)",
            "Counterargument & Rebuttal",
            "Conclusion (restate thesis, summarize)"
        ],
        "research": [
            "Abstract (summary)",
            "Introduction (problem statement)",
            "Literature Review",
            "Methodology",
            "Results/Findings",
            "Discussion",
            "Conclusion",
            "References"
        ],
        "report": [
            "Executive Summary",
            "Introduction",
            "Background",
            "Findings",
            "Analysis",
            "Recommendations",
            "Conclusion",
            "Appendix"
        ]
    }
    
    outline = outlines.get(paper_type, outlines["essay"])
    
    # Save to paper
    papers = load_papers()
    for p in papers:
        if title.lower() in p["title"].lower():
            p["outline"] = outline
            p["status"] = "outline"
            save_papers(papers)
            return f"✓ Outline added to: {p['title']}\n\n" + "\n".join(f"{i}. {s}" for i, s in enumerate(outline, 1))
    
    return f"✗ Paper not found: {title}"

def add_source(title, paper_title, citation="", url=""):
    papers = load_papers()
    for p in papers:
        if paper_title.lower() in p["title"].lower():
            if "sources" not in p:
                p["sources"] = []
            p["sources"].append({
                "title": title,
                "citation": citation,
                "url": url,
                "added": datetime.now().isoformat()
            })
            save_papers(papers)
            return f"✓ Added source to: {p['title']}"
    return f"✗ Paper not found: {paper_title}"

def check_plagiarism(text):
    """Placeholder for plagiarism check suggestions"""
    return """
🔍 **Plagiarism Check Tips:**
- Use grammarly.com (free version)
- Use quillbot.com for paraphrasing
- Run through Hemingway app
- Check citations format (APA/MLA)
- Google key phrases in quotes
"""

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print(list_papers())
    elif sys.argv[1] == "add":
        title = sys.argv[2] if len(sys.argv) > 2 else "Untitled"
        course = sys.argv[3] if len(sys.argv) > 3 else ""
        due = sys.argv[4] if len(sys.argv) > 4 else ""
        print(add_paper(title, course, due))
    elif sys.argv[1] == "list":
        print(list_papers())
    elif sys.argv[1] == "outline" and len(sys.argv) > 2:
        ptype = sys.argv[3] if len(sys.argv) > 3 else "essay"
        print(generate_outline(sys.argv[2], ptype))
    elif sys.argv[1] == "source" and len(sys.argv) > 2:
        title = sys.argv[2]
        paper = sys.argv[3] if len(sys.argv) > 3 else ""
        print(add_source(title, paper))
    elif sys.argv[1] == "check":
        print(check_plagiarism(""))
    else:
        print(list_papers())
        print("\nUsage:")
        print("  python3 papers.py add [title] [course] [due_date]")
        print("  python3 papers.py outline [title] [type]")
        print("  python3 papers.py source [source_title] [paper_title]")
