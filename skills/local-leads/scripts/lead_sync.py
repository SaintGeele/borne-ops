#!/usr/bin/env python3
"""
Lead Sync to Notion
Add leads from local sources to Notion CRM
"""

import os
import json
import urllib.request
import urllib.parse

NOTION_API_KEY = os.getenv["NOTION_API_KEY"]
LEADS_DB = "c51fc61f-c494-4000-8296-088e42f5e626"

def query_notion_leads():
    """Get all leads from Notion"""
    url = f"https://api.notion.com/v1/databases/{LEADS_DB}/query"
    data = {"page_size": 100}
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return {"error": str(e)}

def add_lead_to_notion(name, phone="", email="", website="", industry="", notes=""):
    """Add a lead to Notion"""
    url = "https://api.notion.com/v1/pages"
    
    properties = {
        "Name": {"title": [{"text": {"content": name}}]},
        "Phone": {"rich_text": [{"text": {"content": phone}}]},
        "Email": {"rich_text": [{"text": {"content": email}}]},
        "Website": {"url": website} if website else {"url": None},
        "Industry": {"select": {"name": industry}} if industry else {"select": None},
        "Status": {"select": {"name": "New"}},
        "Notes": {"rich_text": [{"text": {"content": notes}}]},
        "Score": {"number": 0},
        "Source": {"select": {"name": "Local Research"}}
    }
    
    data = {
        "parent": {"database_id": LEADS_DB},
        "properties": properties
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {NOTION_API_KEY}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            return True, result.get('id', '')
    except Exception as e:
        return False, str(e)

def get_lead_report():
    """Generate a report of all leads"""
    result = query_notion_leads()
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    leads = result.get("results", [])
    
    if not leads:
        return "No leads in database yet."
    
    report = f"📋 **LEAD REPORT** - {len(leads)} total\n\n"
    
    # Group by status
    by_status = {}
    for lead in leads:
        props = lead.get("properties", {})
        status = props.get("Status", {}).get("select", {}).get("name", "Unknown")
        if status not in by_status:
            by_status[status] = []
        name = props.get("Name", {}).get("title", [{}])[0].get("text", {}).get("content", "Unnamed")
        phone = props.get("Phone", {}).get("rich_text", [{}])[0].get("text", {}).get("content", "")
        industry = props.get("Industry", {}).get("select", {}).get("name", "")
        by_status[status].append({"name": name, "phone": phone, "industry": industry})
    
    for status, items in by_status.items():
        report += f"\n**{status}** ({len(items)}):\n"
        for item in items:
            report += f"  • {item['name']}"
            if item['industry']:
                report += f" [{item['industry']}]"
            if item['phone']:
                report += f" - {item['phone']}"
            report += "\n"
    
    # Add ready for cold call section
    report += "\n\n📞 **READY FOR COLD CALL:**\n"
    for lead in leads:
        props = lead.get("properties", {})
        status = props.get("Status", {}).get("select", {}).get("name", "")
        website = props.get("Website", {}).get("url", "")
        if status == "New" and not website:
            name = props.get("Name", {}).get("title", [{}])[0].get("text", {}).get("content", "Unnamed")
            phone = props.get("Phone", {}).get("rich_text", [{}])[0].get("text", {}).get("content", "")
            if phone:
                report += f"  • {name}: {phone}\n"
    
    return report

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "report":
            print(get_lead_report())
        elif sys.argv[1] == "add" and len(sys.argv) > 2:
            name = sys.argv[2]
            phone = sys.argv[3] if len(sys.argv) > 3 else ""
            email = sys.argv[4] if len(sys.argv) > 4 else ""
            success, msg = add_lead_to_notion(name, phone, email)
            print(f"Added: {msg}" if success else f"Error: {msg}")
    else:
        print("Usage: lead_sync.py [report|add <name> [phone] [email]]")
