#!/usr/bin/env python3
"""
Tutor Quiz Mode - Flashcards
"""

import random

# Sample flashcards by topic
FLASHCARDS = {
    "networking": [
        {"q": "What is a subnet mask?", "a": "32-bit number that divides IP address into network and host portions"},
        {"q": "What port does DNS use?", "a": "53 (TCP/UDP)"},
        {"q": "What is VLAN?", "a": "Virtual LAN - logical network segmentation"},
        {"q": "What is NAT?", "a": "Network Address Translation - maps private IPs to public"},
        {"q": "What port is SSH?", "a": "22"},
        {"q": "What is CIDR?", "a": "Classless Inter-Domain Routing - IP address notation (e.g., /24)"},
    ],
    "security": [
        {"q": "What is SQL injection?", "a": "Attack inserting malicious SQL code into queries"},
        {"q": "What is XSS?", "a": "Cross-Site Scripting - injecting scripts into web pages"},
        {"q": "What is CSRF?", "a": "Cross-Site Request Forgery - forcing user to execute unwanted actions"},
        {"q": "What is LDAP?", "a": "Lightweight Directory Access Protocol - for accessing directory services"},
        {"q": "What is Kerberos?", "a": "Network authentication protocol using tickets"},
    ],
    "linux": [
        {"q": "How to find files modified in last 24h?", "a": "find . -mtime -1"},
        {"q": "How to check open ports?", "a": "netstat -tulpn or ss -tulpn"},
        {"q": "How to view running processes?", "a": "ps aux, top, htop"},
        {"q": "How to add a user?", "a": "useradd username or adduser username"},
        {"q": "How to change file permissions?", "a": "chmod 755 file or chown user:group file"},
    ],
    "oscp": [
        {"q": "What is the OSCP exam like?", "a": "24-hour hands-on exam, 5 machines, 70 points to pass"},
        {"q": "What tools are essential?", "a": "nmap, Burp, Netcat, Metasploit, wget/curl, enumeration scripts"},
        {"q": "Key privilege escalation paths?", "a": "SUID binaries, sudo -l, cron jobs, kernel exploits, service exploits"},
    ]
}

def quiz(topic="random", count=3):
    if topic == "random":
        topic = random.choice(list(FLASHCARDS.keys()))
    
    cards = FLASHCARDS.get(topic.lower(), FLASHCARDS["oscp"])
    selected = random.sample(cards, min(count, len(cards)))
    
    print(f"📚 **QUIZ: {topic.upper()}**\n")
    print(f"Answer each question, then check your answer.\n")
    
    for i, card in enumerate(selected, 1):
        print(f"Q{i}. {card['q']}")
        print("   [Press Enter for answer]")
        input()
        print(f"   → {card['a']}\n")
    
    print(f"Great practice! Do more: python3 scripts/quiz.py [topic]")

def list_topics():
    print("📚 **Available Quiz Topics:**\n")
    for topic, cards in FLASHCARDS.items():
        print(f"  • {topic} ({len(cards)} cards)")
    print("\nUsage: python3 quiz.py [topic] [count]")

if __name__ == "__main__":
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else "random"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    if topic == "list":
        list_topics()
    else:
        quiz(topic, count)
