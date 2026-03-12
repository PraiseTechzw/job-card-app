-- Database Schema for CardFlow
-- Use this to set up your PostgreSQL database (Supabase, Vercel Postgres, etc.)

CREATE TABLE job_cards (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    requested_by TEXT NOT NULL,
    date_raised TEXT NOT NULL,
    time_raised TEXT NOT NULL,
    priority TEXT NOT NULL,
    required_completion_date TEXT,
    plant_number TEXT,
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
    cause_of_failure TEXT,
    machine_downtime TEXT,
    num_artisans INTEGER DEFAULT 0,
    num_apprentices INTEGER DEFAULT 0,
    num_assistants INTEGER DEFAULT 0,
    spares_ordered TEXT,
    spares_withdrawn TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE allocations (
    id TEXT PRIMARY KEY,
    supervisor TEXT NOT NULL,
    section TEXT NOT NULL,
    date TEXT NOT NULL,
    artisan_name TEXT NOT NULL,
    allocated_task TEXT NOT NULL,
    job_card_number TEXT,
    estimated_time TEXT,
    actual_time_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
