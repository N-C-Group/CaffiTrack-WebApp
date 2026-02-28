# CaffiTrack Landing Page

## Overview

CaffiTrack is a landing page and support website for a caffeine tracking mobile application. The web application serves as a marketing site, contact form handler, and feature request management system for the CaffiTrack mobile app. It showcases app features, provides privacy policy and terms of service pages, and includes an admin panel for managing user-submitted feature requests.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS v4 with custom theme configuration
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Animations**: Framer Motion for smooth page transitions and interactions
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Fonts**: Inter (body) and Space Grotesk (headings) from Google Fonts

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for server bundling, Vite for client bundling
- **API Structure**: RESTful endpoints under `/api/*` prefix
- **Development**: Hot module replacement via Vite dev server with proxy to Express

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema push (`npm run db:push`)
- **Tables**:
  - `users` - Basic user authentication (username/password)
  - `contact_messages` - Contact form submissions
  - `feature_requests` - User-submitted drink/chain requests with status tracking

### Key Design Patterns
- **Shared Types**: Schema definitions in `/shared` directory used by both client and server
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for static assets
- **API Client**: Centralized fetch wrapper in `queryClient.ts` with error handling
- **Storage Abstraction**: `IStorage` interface in `storage.ts` allows for different storage implementations

## External Dependencies

### Third-Party Services
- **Resend**: Email service for contact form and request status notifications (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- **PostgreSQL**: Database (`DATABASE_URL` environment variable)
- **Firebase Cloud Messaging**: Push notifications to mobile app users via FCM HTTP v1 API

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PIN` - PIN code for admin panel access
- `CAFFEINE_API_KEY` - API key for mobile app `/api/caffeineItems` endpoint
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON for FCM push notifications
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` - Email (Resend)
- `GITHUB_TOKEN` - Optional; only for create-repo script

### Push Notifications
- **Topic**: "caffitrack" - All mobile app users subscribe to this topic
- **Admin Panel**: Push Notifications tab allows sending notifications to all subscribed users
- **Mobile Setup**: Uses KMPNotifier library with Firebase Cloud Messaging
- **Flow**: Admin Panel → Backend → Firebase FCM → Mobile Devices

### Key NPM Dependencies
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `@tanstack/react-query` - Async state management
- `framer-motion` - Animation library
- `react-icons` - Icon library (Apple/Google Play store icons)
- `wouter` - Lightweight router
- Full shadcn/ui component set via Radix UI primitives
