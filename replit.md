# Munchies - University Food Delivery

## Overview

Munchies is a comprehensive food delivery application designed specifically for Kalkanlı Campus. The application provides a seamless ordering experience with restaurant browsing, menu management, cart functionality, order tracking, and payment processing. The system is built as a full-stack web application with a mobile-first responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom theme variables and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Mobile-First Design
- **Container**: Maximum width of 414px with centered layout
- **Responsive**: Optimized for mobile devices with touch-friendly interfaces
- **PWA Support**: Configured with manifest and service worker capabilities

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Session Storage**: PostgreSQL-based session store with 7-day TTL
- **Authorization**: Route-level protection with middleware
- **User Management**: Automatic user creation and profile management

### Database Schema
- **Users**: Profile information, addresses, and authentication data
- **Restaurants**: Restaurant details, ownership, and operational status
- **Menu System**: Categories and items with availability and pricing
- **Orders**: Order management with status tracking and item details
- **Cart**: Persistent shopping cart with user association
- **Reviews**: Rating and review system for restaurants
- **Sessions**: Secure session storage for authentication

### Payment Integration
- **Primary**: iyzico payment gateway for Turkish market
- **Fallback**: Cash on delivery option
- **Security**: Tokenized payments with server-side verification
- **WebView**: Embedded payment flow with message-based communication

### Order Management
- **Status Tracking**: Multi-stage order progression (pending → confirmed → preparing → ready → out for delivery → delivered)
- **Real-time Updates**: Query invalidation for live status updates
- **Admin Dashboard**: Restaurant owner interface for order management
- **Delivery Coordination**: Integration with delivery status updates

## Data Flow

### User Journey
1. **Authentication**: Users authenticate via Replit Auth
2. **Address Setup**: Users configure delivery addresses
3. **Restaurant Browsing**: Browse available restaurants with filtering
4. **Menu Exploration**: View categorized menu items with details
5. **Cart Management**: Add items to persistent shopping cart
6. **Order Placement**: Select payment method and place order
7. **Payment Processing**: Handle payment via iyzico or cash
8. **Order Tracking**: Real-time status updates and delivery tracking

### Admin Workflow
1. **Restaurant Management**: Create and configure restaurant profiles
2. **Menu Administration**: Manage categories and menu items
3. **Order Processing**: Accept, prepare, and track order fulfillment
4. **Analytics**: View order history and performance metrics

### API Architecture
- **RESTful Design**: Standard HTTP methods with JSON payloads
- **Authentication Middleware**: Protected routes with user context
- **Error Handling**: Consistent error responses with proper status codes
- **Query Optimization**: Efficient database queries with proper indexing

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle Kit**: Database migration and schema management

### Payment Processing
- **iyzico**: Turkish payment gateway integration
- **WebView Communication**: PostMessage API for payment flow

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit authentication identifier
- **ISSUER_URL**: OIDC provider URL (defaults to Replit)

### Production Setup
- **Server**: Express serves built React app and API routes
- **Database**: Neon PostgreSQL with connection pooling
- **Sessions**: PostgreSQL-backed session storage
- **Security**: HTTPS enforcement and secure cookie configuration

### Development Mode
- **HMR**: Hot module replacement for React components
- **API Proxy**: Vite proxies API requests to Express server
- **Live Reload**: Automatic server restart on TypeScript changes
- **Error Overlay**: Runtime error display in development