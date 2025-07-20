# Munchies - University Food Delivery Platform

A comprehensive food delivery application designed specifically for METU Northern Cyprus Campus and Kalkanlı community. Munchies provides a seamless ordering experience with restaurant browsing, menu management, cart functionality, order tracking, and payment processing.

## 🎯 Features

### For Students/Users
- **Browse Restaurants** - Discover campus restaurants with search and filtering
- **Menu Exploration** - View categorized menu items with detailed information
- **Smart Cart** - Persistent shopping cart with real-time updates
- **Order Tracking** - Real-time status updates from preparation to delivery
- **Multiple Payment Methods** - Cash on delivery, credit card, and online payments
- **Profile Management** - Secure profile with picture upload functionality
- **Order History** - Complete order history with detailed information
- **Multi-language Support** - Turkish and English language options

### For Restaurant Owners
- **Restaurant Management** - Complete restaurant profile and settings control
- **Menu Administration** - Create categories and manage menu items with images
- **Order Processing** - Accept, prepare, and track order fulfillment
- **Courier Coordination** - Live GPS tracking of delivery personnel
- **Analytics Dashboard** - Order history and performance metrics
- **Image Upload** - Professional food photography with camera/gallery support

### For Couriers
- **Delivery Management** - Receive and accept delivery assignments
- **GPS Navigation** - Google Maps integration for optimal routing
- **Live Tracking** - Real-time location sharing with restaurants
- **Status Updates** - Update order progress through all delivery stages
- **Earnings Tracking** - Daily delivery summary and earnings overview
- **Customer Communication** - Direct calling functionality

## 🛠 Technology Stack

### Frontend
- **React** with TypeScript for type-safe development
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with custom theme and dark mode support
- **Radix UI** components with shadcn/ui styling system
- **TanStack Query** for efficient server state management
- **React Hook Form** with Zod validation
- **Vite** for fast development and optimized builds

### Backend
- **Node.js** with Express.js framework
- **TypeScript** with ES modules support
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** database with Neon serverless support
- **Custom Authentication** with secure session management
- **SendGrid** for email notifications
- **Google Maps API** for navigation and location services

### Mobile-First Design
- **Container**: Maximum width of 414px with centered layout
- **Responsive**: Optimized for mobile devices with touch-friendly interfaces
- **PWA Ready**: Configured with manifest and service worker capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SendGrid API key (for email notifications)
- Google Maps API key (for navigation)

### Environment Variables
Create a `.env` file with the following variables:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alpdogancelik/munchies-food-delivery.git
cd munchies-food-delivery
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📱 User Roles & Access

### Students/Users
- Browse restaurants and menus
- Place and track orders
- Manage delivery addresses
- View order history
- Update profile settings

### Restaurant Owners  
- Manage restaurant information
- Create and edit menu items
- Process incoming orders
- Track courier deliveries
- View analytics and reports

### Couriers
- Receive delivery assignments
- Navigate using Google Maps
- Update delivery status
- Track earnings and performance
- Communicate with customers

## 🏗 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
├── server/                 # Express backend application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database interface and operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── public/                # Static assets
```

## 🔒 Security Features

- **Custom Authentication** with secure password hashing
- **Session Management** with PostgreSQL-based storage
- **Input Validation** using Zod schemas
- **CORS Protection** with proper origin validation
- **Secure File Uploads** with type and size restrictions
- **Audit Logging** for all authentication events

## 🌐 Deployment

### Replit Deployment
The application is optimized for Replit deployment:

1. Import the project to Replit
2. Configure environment variables in Replit Secrets
3. The application will automatically build and deploy

### Manual Deployment
For other platforms:

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🎨 Design System

- **Mobile-First**: Optimized for 414px viewport with responsive scaling
- **Dark Mode**: Full dark mode support with system preference detection
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Turkish Market**: Designed for Turkish Lira currency and local preferences
- **Campus Focused**: Tailored for university campus delivery logistics

## 📧 Contact & Support

- **Developer**: Alpcan Çelik
- **Email**: alpdogan.celik1@gmail.com
- **Campus**: METU Northern Cyprus Campus, Kalkanlı

## 📄 License

This project is developed specifically for METU NCC and Kalkanlı community. All rights reserved.

---

**Munchies** - *Crave & Receive* 🍽️

*From Kalkanlı with love - connecting taste to community*