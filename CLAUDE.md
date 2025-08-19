# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server (React Router + Convex)
npm run dev           # Starts React Router dev server on localhost:5173
npx convex dev        # Starts Convex development environment

# Production build and deployment
npm run build         # Build for production
npm run start         # Start production server
npm run typecheck     # Type checking with React Router + TypeScript

# Convex database operations  
npx convex dev        # Development environment with real-time sync
npx convex deploy     # Deploy functions to production
```

## Architecture Overview

This is a **SaaS starter template** built on React Router v7 with a real-time Convex backend, Clerk authentication, and Polar.sh subscription billing.

### Core Architecture Patterns

**Frontend-Backend Integration:**
- **React Router v7** with SSR provides the full-stack framework
- **Convex** handles real-time database, serverless functions, and webhooks  
- **Authentication flow**: Clerk → Convex user sync → subscription status checking
- **Billing flow**: Polar.sh hosted checkout → webhook → Convex subscription sync

**Key Data Flow:**
1. User authenticates via Clerk (`tokenIdentifier` is the primary user key)
2. Convex `users` table syncs with Clerk via `upsertUser` mutation
3. Polar.sh webhooks update `subscriptions` table in real-time
4. React components query subscription status for feature gating

### Critical Integration Points

**Webhook Architecture:**
- **Endpoint**: `/payments/webhook` (defined in `convex/http.ts`)
- **Handler**: `paymentWebhook` in `convex/subscriptions.ts` 
- **Validation**: Uses `standardwebhooks` with `POLAR_WEBHOOK_SECRET`
- **Events**: `subscription.created|updated|canceled|uncanceled|revoked`

**Subscription State Management:**
- **Source of Truth**: Polar.sh via webhooks  
- **Local Storage**: Convex `subscriptions` table with `polarId` index
- **Status Queries**: Always use `.order("desc").first()` to get latest subscription
- **User Mapping**: `userId` field contains Clerk `tokenIdentifier`

**Customer Portal Integration:**
- **Pattern**: Generate portal URLs via `polar.customerSessions.create()`
- **User Flow**: App → Portal URL → User manages subscription → Webhook updates → UI reflects changes
- **No Direct API**: Subscription changes happen through Polar's hosted UI, not direct API calls

## Environment Configuration

**Required Environment Variables:**
```bash
# Convex (Backend)
CONVEX_DEPLOYMENT=          # Your deployment ID  
VITE_CONVEX_URL=           # Client connection URL

# Clerk (Authentication)  
VITE_CLERK_PUBLISHABLE_KEY= # Public key for frontend
CLERK_SECRET_KEY=          # Secret key for backend

# Polar.sh (Billing)
POLAR_ACCESS_TOKEN=        # API access token
POLAR_ORGANIZATION_ID=     # Your organization ID  
POLAR_WEBHOOK_SECRET=      # Webhook signature verification
POLAR_SERVER=             # "sandbox" or "production"

# OpenAI (AI Chat)
OPENAI_API_KEY=           # For chat functionality

# Application
FRONTEND_URL=             # Base URL for redirects
```

## Database Schema Key Patterns

**User Identity:**
- `users.tokenIdentifier` is the primary key linking Clerk → Convex
- All user-related queries should use `tokenIdentifier` for lookups

**Subscription Management:**  
- `subscriptions.userId` contains the Clerk `tokenIdentifier`
- `subscriptions.polarId` is Polar's subscription ID for webhook correlation
- Multiple subscriptions per user possible - always query latest with `.order("desc")`

**Webhook Event Tracking:**
- `webhookEvents` table stores all incoming Polar events
- `polarEventId` prevents duplicate processing
- Use for debugging and audit trails

## Key Implementation Notes

**Polar.sh Integration:**
- Use hosted checkout and customer portal - don't implement billing logic
- Webhook handler is the critical integration point for subscription sync
- Customer portal handles plan changes, cancellations, billing updates
- Proration and tax calculations are handled by Polar automatically

**Convex Patterns:**
- Mutations for data changes, queries for reads, actions for external API calls
- HTTP actions handle webhooks and external endpoints
- Real-time subscriptions automatically update React components

**React Router Patterns:**
- File-based routing in `app/routes/`
- Protected routes use `checkUserSubscriptionStatus` query for feature gating
- Layout routes provide shared dashboard navigation and auth checks

**Authentication Flow:**
- Clerk handles signin/signup UI and user session management
- `upsertUser` mutation syncs Clerk users to Convex `users` table
- Protected routes check both Clerk auth state and subscription status

## Polar.sh Best Practices

When working with Polar.sh integrations, consult `.claude/POLAR_BEST_PRACTICES.md` for detailed guidance on:
- Webhook event handling patterns
- Subscription lifecycle management  
- Customer portal integration
- Error handling and debugging
- MCP server setup for AI-assisted development

## Development Workflow

1. **Start Development**: Run `npm run dev` and `npx convex dev` concurrently
2. **Database Changes**: Modify `convex/schema.ts` and functions update automatically  
3. **Webhook Testing**: Use ngrok or similar to expose local Convex HTTP endpoint
4. **Authentication Testing**: Use Clerk's development keys for local testing
5. **Subscription Testing**: Use Polar.sh sandbox mode with test products

## Deployment Configuration

**Vercel (Recommended):**
- Uses `@vercel/react-router` preset configured in `react-router.config.ts`
- Set all environment variables in Vercel dashboard
- Automatic deployments on git push

**Manual Deployment:**
- Build outputs to `build/client/` (static) and `build/server/` (Node.js)
- Convex functions deploy separately via `npx convex deploy`
- Configure webhook endpoints to point to production URLs