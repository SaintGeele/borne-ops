"""
AWS Lambda function for Borne Systems contact form.
Sends email via SES when form is submitted.

Environment variables:
- FROM_EMAIL: Verified sender email in SES
- TO_EMAIL: Where to receive inquiries (your email)
"""

import json
import os
import boto3
from datetime import datetime

ses = boto3.client('ses')

FROM_EMAIL = os.environ.get('FROM_EMAIL', 'hello@bornesystems.com')
TO_EMAIL = os.environ.get('TO_EMAIL', 'geele.evans@gmail.com')

def lambda_handler(event, context):
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }
    
    try:
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        
        name = body.get('name', 'Unknown')
        email = body.get('email', 'Not provided')
        service = body.get('service', 'Not specified')
        message = body.get('message', 'No message')
        
        # Compose email
        subject = f"New Inquiry from {name} - {service}"
        body_text = f"""
New inquiry from Borne Systems website!

Name: {name}
Email: {email}
Interested in: {service}

Message:
{message}

---
Sent from Borne Systems contact form
{ datetime.now().strftime('%Y-%m-%d %H:%M:%S EST') }
"""
        
        # Send email via SES
        response = ses.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [TO_EMAIL]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': body_text}}
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Thank you! We\'ll be in touch soon.'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'message': 'Something went wrong. Please try again or email us directly.'
            })
        }
