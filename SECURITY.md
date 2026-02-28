# Security & Deployment Guide

## Environment Variables

This app requires the following environment variables. **Never commit secrets to git.**

Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_PIN` | Yes | PIN for admin panel access |
| `CAFFEINE_API_KEY` | Yes | API key for mobile app `/api/caffeineItems` |
| `FIREBASE_SERVICE_ACCOUNT` | Yes* | Firebase service account JSON (for push notifications) |
| `RESEND_API_KEY` | Yes** | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Yes** | Verified sender email (e.g. `CaffiTrack <noreply@yourdomain.com>`) |

\* Required for push notifications from admin panel  
\** Required for contact form and request status emails

## Before Making the Repo Public

1. **Rotate all exposed credentials** – If any secrets were ever committed:
   - Generate a new admin PIN
   - Generate a new `CAFFEINE_API_KEY` and update your mobile app
   - Create a new Firebase service account key (revoke the old one in Google Cloud Console)
   - Rotate GitHub Personal Access Token if it was exposed
   - Create a new Resend API key if needed

2. **Verify .gitignore** – Ensure `.env` and `.env.*` are ignored

3. **Check git history** – If secrets were committed in the past, consider using `git filter-branch` or BFG Repo-Cleaner to remove them from history before publishing

## Deployment

When deploying (e.g. Vercel, Railway, Render):

1. Set all required env vars in your hosting platform's dashboard
2. For `FIREBASE_SERVICE_ACCOUNT`: paste the full JSON as a single-line string, or use your platform's secret/file injection
3. Update your mobile app with the new `CAFFEINE_API_KEY` and API base URL
