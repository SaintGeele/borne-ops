#!/usr/bin/env python3
"""
Security Audit Tool
Questionnaire-based security assessment
"""

import sys
import json

QUESTIONS = {
    "Passwords": [
        {"q": "Is 2FA enabled on all critical accounts?", "weight": 15, "yes": 15, "no": 0},
        {"q": "Do you use a password manager?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Do you require 12+ character passwords?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Are passwords changed every 90 days for sensitive accounts?", "weight": 5, "yes": 5, "no": 0},
    ],
    "Network": [
        {"q": "Do you have a business-grade firewall?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Is VPN required for remote access?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Is your WiFi encrypted with WPA3/WPA2?", "weight": 5, "yes": 5, "no": 0},
        {"q": "Do you segment guest networks from business networks?", "weight": 5, "yes": 5, "no": 0},
    ],
    "Data": [
        {"q": "Are backups performed daily?", "weight": 15, "yes": 15, "no": 0},
        {"q": "Are backups stored offsite/in the cloud?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Is sensitive data encrypted at rest?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Do you limit access to sensitive data by role?", "weight": 5, "yes": 5, "no": 0},
    ],
    "Email": [
        {"q": "Do you use spam filtering?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Is DMARC configured for your domain?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Do you have SPF records configured?", "weight": 5, "yes": 5, "no": 0},
        {"q": "Do you scan email attachments before opening?", "weight": 5, "yes": 5, "no": 0},
    ],
    "Training": [
        {"q": "Do employees complete security training annually?", "weight": 15, "yes": 15, "no": 0},
        {"q": "Do you run phishing simulation tests?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Is there a documented security incident response plan?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Is there a clear password policy document?", "weight": 5, "yes": 5, "no": 0},
    ],
    "Compliance": [
        {"q": "Do you comply with GDPR (if EU customers)?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Do you comply with industry regulations (HIPAA, PCI, etc.)?", "weight": 10, "yes": 10, "no": 0},
        {"q": "Do you have a privacy policy?", "weight": 5, "yes": 5, "no": 0},
        {"q": "Do you conduct vendor security reviews?", "weight": 5, "yes": 5, "no": 0},
    ],
}

def get_score():
    """Run interactive audit"""
    print("\n" + "=" * 60)
    print("SECURITY AUDIT QUESTIONNAIRE")
    print("=" * 60)
    print("Answer: y/n\n")
    
    total_score = 0
    max_score = 0
    category_scores = {}
    missing_items = []
    
    for category, questions in QUESTIONS.items():
        cat_score = 0
        cat_max = 0
        
        print(f"\n### {category}")
        
        for q in questions:
            while True:
                answer = input(f"  {q['q']} (y/n): ").strip().lower()
                if answer in ['y', 'yes', 'n', 'no']:
                    break
                print("  Please answer y or n")
            
            cat_max += q['weight']
            if answer in ['y', 'yes']:
                cat_score += q['yes']
            else:
                missing_items.append(f"  • {q['q']}")
        
        category_scores[category] = int((cat_score / cat_max) * 100) if cat_max > 0 else 0
        total_score += cat_score
        max_score += cat_max
    
    final_score = int((total_score / max_score) * 100) if max_score > 0 else 0
    
    return final_score, category_scores, missing_items

def get_grade(score):
    """Get letter grade"""
    if score >= 90:
        return "A", "Excellent"
    elif score >= 80:
        return "B", "Good"
    elif score >= 70:
        return "C", "Fair"
    elif score >= 60:
        return "D", "Poor"
    else:
        return "F", "Critical"

def format_output(score, category_scores, missing_items):
    """Format audit results"""
    grade, grade_desc = get_grade(score)
    
    output = []
    output.append("\n" + "=" * 60)
    output.append("SECURITY AUDIT RESULTS")
    output.append("=" * 60)
    
    output.append(f"\n### OVERALL SCORE: {score}/100 ({grade}) - {grade_desc}")
    
    output.append("\n### BY CATEGORY")
    for cat, cat_score in category_scores.items():
        emoji = "✅" if cat_score >= 70 else "⚠️" if cat_score >= 50 else "❌"
        output.append(f"  {emoji} {cat}: {cat_score}%")
    
    if missing_items:
        output.append("\n### CRITICAL GAPS")
        for item in missing_items:
            output.append(item)
    
    output.append("\n" + "=" * 60)
    output.append("RECOMMENDATIONS")
    output.append("=" * 60)
    
    if score < 70:
        output.append("\n🔴 PRIORITY ACTIONS:")
        output.append("  1. Enable 2FA everywhere")
        output.append("  2. Set up automated backups")
        output.append("  3. Implement security training")
        output.append("  4. Get a firewall")
    elif score < 90:
        output.append("\n🟡 IMPROVEMENTS NEEDED:")
        output.append("  1. Address gaps in low-scoring categories")
        output.append("  2. Consider penetration testing")
        output.append("  3. Improve backup procedures")
    else:
        output.append("\n🟢 MAINTAIN & MONITOR")
        output.append("  1. Continue employee training")
        output.append("  2. Regular security reviews")
        output.append("  3. Stay updated on threats")
    
    return "\n".join(output)

if __name__ == "__main__":
    score, cat_scores, missing = get_score()
    print(format_output(score, cat_scores, missing))