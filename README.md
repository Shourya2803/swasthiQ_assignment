# Appointment Scheduling and Queue Management (Feature B)

A complete, production-ready implementation of an appointment scheduling and queue management system with React + Tailwind CSS frontend and Python backend simulation.

## Overview

This project implements a full-featured appointment management system that allows healthcare providers to:

- View appointments filtered by date and status
- Navigate between Today/Upcoming/Past appointments
- Update appointment statuses in real-time
- Manage appointment queues efficiently

The implementation simulates a serverless architecture using AWS Lambda, AppSync (GraphQL), and Aurora PostgreSQL, while maintaining data consistency and real-time updates through subscription patterns.

## Architecture

### Backend (Python)
- **File**: `appointment_service.py`
- **Simulates**: AWS Lambda functions + Aurora PostgreSQL
- **Provides**: Query and mutation resolvers for appointment data
- **Data Layer**: In-memory lists/dicts (production would use PostgreSQL)

### Frontend (React + Tailwind CSS)
- **File**: `EMR_Frontend_Assignment.jsx`
- **Mock Service**: `appointmentServiceMock.js`
- **Framework**: React with functional components and hooks
- **Styling**: Tailwind CSS utility classes
- **Real-time Updates**: Optimistic UI updates simulating AppSync subscriptions

## GraphQL Contract

### Query: getAppointments

Retrieve appointments with optional filtering by date and status.

```graphql
query GetAppointments($date: String, $status: String) {
  getAppointments(date: $date, status: $status) {
    id
    name
    date
    time
    duration
    doctorName
    status
    mode
  }
}
```

**Parameters:**
- `date` (String, optional): Filter by date in `YYYY-MM-DD` format
- `status` (String, optional): Filter by status (`Confirmed`, `Scheduled`, `Upcoming`, `Cancelled`)

**Returns:** Array of appointment objects matching the filters

**Example:**
```graphql
# Get all confirmed appointments for December 15, 2025
query {
  getAppointments(date: "2025-12-15", status: "Confirmed") {
    id
    name
    doctorName
    time
  }
}
```

### Mutation: updateAppointmentStatus

Update the status of an existing appointment.

```graphql
mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
  updateAppointmentStatus(id: $id, status: $status) {
    id
    name
    status
    date
    time
    doctorName
  }
}
```

**Parameters:**
- `id` (ID!, required): The unique identifier of the appointment
- `status` (String!, required): The new status value

**Returns:** The updated appointment object

**Example:**
```graphql
mutation {
  updateAppointmentStatus(id: "apt002", status: "Confirmed") {
    id
    status
  }
}
```

## Data Consistency Model

### Transactional Writes (Aurora PostgreSQL)

In a production environment, the `update_appointment_status` function would execute the following sequence:

1. **BEGIN TRANSACTION** in Aurora PostgreSQL
2. Execute parameterized UPDATE query:
   ```sql
   UPDATE appointments 
   SET status = $1, updated_at = NOW() 
   WHERE id = $2 
   RETURNING *;
   ```
3. Validate the update was successful (1 row affected)
4. **COMMIT TRANSACTION** on success
5. **ROLLBACK** on any error or validation failure

This ensures ACID properties:
- **Atomicity**: Update completes fully or not at all
- **Consistency**: Database constraints are maintained
- **Isolation**: Concurrent updates don't interfere
- **Durability**: Committed changes persist

### Real-time Updates (AppSync Subscriptions)

After a successful transactional write, AppSync would publish an event to subscribed clients:

```graphql
subscription OnAppointmentUpdated {
  onAppointmentUpdated {
    id
    status
    name
    date
    time
  }
}
```

**Flow:**
1. Client subscribes to `onAppointmentUpdated` when component mounts
2. Mutation resolver completes Aurora transaction
3. Lambda function publishes event to AppSync
4. AppSync broadcasts to all active subscribers via WebSocket
5. Clients receive update and refresh UI without polling

### Simulation Implementation

In this assignment, data consistency is ensured through:

1. **Single Source of Truth**: The `APPOINTMENTS` array in both Python and JavaScript
2. **Synchronous Updates**: Direct mutation of the in-memory data structure
3. **Optimistic UI Updates**: Frontend immediately reflects changes, then confirms with backend
4. **Error Rollback**: Failed updates revert to previous state by re-fetching

