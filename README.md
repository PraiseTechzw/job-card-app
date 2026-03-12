# Job Card System: Factory Management Solution

The Job Card System is a complete web-based Job Card Management System designed to digitize paper-based factory maintenance procedures. It maintains the original workflow and forms precisely, ensuring a seamless transition from manual to digital operations.

## 🚀 Project Overview

The system captures all phases of a maintenance job, from the initial defect report by an originator to the final sign-off and closure by supervisors. It provides role-based dashboards, a lifecycle workflow tracker, and printable digital "paper" forms.

### 🛠 Technology Stack

- **Frontend**: React 19 (Hooks, Context API)
- **Language**: TypeScript
- **Backend**: Node.js Express (Hosted via Vercel Serverless Functions)
- **Database**: PostgreSQL (Neon Cloud Console)
- **Styling**: Vanilla CSS with HSL-tailored Design System
- **Icons**: Lucide React
- **Data Layer**: Axios with real-time sync to Cloud PostegreSQL

---

## 👥 Roles & Responsibilities

| Role | Responsibilities |
| :--- | :--- |
| **Initiator / Requester** | Raises new Job Cards, describes defects, and performs final sign-off. |
| **Supervisor** | Approves initial requests and performs final system closure of Job Cards. |
| **HOD (Head of Dept)** | Secondary high-level approval for maintenance work. |
| **Planning Office** | Registers Job Cards in the central maintenance planning system. |
| **Engineering Supervisor** | Assigns specific Artisans/Technicians to the job. |
| **Artisan / Technician** | Executes the work, provides feedback, and logs resource usage. |

---

## 🔄 Job Card Lifecycle

The system enforces a strict workflow as defined in the factory procedure:

1. **Draft**: Form being filled by Initiator.
2. **Pending Approval**: Submitted and waiting for Supervisor/HOD review.
3. **Approved**: Work is authorized.
4. **Registered**: Planning office has logged the job in the schedule.
5. **Assigned**: Engineering supervisor has designated an Artisan.
6. **In Progress**: Work is currently being executed on-site.
7. **Completed**: Artisan has finished work and filled the Back Form.
8. **SignedOff**: Initiator has verified and signed off on the repair.
9. **Closed**: Supervisor has performed the final administrative closure.

---

## 📄 Key Data Structures

### 1. Job Card Front Form (The Request)

- **Generation Details**: Job Card # (Auto-gen), Requester, Date/Time Raised.
- **Priority**: Low, Medium, High, Critical (Breakdown).
- **Asset Info**: Plant Number, Description, Plant Status (Run/Shut).
- **Work Request**: Defect details, maintenance schedule links, and instructions.
- **Section Allocation**: Trade categories (Fitting, Electrical, etc.).

### 2. Job Card Back Form (The Execution)

- **Work Feedback**: Detailed description of work done.
- **Labour Tracking**: Table for Artisans, Dates, and Hours Worked.
- **Failure Analysis**: Breakdown status, Cause of Failure, Machine Downtime.
- **Resources**: Spares ordered, spares withdrawn, and further work requirements.

### 3. Daily Work Allocation Register

A supervisor-level digital log to track artisan loads:

- Artisan Name
- Allocated Task / Job Card Reference
- Estimated vs. Actual Time Taken
- Section/Departmental tracking

---

## 💾 Backend & Cloud Architecture

The application is powered by a **Full-Stack Cloud Architecture**:

- **Vercel Serverless**: The API is hosted in the `api/` directory, automatically scaling as serverless functions.
- **Neon PostgreSQL**: A cloud-native relational database provides persistent storage.
- **Data Mapper**: A custom middleware handles **camelCase (Frontend)** to **snake_case (Database)** mapping automatically.
- **Sync Engine**: `JobCardContext.tsx` handles asynchronous state synchronization with intelligent offline fallbacks.

### Cloud Setup

1. **Environment Variables**: The system requires a `DATABASE_URL` entry in your `.env` or Vercel settings.
2. **Schema Sync**: Run `node init-db.mjs` to automatically synchronize the latest table structures with your cloud database.

---

## 🖥️ UI & UX Design Philosophy

- **Premium Aesthetics**: High-contrast dark mode using curated HSL colors, smooth transitions, and glassmorphism.
- **Paper-Like Experience**: Official forms (Front/Back) are styled to resemble physical paper when viewed or printed, reducing training time for staff used to the old system.
- **Print Efficiency**: Custom `@media print` CSS ensures that printing Job Cards for site use or physical filing results in professional, formatted documents without UI sidebars or buttons.

---

## 🔨 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone [repository-url]
   cd job-card-app
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run Development Server**:

   ```bash
   npm run dev
   ```

4. **Build for Production**:

   ```bash
   npm run build
   ```
