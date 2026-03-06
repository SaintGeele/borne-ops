#!/usr/bin/env python3
"""
Invoice Generator
"""

import json
import os
import argparse
from datetime import datetime, timedelta

INVOICES_FILE = os.path.expanduser("~/.openclaw/borne-invoices.json")

def load_invoices():
    if os.path.exists(INVOICES_FILE):
        with open(INVOICES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_invoices(invoices):
    with open(INVOICES_FILE, 'w') as f:
        json.dump(invoices, f, indent=2)

def create_invoice(client, service, amount, description=""):
    """Create a new invoice"""
    invoices = load_invoices()
    
    invoice_num = len(invoices) + 1
    date = datetime.now()
    due = date + timedelta(days=30)
    
    invoice = {
        "id": invoice_num,
        "number": f"INV-{invoice_num:04d}",
        "client": client,
        "service": service,
        "amount": amount,
        "description": description or service,
        "date": date.strftime("%Y-%m-%d"),
        "due": due.strftime("%Y-%m-%d"),
        "status": "pending"
    }
    
    invoices.append(invoice)
    save_invoices(invoices)
    
    print_invoice(invoice)
    return invoice

def print_invoice(inv):
    """Print invoice"""
    print("\n" + "=" * 50)
    print(f"INVOICE: {inv['number']}")
    print("=" * 50)
    print(f"Date:      {inv['date']}")
    print(f"Due:       {inv['due']}")
    print(f"Client:    {inv['client']}")
    print(f"Service:   {inv['service']}")
    print("-" * 50)
    print(f"Amount:    ${inv['amount']:.2f}")
    print("-" * 50)
    print(f"Status:    {inv['status'].upper()}")
    print("=" * 50)

def list_invoices():
    """List all invoices"""
    invoices = load_invoices()
    
    if not invoices:
        print("No invoices yet")
        return
    
    print(f"\n=== INVOICES ({len(invoices)}) ===\n")
    
    total_pending = 0
    total_paid = 0
    
    for inv in invoices:
        status_icon = "✓" if inv['status'] == 'paid' else "○"
        print(f"{status_icon} {inv['number']} | {inv['client']} | ${inv['amount']} | {inv['status']}")
        
        if inv['status'] == 'pending':
            total_pending += inv['amount']
        else:
            total_paid += inv['amount']
    
    print(f"\nTotal Pending: ${total_pending:.2f}")
    print(f"Total Paid:    ${total_paid:.2f}")

def mark_paid(invoice_id):
    """Mark invoice as paid"""
    invoices = load_invoices()
    
    for inv in invoices:
        if inv['id'] == invoice_id or inv['number'] == invoice_id:
            inv['status'] = 'paid'
            save_invoices(invoices)
            print(f"✓ Invoice {inv['number']} marked as paid")
            return
    
    print(f"Invoice not found: {invoice_id}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Invoice Generator")
    subparsers = parser.add_subparsers(dest="command")
    
    create_parser = subparsers.add_parser("create", help="Create invoice")
    create_parser.add_argument("--client", "-c", required=True)
    create_parser.add_argument("--service", "-s", required=True)
    create_parser.add_argument("--amount", "-a", type=float, required=True)
    create_parser.add_argument("--desc", "-d", default="")
    
    subparsers.add_parser("list", help="List invoices")
    
    paid_parser = subparsers.add_parser("paid", help="Mark as paid")
    paid_parser.add_argument("--id", "-i", required=True)
    
    args = parser.parse_args()
    
    if args.command == "create":
        create_invoice(args.client, args.service, args.amount, args.desc)
    elif args.command == "list":
        list_invoices()
    elif args.command == "paid":
        mark_paid(args.id)
    else:
        parser.print_help()