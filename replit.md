# Munchies - University Food Delivery

## Overview

Munchies is a comprehensive food delivery application designed specifically for Kalkanlı Campus. The application provides a seamless ordering experience with restaurant browsing, menu management, cart functionality, order tracking, and payment processing. The system supports three user types (Students, Restaurant Owners, and Couriers) with role-based access control, custom authentication, live courier tracking, and a modern mobile-first design with the new 3D food logo.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 20, 2025)

✓ Enhanced profile page with secure picture upload functionality
✓ Implemented multi-language support (Turkish/English) throughout the app
✓ Added comprehensive order history page for users
✓ Integrated SendGrid email notifications for order confirmations to alpdogan.celik1@gmail.com
✓ Reverted courier system to simplified working version after structural issues
✓ Fixed courier dashboard crashes by removing complex React Query dependencies
✓ Maintained cash on delivery and credit card payment options
✓ Preserved menu management and restaurant functionality

→ Profile system enhanced with secure picture upload
→ Email notifications working for order confirmations
→ Courier system simplified to prevent app crashes
→ Core food ordering functionality maintained and stable

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
- **Provider**: Custom authentication with username/password
- **Session Storage**: PostgreSQL-based session store with 7-day TTL
- **Authorization**: Route-level protection with middleware
- **User Management**: Registration and login with secure password hashing
- **User Types**: Three role-based user types (Student, Restaurant Owner, Courier)
- **Logout Functionality**: Complete logout with user type switching capability
- **Security Features**: Comprehensive audit logging for all auth events

### Database Schema
- **Users**: Profile information with username/email/password authentication
- **Restaurants**: Restaurant details, ownership, and operational status
- **Menu System**: Categories and items with availability and pricing
- **Orders**: Order management with status tracking and item details
- **Cart**: Persistent shopping cart with user association
- **Reviews**: Rating and review system for restaurants
- **Sessions**: Secure session storage for custom authentication
- **Security Logs**: Comprehensive audit trail for authentication events

### Payment Integration
- **Primary**: iyzico payment gateway for Turkish market
- **Fallback**: Cash on delivery option
- **Security**: Tokenized payments with server-side verification
- **WebView**: Embedded payment flow with message-based communication

### Order Management
- **Status Tracking**: Multi-stage order progression (pending → confirmed → preparing → ready → out for delivery → delivered)
- **Real-time Updates**: Query invalidation for live status updates
- **Admin Dashboard**: Restaurant owner interface for order management
- **Courier Tracking**: Live GPS-based courier tracking for restaurant owners
- **Courier Dashboard**: Dedicated interface for delivery management
- **Delivery Coordination**: Integration with delivery status updates and location tracking

## Data Flow

### User Journey
1. **Authentication**: Users register/login with custom username/password system
2. **Address Setup**: Users configure delivery addresses
3. **Restaurant Browsing**: Browse available restaurants with search and filtering
4. **Menu Exploration**: View categorized menu items with details
5. **Cart Management**: Add items to persistent shopping cart
6. **Order Placement**: Select payment method and place order
7. **Payment Processing**: Handle payment via iyzico or cash
8. **Order Tracking**: Real-time status updates and delivery tracking with order history

### Admin Workflow
1. **Restaurant Management**: Create and configure restaurant profiles
2. **Menu Administration**: Manage categories and menu items
3. **Order Processing**: Accept, prepare, and track order fulfillment
4. **Courier Management**: Live tracking of delivery personnel with GPS locations
5. **Analytics**: View order history and performance metrics

### Courier Workflow
1. **Delivery Assignments**: Receive and accept delivery orders
2. **Status Updates**: Update order status through pickup and delivery stages
3. **Live Tracking**: Real-time location sharing with restaurant owners
4. **Earnings Tracking**: View daily delivery summary and earnings

### API Architecture
- **RESTful Design**: Standard HTTP methods with JSON payloads
- **Authentication Middleware**: Protected routes with custom auth and user context
- **Search & Filtering**: Restaurant search by name, description, cuisine with category filters
- **Order Management**: Order history with status-based filtering
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