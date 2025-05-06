# Architecture Overview

## Overview

This is a full-stack web application built with a modern React frontend and Express.js backend. The application serves as an appointment management system that integrates with Formsite for form submissions and stores data in a PostgreSQL database.

The system allows users to view, filter, and manage appointments, with additional analytics functionality. It has a modular architecture with clear separation between client and server components.

## System Architecture

The application follows a traditional client-server architecture with the following key layers:

1. **Frontend**: A React single-page application (SPA) built with TypeScript and Tailwind CSS
2. **Backend**: Express.js REST API with endpoints for appointment management
3. **Data Access**: Drizzle ORM for database operations with PostgreSQL
4. **External Integration**: API integration with Formsite for form submission and data retrieval

### Architecture Diagram

```
┌────────────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│                │     │               │     │               │     │              │
│  React Client  │────▶│  Express API  │────▶│  Drizzle ORM  │────▶│  PostgreSQL  │
│                │     │               │     │               │     │              │
└────────────────┘     └───────┬───────┘     └───────────────┘     └──────────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │                │
                      │  Formsite API  │
                      │                │
                      └────────────────┘
```

## Key Components

### Frontend

The frontend is organized as follows:

1. **Pages**: Main views of the application
   - Dashboard (appointment list view)
   - AppointmentDetails (detailed view of a single appointment)
   - Analytics (data visualization and reporting)
   - AppForm (embedded Formsite form for appointment creation)

2. **Components**: Reusable UI elements
   - UI components from shadcn/ui library
   - Custom components for specific application needs (FilterSection, AppointmentTable, etc.)

3. **State Management**: React Query for server state management
   - Queries and mutations for data fetching and updates
   - Client-side filtering and sorting of appointment data

4. **Routing**: wouter library for client-side routing
   - Lightweight alternative to React Router

### Backend

The backend API is built with Express.js and provides the following functionality:

1. **API Routes**:
   - `/api/appointments` - List/filter appointments
   - `/api/appointments/:id` - Get a specific appointment

2. **External Integration**: 
   - Formsite API integration for retrieving appointment data
   - Webhook handler for processing form submissions

3. **Data Access Layer**:
   - Drizzle ORM for database operations
   - Storage interface for all data operations

### Database Schema

The database schema includes the following main tables:

1. **users**: Authentication information
   - id (PK)
   - username
   - password

2. **appointments**: Core appointment data
   - id (PK) - Formsite ID
   - Client information (name, phone, email)
   - Location details (address, city, etc.)
   - Appointment timing (start/end dates and times)
   - Financial information (revenue, payments)

### External Integrations

The application integrates with the Formsite API for:
1. Retrieving appointment data from submitted forms
2. Handling webhooks for form submissions
3. Embedding forms directly in the application interface

## Data Flow

### Appointment Creation Flow

1. User fills out a form in the embedded Formsite form
2. Form submission triggers a webhook to the application
3. Backend processes the webhook and creates/updates an appointment in the database
4. Frontend refreshes to display the new/updated appointment

### Appointment Viewing Flow

1. User accesses the Dashboard
2. Frontend sends a request to `/api/appointments` (with optional filters)
3. Backend retrieves appointments (from database or Formsite API)
4. Frontend renders the appointments list
5. User can select an appointment to view detailed information

### Appointment Updates

1. User can reschedule, complete, or cancel appointments through action buttons
2. These actions open the relevant Formsite form pre-filled with appointment data
3. Form submission triggers a webhook
4. Backend processes the webhook to update the appointment

## External Dependencies

### Frontend Dependencies

- React and React DOM for UI
- Tailwind CSS for styling
- shadcn/ui for UI components (based on Radix UI)
- Lucide for icons
- React Query for data fetching and caching
- Recharts for data visualization
- wouter for routing

### Backend Dependencies

- Express.js for API server
- Drizzle ORM for database operations
- NeonDB serverless client for PostgreSQL
- zod for data validation

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Environment**:
   - `npm run dev` starts the development server
   - Vite used for frontend development

2. **Production Build**:
   - `npm run build` builds both frontend and backend
   - Frontend: Vite bundles React application
   - Backend: esbuild bundles the server code

3. **Production Deployment**:
   - Static frontend assets served by Express
   - API endpoints handled by the same Express server
   - NeonDB for PostgreSQL database

4. **Database Management**:
   - Drizzle ORM for migrations and schema management
   - Schema changes pushed via `drizzle-kit push`
   - Migration script (`db-push.js`) for database initialization

The deployment is optimized for a serverless environment, with the NeonDB serverless PostgreSQL client and a single Express server handling both API requests and serving static assets.