The Python `update_appointment_status` function includes comments marking where:
- Aurora transactional writes would occur
- AppSync subscription events would be published

## Project Structure

```
swasthiQ_intern/
├── appointment_service.py          # Backend Python service
├── appointmentServiceMock.js       # JavaScript mock for frontend integration
├── EMR_Frontend_Assignment.jsx     # Main React component
├── package.json                    # Node.js dependencies
└── README.md                       # This file
```

## How to Run

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.10+ (for testing backend separately)
- Modern web browser

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

   Required packages:
   - `react` (^18.0.0)
   - `react-dom` (^18.0.0)
   - `tailwindcss` (^3.0.0)

2. **Configure Tailwind CSS:**

   Create `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
       "./EMR_Frontend_Assignment.jsx"
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. **Create main entry file** (`src/main.jsx` or `src/App.jsx`):
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import AppointmentManagementView from './EMR_Frontend_Assignment';
   import './index.css'; // Import Tailwind CSS

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <AppointmentManagementView />
     </React.StrictMode>
   );
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

5. **Open browser:**
   Navigate to `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)

### Backend Testing (Optional)

Test the Python backend service independently:

```bash
python appointment_service.py
```

This runs test scenarios demonstrating:
- Fetching all appointments
- Filtering by date
- Filtering by status
- Combined date + status filtering
- Updating appointment status

## Features Demonstrated

### 1. Date Filtering
- Calendar sidebar showing all available appointment dates
- Click any date to filter appointments
- Visual indication of selected date and today's date
- Clear filter button to reset to tab view

### 2. Status Tabs
- **Today**: Shows appointments scheduled for current date
- **Upcoming**: Shows all future appointments
- **Past**: Shows all historical appointments
- Tab switching with visual active state

### 3. Real-time Status Updates
- Multiple action buttons per appointment:
  - Confirm
  - Reschedule
  - Set Upcoming
  - Cancel
- Optimistic UI updates (immediate feedback)
- Error handling with rollback on failure
- Status badge with color coding

### 4. Rich UI Components
- Appointment cards with full details
- Status and mode badges
- Loading states with spinner
- Empty states with helpful messaging
- Error alerts with clear messaging
- Responsive grid layout

## Assumptions

- **Date Format**: All dates use `YYYY-MM-DD` format (ISO 8601)
- **Time Format**: 24-hour format (`HH:MM`)
- **Time Zones**: All times are in local timezone (production would use UTC)
- **Status Values**: Fixed set: `Confirmed`, `Scheduled`, `Upcoming`, `Cancelled`
- **Mode Values**: `In-Person` or `Video`
- **Duration**: Stored as integer minutes
- **Concurrent Updates**: Last-write-wins in simulation (production would use optimistic locking)

## Development Timeline

This is a **3-day assignment** with suggested breakdown:

- **Day 1**: Backend implementation, data modeling, query/mutation logic
- **Day 2**: Frontend component structure, data fetching, filtering logic
- **Day 3**: UI polish, status updates, testing, documentation

## Future Enhancements

For a production deployment, consider:

1. **Authentication**: Integrate AWS Cognito or similar
2. **Authorization**: Role-based access control (doctors, nurses, admin)
3. **Search**: Full-text search across patient names and doctors
4. **Pagination**: Implement cursor-based pagination for large datasets
5. **Caching**: Use Apollo Client cache or React Query
6. **Error Monitoring**: Integrate Sentry or CloudWatch
7. **Analytics**: Track appointment metrics and no-show rates
8. **Notifications**: SMS/Email reminders via SNS
9. **Calendar Integration**: Export to Google Calendar, Outlook
10. **Recurring Appointments**: Support for series/recurring patterns

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Push to Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Complete appointment management system"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Connect GitHub repository
   - Configure build command: `npm run build`
   - Configure output directory: `dist` (Vite) or `build` (CRA)
   - Deploy automatically on push

### Backend Deployment (AWS Lambda)

For production deployment:

1. Package Python function with dependencies
2. Create Lambda function with appropriate IAM role
3. Configure AppSync API with schema and resolvers
4. Set up Aurora Serverless PostgreSQL cluster
5. Configure VPC and security groups
6. Deploy via AWS SAM or Serverless Framework

## License

This project is created as part of a technical assessment for SwasthiQ internship.

## Contact

For questions or issues, please contact the development team.

---

**Built with ❤️ for SwasthiQ Health Systems**
