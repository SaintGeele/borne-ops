# LocalBoost — Review Request Templates

_Ready to use once Twilio A2P is approved_

## SMS Templates (under 160 chars)

### After Appointment
```
Hi [Name]! Thanks for visiting Carson Aesthetics today ✨ If you had a great experience, a quick Google review would mean the world: [review_link]
```

### 24hr Follow-Up (if no review)
```
Hey [Name], hope you're feeling great after your visit! Got 30 seconds? A Google review helps us help more people like you: [review_link]
```

### Gentle Reminder (3 days)
```
Hi [Name], just a friendly reminder — your Google review for Carson Aesthetics would really help! Takes 30 seconds: [review_link]
```

## Email Templates

### Subject: Thanks for visiting Carson Aesthetics!

```
Hi [Name],

Thank you so much for coming in today! We hope you loved your [service].

If you have a moment, we'd really appreciate a quick Google review. It helps other people find us and means a lot to our small team.

👉 Leave a review: [review_link]

Takes less than 30 seconds. Thank you!

Warmly,
Nicole & the Carson Aesthetics team
```

## How to Generate Google Review Links

### For any business:
1. Go to Google Maps
2. Search for the business
3. Click "Write a review"
4. Copy the URL from the browser

### Shortcut:
Use this format:
```
https://search.google.com/local/writereview?placeid=[PLACE_ID]
```

### Carson Aesthetics Place ID:
To find it: https://developers.google.com/maps/documentation/places/web-service/place-id-finder

## Automation Flow (when Twilio A2P approved)
1. Nicole marks appointment as complete in Square
2. System waits 2 hours
3. Sends SMS review request
4. If no review in 24hrs → send follow-up
5. If no review in 3 days → send gentle reminder
6. Stop after 3 attempts
