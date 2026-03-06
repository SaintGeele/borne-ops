#!/usr/bin/env python3
"""
Pricing Calculator
"""

import argparse

# Service pricing
RECURRING = {
    "ai receptionist": 99,
    "lead automation": 149,
    "security basic": 199,
    "security pro": 399,
    "full stack": 499,
}

ONETIME = {
    "website simple": 750,
    "website medium": 1500,
    "website complex": 2500,
    "automation setup": 500,
    "security audit": 750,
}

def calculate_monthly(service, months=1, discount=0):
    """Calculate monthly pricing"""
    price = RECURRING.get(service.lower(), 0)
    if not price:
        return None
    
    subtotal = price * months
    discount_amt = subtotal * discount
    total = subtotal - discount_amt
    
    return {
        "service": service,
        "monthly": price,
        "months": months,
        "subtotal": subtotal,
        "discount": discount_amt,
        "total": total,
        "monthly_avg": total / months
    }

def calculate_onetime(service, complexity="medium"):
    """Calculate one-time pricing"""
    key = f"{service} {complexity}"
    price = ONETIME.get(key.lower(), 500)
    
    return {
        "service": service,
        "complexity": complexity,
        "price": price
    }

def print_quote(result):
    """Print quote"""
    print("\n" + "=" * 50)
    print("QUOTE")
    print("=" * 50)
    print(f"Service:      {result['service'].title()}")
    
    if 'monthly' in result:
        print(f"Monthly:      ${result['monthly']}")
        print(f"Months:       {result['months']}")
        print(f"Subtotal:     ${result['subtotal']}")
        if result['discount']:
            print(f"Discount:     -${result['discount']}")
        print(f"TOTAL:        ${result['total']}")
        print(f"Monthly Avg:  ${result['monthly_avg']:.2f}")
    else:
        print(f"Complexity:   {result['complexity']}")
        print(f"PRICE:        ${result['price']}")
    
    print("=" * 50)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pricing Calculator")
    parser.add_argument("--service", "-s", help="Service name")
    parser.add_argument("--months", "-m", type=int, default=1, help="Months for recurring")
    parser.add_argument("--discount", "-d", type=float, default=0, help="Discount (0.1 = 10 percent)")
    parser.add_argument("--project", "-p", help="One-time project")
    parser.add_argument("--complexity", "-c", default="medium", choices=["simple", "medium", "complex"])
    
    args = parser.parse_args()
    
    if args.service:
        result = calculate_monthly(args.service, args.months, args.discount)
        if result:
            print_quote(result)
        else:
            print(f"Service not found: {args.service}")
            print("Available:", ", ".join(RECURRING.keys()))
    
    elif args.project:
        result = calculate_onetime(args.project, args.complexity)
        print_quote(result)
    
    else:
        print("Pricing Calculator")
        print("\nRecurring Services:")
        for s, p in RECURRING.items():
            print(f"  {s}: ${p}/mo")
        print("\nOne-time:")
        for s, p in ONETIME.items():
            print(f"  {s}: ${p}")