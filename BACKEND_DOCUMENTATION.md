# Backend & System Architecture Documentation

This document provides a detailed technical breakdown of the CardFlow system's data architecture, state management, and the projected backend implementation requirements.

## 1. System Architecture

CardFlow currently follows a **Single Page Application (SPA)** architecture with a decoupled data layer.

- **Storage Layer**: `localStorage` for persistent browser storage.
- **State Management**: React Context API (`JobCardContext`) acting as the "Controller".
- **Views**: React components for Front/Back forms and registers.

## 2. Data Models (Schema)

### Job Card Object
```typescript
interface JobCard {
  id: string;               // PK
  ticketNumber: string;     // Unique formatted ID
  requestedBy: string;      // User reference
  dateRaised: string;
  timeRaised: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requiredCompletionDate: string;
  
  // Plant Information
  plantNumber: string;      // Asset ID
  plantDescription: string;
  plantStatus: 'Run' | 'Shut';
  
  // Work Scope
  defect: string;
  maintenanceSchedule: string;
  workRequest: string;
  allocatedTrades: Trade[]; // Array of categories
  
  // Workflow Progress
  status: JobCardStatus;
  approvedBySupervisor?: string;
  approvedByHOD?: string;
  issuedTo?: string;        // Artisan reference
  registrationPlanning?: string;
  originatorSignOff?: string;
  closedBy?: string;
  
  // Back Form (Work Completion)
  workDoneDetails?: string;
  isBreakdown?: boolean;
  resourceUsage: ResourceUsage[]; // Sub-collection
  dateFinished?: string;
  causeOfFailure?: string;
  machineDowntime?: string;
  numArtisans?: number;
  numApprentices?: number;
  numAssistants?: number;
  sparesOrdered?: string;
  sparesWithdrawn?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### Daily Work Allocation Object
```typescript
interface DailyWorkAllocation {
  id: string;
  supervisor: string;
  section: string;
  date: string;
  artisanName: string;
  allocatedTask: string;
  jobCardNumber: string;
  estimatedTime: string;
  actualTimeTaken?: string;
}
```

## 3. Recommended Production Backend Stack

To move from the current demo state to a multi-user production environment, the following stack is recommended:

- **Database**: PostgreSQL (Relational integrity is crucial for workflow transitions).
- **API**: Node.js with Express or NestJS.
- **Auth**: JWT (JSON Web Tokens) for role-based session management.
- **File Storage**: AWS S3 or Supabase Storage (if attachment support for photos/manuals is added).

### 4. Proposed REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/job-cards` | List all job cards with filters | All |
| `POST` | `/api/job-cards` | Create a new request | Initiator/Admin |
| `GET` | `/api/job-cards/:id` | Get full details including back form | All |
| `PATCH` | `/api/job-cards/:id` | Update status or fill work details | Role Specific |
| `GET` | `/api/allocations` | Get today's work register | Supervisor/Admin |
| `POST` | `/api/allocations` | Add new artisan allocation | Supervisor |
| `POST` | `/api/auth/login` | Roles-based authentication | All |

## 5. Security & Access Control

The backend must enforce **Row-Level Security (RLS)** or Middleware-based checks to ensure:
- Only **Supervisors** can hit the `Approved` endpoint.
- Only **Artisans** assigned to a job can edit the `ResourceUsage` sub-collection.
- **Sign-offs** cannot be edited once the status is `Closed`.

## 6. Audit Trail Plan
For factory compliance (ISO 9001), a production backend should implement an `AuditLogs` table:
- `timestamp`: Date/Time of change.
- `userId`: Who made the change.
- `action`: `STATUS_CHANGE`, `FIELD_UPDATE`, etc.
- `oldValue` / `newValue`: JSON snapshots of the changes.
