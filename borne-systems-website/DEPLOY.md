# Borne Systems Website - Deployment Guide

## Files Ready
- `index.html` - Main website
- `styles.css` - Styling
- `script.js` - Interactivity
- `assets/` - Logo images
- `js/contact-form.js` - Form handler
- `lambda/contact-form.py` - AWS Lambda for SES

---

## Quick Deploy to AWS S3

### 1. Upload to S3
```bash
# Create bucket (if needed)
aws s3 mb s3://www.bornesystems.com

# Upload files
aws s3 sync . s3://www.bornesystems.com --delete

# Make public
aws s3 website s3://www.bornesystems.com --index-document index.html --error-document index.html

# Set public read
aws s3 cp s3://www.bornesystems.com --recursive --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
```

### 2. Set up Contact Form (SES)

#### Step A: Verify Email in SES
1. Go to AWS Console → SES → Email Addresses
2. Verify `geele.evans@gmail.com` (or your email)

#### Step B: Create Lambda Function
1. Go to AWS Console → Lambda → Create Function
2. Author: Author from scratch
3. Runtime: Python 3.9+
4. Paste code from `lambda/contact-form.py`
5. Add environment variables:
   - `FROM_EMAIL`: hello@bornesystems.com (verified in SES)
   - `TO_EMAIL`: geele.evans@gmail.com

#### Step C: Create API Gateway
1. API Gateway → Create API → REST API
2. Create resource `/contact` → POST method
3. Integrate with Lambda function
4. Enable CORS
5. Deploy to a stage (e.g., "prod")
6. Copy the invoke URL

#### Step D: Update JavaScript
1. Open `js/contact-form.js`
2. Replace `YOUR_API_GATEWAY_URL_HERE` with your actual URL:
```javascript
const LAMBDA_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/contact';
```

#### Step E: Re-upload to S3
```bash
aws s3 sync . s3://www.bornesystems.com --delete
```

---

## Cost Estimate
- S3 Hosting: ~$0.01/mo
- CloudFront (optional): ~$0.01/mo
- SES: 1,000 free emails/mo
- Lambda: 1M free requests/mo
- **Total: ~$0.02/mo**

---

## Alternative: Use mailto (No AWS Setup)

If you want to skip SES setup, just update `js/contact-form.js`:
```javascript
const LAMBDA_URL = null; // Keep as null - will use mailto fallback
```

And in the form handler, it will fall back to opening an email client.
