# Backend & Cloud Architecture Documentation

This document provides a detailed technical breakdown of the CardFlow system's data architecture, cloud synchronization, and PostgreSQL integration.

## 1. System Architecture

CardFlow utilizes a **Serverless Full-Stack Architecture** designed for high availability and zero-maintenance scaling on Vercel.

- **Data Layer**: Cloud-native PostgreSQL (Neon).
- **Compute Layer**: Node.js Serverless Functions (`api/` directory).
- **Frontend Sync**: Axios-based asynchronous communication with local persistence fail-safes.

## 2. Advanced Data Mapping

To bridge the gap between Frontend conventions (**camelCase**) and Database conventions (**snake\_case**), the API implements a custom middleware layer:

- **Automatic Translation**: All incoming requests are converted to `snake_case` before hitting SQL queries.
- **Reverse Mapping**: All database results are converted back to `camelCase` before being sent to the React frontend.
- **Consistency**: This ensures that developers can use standard JavaScript naming conventions without compromising database best practices.

## 3. Database Schema (PostgreSQL)

### Job Cards Table (`job_cards`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT (PK)` | Unique system ID. |
| `ticket_number` | `TEXT (Unique)` | Formatted reference (e.g., JC-2024-001). |
| `requested_by` | `TEXT` | Name of originator. |
| `priority` | `TEXT` | Low, Medium, High, Critical. |
| `plant_number` | `TEXT` | Asset identification code. |
| `allocated_trades` | `JSONB` | Array of trade categories. |
| `resource_usage` | `JSONB` | Complex array of labour tracking records. |
| `status` | `TEXT` | Current stage in the 9-stage workflow. |

### Allocations Table (`allocations`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT (PK)` | Unique record ID. |
| `supervisor` | `TEXT` | Supervisor making the allocation. |
| `artisan_name` | `TEXT` | Technician assigned to the task. |
| `estimated_time` | `TEXT` | Planned duration. |
| `actual_time_taken` | `TEXT` | Final logged duration. |

## 4. Environment Configuration

The backend is configured via a single `DATABASE_URL` environment variable.

- **Local Development**: Stored in `.env` (Ignored by Git).
- **Production**: Configured in the **Vercel Project Dashboard** ➔ Settings ➔ Environment Variables.

## 5. Schema Synchronization

The project includes an intelligent migration tool `init-db.mjs`.

- **Usage**: `node init-db.mjs`
- **Function**: Reads `schema.sql`, connects to your live cloud database, and ensures all tables and relationships are created correctly.
- **Safe Execution**: Can be run multiple times; it will create tables only if they don't exist.

## 6. Secure Hosting on Vercel

The `vercel.json` configuration file ensures:
1. All client-side routing is handled by the React SPA.
2. All `/api/*` requests are correctly routed to the serverless function in `api/index.js`.
3. Serverless functions are optimized for the specified runtime environment.
