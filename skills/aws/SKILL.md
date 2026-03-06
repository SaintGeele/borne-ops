---
name: aws
description: AWS cloud services for client hosting, Lambda functions, and cloud infrastructure.
author: Geele
version: 1.0.0
triggers:
  - "aws"
  - "amazon web services"
  - "cloud"
metadata: {"openclaw":{"emoji":"☁️"}}
---

# AWS - Amazon Web Services

Manage AWS resources for client projects.

## Credentials
- Stored in: `~/.openclaw/credentials/aws.json`
- Region: us-east-1

## Setup Required
- Need AWS CLI or boto3 installed to run commands
- Currently not available in this environment

## Available Services

### For Client Projects
- **S3** - Website hosting, file storage
- **Lambda** - Serverless functions
- **CloudFront** - CDN for fast delivery
- **IAM** - User management, security
- **Route 53** - DNS management
- **ACM** - SSL certificates (free)

### For Borne Systems
- Client website hosting
- Security scanning tools
- Backup storage
- Email services (SES)

## Common Commands (when AWS CLI available)

```bash
# List S3 buckets
aws s3 ls

# Upload files to S3
aws s3 sync ./folder s3://bucket-name/

# List Lambda functions
aws lambda list-functions

# Check IAM users
aws iam list-users
```

## Cost Optimization
- Use S3 Intelligent Tiering
- Set up billing alerts
- Use reserved instances for predictable workloads
- Free tier covers small projects

## Security
- Enable MFA on root account
- Use IAM roles, not access keys where possible
- Enable CloudTrail logging
- Regular security audits