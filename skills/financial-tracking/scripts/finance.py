#!/usr/bin/env python3
"""
Financial Tracking for Borne Systems
Track income, expenses, and generate reports
"""

import sys
import json
import argparse
import os
from datetime import datetime

DATA_FILE = os.path.expanduser("~/.openclaw/borne-finance.json")

def load_data():
    """Load financial data"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {"income": [], "expenses": []}

def save_data(data):
    """Save financial data"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def add_entry(data, entry_type, amount, source, description=""):
    """Add income or expense"""
    entry = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "amount": amount,
        "source": source,
        "description": description
    }
    
    if entry_type == "income":
        data["income"].append(entry)
    else:
        data["expenses"].append(entry)
    
    return data

def generate_report(data):
    """Generate financial report"""
    # Calculate totals
    total_income = sum(e["amount"] for e in data["income"])
    total_expenses = sum(e["amount"] for e in data["expenses"])
    net = total_income - total_expenses
    margin = (net / total_income * 100) if total_income > 0 else 0
    
    # Monthly breakdown
    current_month = datetime.now().strftime("%Y-%m")
    monthly_income = sum(e["amount"] for e in data["income"] if e["date"].startswith(current_month))
    monthly_expenses = sum(e["amount"] for e in data["expenses"] if e["date"].startswith(current_month))
    
    output = []
    output.append("=" * 60)
    output.append("FINANCIAL REPORT - " + datetime.now().strftime("%B %Y"))
    output.append("=" * 60)
    
    output.append("\n### THIS MONTH")
    output.append(f"Income:      ${monthly_income:,.2f}")
    output.append(f"Expenses:    ${monthly_expenses:,.2f}")
    output.append(f"Net:         ${monthly_income - monthly_expenses:,.2f}")
    
    output.append("\n### ALL TIME")
    output.append(f"Total Income:    ${total_income:,.2f}")
    output.append(f"Total Expenses:  ${total_expenses:,.2f}")
    output.append(f"Net Profit:      ${net:,.2f}")
    output.append(f"Margin:          {margin:.1f}%")
    
    # Income breakdown
    if data["income"]:
        output.append("\n### INCOME BREAKDOWN")
        sources = {}
        for e in data["income"]:
            src = e["source"]
            sources[src] = sources.get(src, 0) + e["amount"]
        for src, amt in sorted(sources.items(), key=lambda x: -x[1]):
            output.append(f"  {src}: ${amt:,.2f}")
    
    # Expense breakdown
    if data["expenses"]:
        output.append("\n### EXPENSE BREAKDOWN")
        sources = {}
        for e in data["expenses"]:
            src = e["source"]
            sources[src] = sources.get(src, 0) + e["amount"]
        for src, amt in sorted(sources.items(), key=lambda x: -x[1]):
            output.append(f"  {src}: ${amt:,.2f}")
    
    output.append("\n" + "=" * 60)
    
    return "\n".join(output)

def show_status(data):
    """Quick status"""
    current_month = datetime.now().strftime("%Y-%m")
    monthly_income = sum(e["amount"] for e in data["income"] if e["date"].startswith(current_month))
    monthly_expenses = sum(e["amount"] for e in data["expenses"] if e["date"].startswith(current_month))
    
    print(f"\n💰 This Month: ${monthly_income - monthly_expenses:,.2f} net")
    print(f"   Income: ${monthly_income:,.2f} | Expenses: ${monthly_expenses:,.2f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Financial Tracking")
    subparsers = parser.add_subparsers(dest="command")
    
    # Add subcommand
    add_parser = subparsers.add_parser("add", help="Add income or expense")
    add_parser.add_argument("--type", choices=["income", "expense"], required=True)
    add_parser.add_argument("--amount", type=float, required=True)
    add_parser.add_argument("--source", required=True, help="Source (e.g., client name)")
    add_parser.add_argument("--description", default="", help="Optional description")
    
    # Report subcommand
    subparsers.add_parser("report", help="Generate financial report")
    
    # Status subcommand  
    subparsers.add_parser("status", help="Quick status")
    
    args = parser.parse_args()
    
    data = load_data()
    
    if args.command == "add":
        data = add_entry(data, args.type, args.amount, args.source, args.description)
        save_data(data)
        print(f"✓ Added {args.type}: ${args.amount} from {args.source}")
    
    elif args.command == "report":
        print(generate_report(data))
    
    elif args.command == "status":
        show_status(data)
    
    else:
        parser.print_help()