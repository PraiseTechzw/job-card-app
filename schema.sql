-- Database Schema for Job Card System
-- Use this to set up your PostgreSQL database (Supabase, Vercel Postgres, etc.)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_cards (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    requested_by TEXT NOT NULL,
    date_raised TEXT NOT NULL,
    time_raised TEXT NOT NULL,
    priority TEXT NOT NULL,
    required_completion_date TEXT,
    plant_number TEXT,
    plant_number_text TEXT,
    plant_description TEXT,
    plant_status TEXT,
    defect TEXT,
    maintenance_schedule TEXT,
    work_request TEXT,
    allocated_trades JSONB,
    status TEXT NOT NULL DEFAULT 'Draft',
    -- Back form fields
    work_done_details TEXT,
    is_breakdown BOOLEAN DEFAULT FALSE,
    resource_usage JSONB DEFAULT '[]',
    date_finished TEXT,
    start_hours TEXT,
    cause_of_failure TEXT,
    machine_downtime TEXT,
    num_artisans INTEGER DEFAULT 0,
    num_apprentices INTEGER DEFAULT 0,
    num_assistants INTEGER DEFAULT 0,
    has_history BOOLEAN DEFAULT FALSE,
    further_work_required TEXT,
    supervisor_comments TEXT,
    spares_ordered JSONB DEFAULT '[]',
    spares_withdrawn JSONB DEFAULT '[]',
    originator_comment TEXT,
    originator_sign_off_date TEXT,
    originator_sign_off_time TEXT,
    closure_comment TEXT,
    closed_by_date TEXT,
    closed_by_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS allocation_sheets (
    id TEXT PRIMARY KEY,
    supervisor TEXT NOT NULL,
    section TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocation_rows (
    id TEXT PRIMARY KEY,
    sheet_id TEXT NOT NULL REFERENCES allocation_sheets(id) ON DELETE CASCADE,
    artisan_name TEXT NOT NULL,
    allocated_task TEXT NOT NULL,
    job_card_number TEXT,
    estimated_time TEXT,
    actual_time_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artisans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    phone TEXT,
    trade TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    job_card_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    job_card_id TEXT NOT NULL,
    artisan_name TEXT NOT NULL,
    artisan_phone TEXT,
    section TEXT,
    assigned_by TEXT NOT NULL,
    assigned_date TEXT NOT NULL,
    expected_start_date TEXT,
    expected_completion_date TEXT,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Assigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);