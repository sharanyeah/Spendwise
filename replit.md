# Overview

SpendWise is a full-stack personal finance management application built with React, Express.js, and TypeScript. The application enables users to track transactions, set financial goals, create budgets, and analyze spending patterns through an intuitive dashboard interface. It features a dark theme design with comprehensive financial management capabilities including income/expense tracking, goal progress monitoring, budget management, and detailed analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for dark theme implementation
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Data Storage**: In-memory storage implementation with interface-based design for easy database integration
- **Schema Validation**: Zod schemas shared between client and server for consistent validation

## Data Management
- **Database**: Configured for PostgreSQL with Drizzle ORM (currently using in-memory storage)
- **Schema Design**: Separate tables for transactions, goals, and budgets with proper relationships
- **Migration System**: Drizzle Kit for database schema management and migrations
- **Data Validation**: Shared Zod schemas ensuring type safety across the full stack

## Component Architecture
- **Layout**: Responsive design with desktop sidebar and mobile bottom navigation
- **Modular Components**: Reusable modal components for transaction and goal creation
- **UI System**: Consistent component library with variant-based styling using class-variance-authority
- **Accessibility**: Built on Radix UI primitives ensuring WCAG compliance

## Development Environment
- **Build System**: Vite with hot module replacement and TypeScript compilation
- **Code Quality**: Strict TypeScript configuration with comprehensive type checking
- **Path Mapping**: Alias-based imports for cleaner code organization (@/ for client, @shared for shared utilities)

# External Dependencies

## Database & ORM
- **PostgreSQL**: Primary database (configured but not yet implemented)
- **Drizzle ORM**: Type-safe database queries and schema management
- **Neon Database**: Serverless PostgreSQL provider for production deployment

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Unstyled, accessible component primitives
- **shadcn/ui**: Pre-built component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **FontAwesome**: Additional icons for categories and navigation

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast bundling for production builds
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

## Form & Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Schema validation library for runtime type checking
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Utilities
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional class name composition
- **nanoid**: Unique ID generation for client-side operations