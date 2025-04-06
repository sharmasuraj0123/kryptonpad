# KryptonPad - CDO Listing Platform

A modern web application for listing and managing CDOs (Collateralized Debt Obligations). This platform features a complete user authentication flow with email verification and Twitter account linking.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL on Supabase
- **Styling**: TailwindCSS for responsive design

## Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   │   └── auth/             # Authentication API endpoints
│   │       └── twitter/      # Twitter OAuth callback
│   ├── auth/                 # Auth-related pages
│   │   ├── callback/         # Auth callback handler
│   │   ├── twitter-link/     # Twitter linking page
│   │   └── verify/           # Email verification page
│   ├── dashboard/            # User dashboard
│   └── login/                # Login page
├── components/               # React components
│   └── auth/                 # Auth-related components
│       ├── LoginForm.tsx     # Login form component
│       └── SignupForm.tsx    # Signup form component
└── utils/                    # Utility functions
    ├── supabase-browser.ts   # Supabase browser client
    └── supabase-server.ts    # Supabase server client
```

## Authentication Flow

1. **User Registration**:
   - User provides name, email, password, and country
   - Account is created in Supabase
   - Verification email is sent

2. **Email Verification**:
   - User clicks link in verification email
   - Email is marked as verified

3. **Twitter Account Linking**:
   - After email verification, user is prompted to link Twitter
   - OAuth flow with Twitter to get user details
   - Twitter username and ID are stored in user metadata

4. **Authentication Middleware**:
   - Redirects unauthenticated users to login
   - Redirects users with unverified email to verification page
   - Redirects verified users without Twitter to Twitter linking page
   - Allows authenticated and fully verified users to access the dashboard

## Database Connection

The application connects to a Supabase PostgreSQL database using the following connection string:

```
DATABASE_URL=postgresql://postgres.cyfznmdftbinxgcuqdjn:phyfarm321!@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

This connection is used for authentication and storing user data.

## Environment Variables

The application uses the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://cyfznmdftbinxgcuqdjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=postgresql://postgres.cyfznmdftbinxgcuqdjn:phyfarm321!@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_TWITTER_CLIENT_ID=<your-twitter-client-id>
TWITTER_CLIENT_SECRET=<your-twitter-client-secret>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Setup and Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application can be deployed to Vercel or any other hosting platform that supports Next.js applications.

## Important Implementation Notes

- Supabase authentication is implemented using the latest `@supabase/ssr` package
- The application uses SSR (Server-Side Rendering) for authentication
- The middleware ensures proper authentication state across the application
- Twitter integration requires setting up a Twitter Developer account and OAuth 2.0 app
