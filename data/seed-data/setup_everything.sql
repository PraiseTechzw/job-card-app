-- MASTER SETUP & SEED DATA
-- Generated from Excel Source Files

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
    issued_to TEXT,
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

BEGIN;

-- Seed Default System Users
INSERT INTO users (id, name, username, password_hash, role) VALUES ('admin-1', 'Praise Masunga', 'pmasunga', '$2b$10$Vh0ioaR.q6UIcOphOIs/4eImU3bkxp4rYT7e8ttpwLxA8khKEQRfC', 'Admin') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role) VALUES ('super-1', 'Production Supervisor', 'production_super', '$2b$10$Vh0ioaR.q6UIcOphOIs/4eImU3bkxp4rYT7e8ttpwLxA8khKEQRfC', 'Supervisor') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role) VALUES ('plan-1', 'Planning Officer', 'planning_office', '$2b$10$Vh0ioaR.q6UIcOphOIs/4eImU3bkxp4rYT7e8ttpwLxA8khKEQRfC', 'PlanningOffice') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role) VALUES ('init-1', 'Maintenance Initiator', 'initiator', '$2b$10$Vh0ioaR.q6UIcOphOIs/4eImU3bkxp4rYT7e8ttpwLxA8khKEQRfC', 'Initiator') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role) VALUES ('art-1', 'Lead Artisan', 'artisan', '$2b$10$Vh0ioaR.q6UIcOphOIs/4eImU3bkxp4rYT7e8ttpwLxA8khKEQRfC', 'Artisan') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role) VALUES ('hod-1', 'Dept. Manager', 'manager', '$2b$10$Vh0ioaR.q6UIcOphOIs/4eImU3bkxp4rYT7e8ttpwLxA8khKEQRfC', 'HOD') ON CONFLICT (username) DO NOTHING;

-- Seed Artisans with SMS enabled numbers
INSERT INTO artisans (id, name, phone) VALUES ('rkmobc6y4', 'BVUNDE B.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('t5m0pqine', 'CHAGOMOKA R.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('cs08gv007', 'CHAKANYUKA K.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('c070pa89k', 'CHIRINDA L.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('2npgir2el', 'CHIWERE A.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('oa7h8kdng', 'DUBE', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('iojnq473i', 'GAMBE C.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('q6wfz9poq', 'GAPARE A.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('tiq9lxh5p', 'GATSI. F.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('c4co9y4zx', 'GORE E.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ow76fy48i', 'HWEZA I.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('hyzk8n218', 'MABIYA L.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('asetgcna7', 'MALIANGA A.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('6fq6jo0nj', 'MAPFINYA J.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('2ylzq6ecs', 'MASINGA S.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ujm2b8ajj', 'MAZAI T.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('l04gbf8nk', 'MHANGAMI B.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('kov7rn4v7', 'MOFFAT I.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('xlsg5znx2', 'MUKAZHI E.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('cp2xcy2s2', 'MUNDANDI K.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('i13i1m81v', 'MUZEMBE E.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('164fc43wa', 'NYANYIWA L.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('9mpgcmwlj', 'SAIDE I.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('lskmeep9n', 'SHORIWA S.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('puzkj834v', 'SIMANGO P.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('kztdqpjqy', 'TIMBE K.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('1yrkvlmg0', 'WATSIKA A.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('3p02pqygr', 'ZINYAMA S.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;

INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dbtz1iuqh', 'JC-HIST-Work Done', 'Historical Import', '2026-03-01', '08:00', 'Medium', 'Time Taken', 'Time Taken', 'Artisan', 'Closed', 'CHIWERE A.', '2026-03-01', 'Jorb Card Number') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('blkregjpo', 'dbtz1iuqh', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('e4vtqc9kg', 'JC-HIST-TERMINATED BROKEN CABLE AFTER CHECKING CONTACTOR, HEATER AND POWER SUPPLY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUNDANDI K.', 'Closed', 'DUBE', '2026-03-01', '72808') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('aoe46a926', 'e4vtqc9kg', 'DUBE', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('qn9daij2e', 'JC-HIST-readjusted temposonic magnet on injection unit', 'Historical Import', '2026-03-01', '08:00', 'Medium', '28', '28', 'WATSIKA A.', 'Closed', 'GAMBE C.', '2026-03-01', '74822') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g6o6m1f8m', 'qn9daij2e', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bfkhq5xlh', 'JC-HIST-TROUBLESHOOTING. FAULTY CONTACTOR', 'Historical Import', '2026-03-01', '08:00', 'Medium', '150', '150', 'WATSIKA A.', 'Closed', 'GAPARE A.', '2026-03-01', '74688') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('30rktv3dw', 'bfkhq5xlh', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('revi1qwmb', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'GATSI. F.', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '74803') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('l3un5awfq', 'revi1qwmb', 'GATSI. F.', '0779233526', 'System', 'ALARM-FAULTY EMERGENCY STOP SWITCH', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('8l4p5bcas', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'GORE E.', '2026-03-01', '74647') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xtgduyta9', '8l4p5bcas', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('0opwagfie', 'JC-HIST-TIGHTENED ALL LOOSE COMMUNICATION CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'WATSIKA A.', 'Closed', 'HWEZA I.', '2026-03-01', '74642') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('6a1g6f6y7', '0opwagfie', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nxzbhezqb', 'JC-HIST-checked air conditioner on the electric board and found 1 fan faulty', 'Historical Import', '2026-03-01', '08:00', 'Medium', '110', '110', 'MUNDANDI K.', 'Closed', 'MABIYA L.', '2026-03-01', '74722') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('d0d5skw1n', 'nxzbhezqb', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ga9s2nr6f', 'JC-HIST-repaired dammaged suction pipe', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'WATSIKA A.', 'Closed', 'MALIANGA A.', '2026-03-01', '74640') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('hrkg4yyxh', 'ga9s2nr6f', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jeag7pmr3', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '25', '25', 'WATSIKA A.', 'Closed', 'MAPFINYA J.', '2026-03-01', '74678') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('qk6njhn2d', 'jeag7pmr3', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('13ad9ngfc', 'JC-HIST-replaced blown fuses', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'MASINGA S.', '2026-03-01', '74709') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('u34q4ovw9', '13ad9ngfc', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3yu1y2x12', 'JC-HIST-changed pump VT card', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'MAZAI T.', '2026-03-01', '74655') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('zk2xz1hhr', '3yu1y2x12', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vl0h064f9', 'JC-HIST-Replaced switched overload', 'Historical Import', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '08:00', 'Medium', '120', '120', 'WATSIKA A.', 'Closed', 'MHANGAMI B.', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '74653') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('l63vaw56y', 'vl0h064f9', 'MHANGAMI B.', '0774551882', 'System', 'ALARM-FAULTY EMERGENCY STOP SWITCH', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('awwkhlcgt', 'JC-HIST-REWIRED THE WHOLE CIRCUIT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'WATSIKA A.', 'Closed', 'MOFFAT I.', '2026-03-01', '72815') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('kljb3ip38', 'awwkhlcgt', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('231b8val7', 'JC-HIST-CARRIED OUT 720HR MAINTENANCE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'CHAGOMOKA R., WATSIKA', 'Closed', 'MUKAZHI E.', '2026-03-01', '71427') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('bq233h4mr', '231b8val7', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('atm6q60pk', 'JC-HIST-CHANGED CLAMP LOCK MODULE', 'Historical Import', 'CLOSE PROBLEM-BLOW MOULD OPEN', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'MUNDANDI K.', 'CLOSE PROBLEM-BLOW MOULD OPEN', '74191') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('mue7v6u2q', 'atm6q60pk', 'MUNDANDI K.', '0774551882', 'System', 'CLOSE PROBLEM-BLOW MOULD OPEN', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('yuw9jcd80', 'JC-HIST-CLEANED CLOGGED VALVE, SWAPPED SOLENOID VALVES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'MUZEMBE E.', '2026-03-01', '73746') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4n6k9kzy8', 'yuw9jcd80', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9zlxyr9wz', 'JC-HIST-SWAPPED MODULES FOR CLAMP LOCK', 'Historical Import', '2026-03-01', '08:00', 'Medium', '20', '20', 'WATSIKA A.', 'Closed', 'NYANYIWA L.', '2026-03-01', '72779') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dhhdae8uf', '9zlxyr9wz', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('z5hzlc3kk', 'JC-HIST-reconnected battery terminal', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'SAIDE I.', '2026-03-01', '72777') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ee0v5s9fp', 'z5hzlc3kk', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('c0vmwq9se', 'JC-HIST-REPLACED SHORT CIRCUITED HEATERS ON CAVITY 7, REPLACED BLOWN FUSES ON CAVITY 4 & 11', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '360', '360', 'WATSIKA A.', 'Closed', 'SHORIWA S.', 'NOZZLE HEATERS-FAULTY BARREL', '74241') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1wcorerhn', 'c0vmwq9se', 'SHORIWA S.', '0779233526', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('0xp74ttvp', 'JC-HIST-REMOVED ACCUMULATED MATERIALON CABLES, REPAIRED DAMAGED CABLES, LUBRICATED MOTOR BEARINGS AND SLIDING PARTS, CHANGED INSERTION TURRET PISTON SEALS, ADJUSTED CUTTERS. CARRIED OUT MAINTENACE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '360', '360', 'CHAGOMOKA R., WATSIKA', 'Closed', 'SIMANGO P.', '2026-03-01', '73540') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('e7bxba9x0', '0xp74ttvp', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('fx8a4czcv', 'JC-HIST-greased volumetric pump coupling, gearbox motor, SFM centre bearings, cleaned insertion turret an d replaced worn out gaskets, replaced leaking air pipes', 'Historical Import', '2026-03-01', '08:00', 'Medium', '360', '360', 'CHAGOMOKA R.', 'Closed', 'TIMBE K.', '2026-03-01', '70607') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('tmp9zf6ui', 'fx8a4czcv', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mpnj6t8hi', 'JC-HIST-REPLACED O-RING, SOLDERED BROKEN TRANSDUCER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '105', '105', 'GATSI. F., GORE E', 'Closed', 'WATSIKA A.', '2026-03-01', '73953') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('5zwkv4as1', 'mpnj6t8hi', 'WATSIKA A.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ekdk2x3gp', 'JC-HIST-maintenance done', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'GATSI. F.', 'Closed', 'ZINYAMA S.', '2026-03-01', '73531') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3hx5buj3h', 'ekdk2x3gp', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('5bbt51vdf', 'JC-HIST-Replaced oil filters and greased all moving parts. Maintenance done as per checklist', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'CHIRINDA L., MABIYA L', 'Closed', 'BVUNDE B.', '2026-03-01', '73528') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('pqejuzeoy', '5bbt51vdf', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('rhunk20ei', 'JC-HIST-CARRIRED OUT MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '135', '135', 'TIMBE K., BVUNDE, HWEZA', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '73525') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cqk5izg44', 'rhunk20ei', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('xki0e4x0i', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'HWEZA I.', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '73523') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g8qavft2o', 'xki0e4x0i', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('v9y4vsia6', 'JC-HIST-CARRIED OUT MAINTENANCE ON DBs', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MUNDANDI K.', 'Closed', 'CHIRINDA L.', '2026-03-01', '73521') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('caiefd4ei', 'v9y4vsia6', 'CHIRINDA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mt55bl131', 'JC-HIST-SERVICED DBs', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MABIYA L.', 'Closed', 'CHIWERE A.', '2026-03-01', '73522') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rltt57xsa', 'mt55bl131', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('538haizh4', 'JC-HIST-Maintenance done', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHAGOMOKA R.', 'Closed', 'DUBE', '2026-03-01', '73517') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('jsyq8uchq', '538haizh4', 'DUBE', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('xbxlmq40p', 'JC-HIST-FIXED 2 LEAKS, CHARGED SYSTEM, CLEANED CONDENSORS AND FILTERS FOR BOTH CHILLER AND DRIER, CHECKED EQUIPMNET AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MALIANGA A., MAZAI', 'Closed', 'GAMBE C.', '2026-03-01', '73516') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('n59n5yf8a', 'xbxlmq40p', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('4luqik3ow', 'JC-HIST-CHECKED PRESSURES, CLEANED CONDENSORS, LEAK TESTING, CHECKING VIBRATIONS, CHECKE REFRIGERANT LEVELS, CHECKED OIL LEVELS ON COMPRESSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'MALIANGA A.', 'Closed', 'GAPARE A.', '2026-03-01', '73515') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('j5cdud3i4', '4luqik3ow', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('n61bjlzr5', 'JC-HIST-TESTED FOR POWER, TESTED CAPACITOR FUNCTIONALITY, DISCONNECTED MOTOR AND TESTED MOTOR WINDINGS. MOTOR SENT OUT FOR REPAIRS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'TIMBE K.', 'Closed', 'GATSI. F.', '2026-03-01', '73191') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cy70xsg30', 'n61bjlzr5', 'GATSI. F.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('rpzj8feo5', 'JC-HIST-CARRIED OUT MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'CHAGOMOKA R., MUNDANDI', 'Closed', 'GORE E.', '2026-03-01', '73507') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('99n92hi38', 'rpzj8feo5', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mzylvvbpy', 'JC-HIST-CHANGED LEAKING VALVE ON HYDRAULIC WATER BOOSTER PUMP, CLEANED FILTERS, CHANGED DAMAGED FILTER SHELL FOR KM1&2 CHILLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'MALIANGA A.', 'Closed', 'HWEZA I.', '2026-03-01', '73184') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('nt278z3t8', 'mzylvvbpy', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mvzzzu3zy', 'JC-HIST-DILL ALL POSSIBLE CHECKS AS MACHINE WAS SWITCHED OFF', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'TIMBE K.', 'Closed', 'MABIYA L.', '2026-03-01', '73505') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('6ehk51r4j', 'mvzzzu3zy', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('n1t4l96tx', 'JC-HIST-Changed compressor on TC180 chiller, cleaned condensers, checked oil level and refrigerant pressures, checked intergrity of electrical circuits, cleaned water filters.', 'Historical Import', '2026-03-01', '08:00', 'Medium', '1080', '1080', 'MALIANGA A., MAZAI', 'Closed', 'MALIANGA A.', '2026-03-01', '73503') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cbv1ryddj', 'n1t4l96tx', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ic5y9w10g', 'JC-HIST-ADJUSTED AND SECURED MAGNETIC SENSOR (UP), CHECKED BOTH CYLINDERS FOR CORRECT OPERATION (BYPASS), CHANGED PNEUMATIC VALVE FOR RECEIPT UNIT UP MOVEMENT WITH A NEW ONE', 'Historical Import', 'DOWN-RECEIPT UNIT UP', '08:00', 'Medium', '30', '30', 'TIMBE K.', 'Closed', 'MAPFINYA J.', 'DOWN-RECEIPT UNIT UP', '73907') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('d9pnlfdmi', 'ic5y9w10g', 'MAPFINYA J.', '0774551882', 'System', 'DOWN-RECEIPT UNIT UP', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('22hmg4kp2', 'JC-HIST-ADJUSTED SENSOR TO LEAE 2-4MM SENSING DISTANCE WITH ACTUATOR, CHECKED CABLE FOR DAMAGE, FIXED LOOSE CONNECTION, CHANGED HYDRAULIC VALVE ON BLOW PIN MOVEMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'TIMBE K., GATSI F.', 'Closed', 'MASINGA S.', '2026-03-01', '73484') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('prdgjsjqj', '22hmg4kp2', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('pxrbawv8u', 'JC-HIST-CARRIED OUT 8000HR SERVICE AND REPLACED FAULTY CONTROLLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '600', '600', 'MAZAI T.; MALIANGA A.', 'Closed', 'MAZAI T.', '2026-03-01', '71423') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('yqbpmpvtl', 'pxrbawv8u', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k3vqgv8r0', 'JC-HIST-CARRIED OUT 8000HR SERVICE AND CLEANED AIR AND OIL COOLERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'MAZAI T.; MALINAG A.', 'Closed', 'MHANGAMI B.', '2026-03-01', '71422') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rt8hvsuet', 'k3vqgv8r0', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('g1carepee', 'JC-HIST-CHECKED FUNCTIONALITY, CHECKED VOLTAGE. THERE WAS OVER VOLTAGE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MALIANGA A.', 'Closed', 'MOFFAT I.', '2026-03-01', '70108') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xnxcrykpi', 'g1carepee', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('qpqn87xfc', 'JC-HIST-seperated mould, removed and cleaned tip', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUKAZHI E.', 'Closed', 'MUKAZHI E.', '2026-03-01', '72661') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dncsguwea', 'qpqn87xfc', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('c2lgd9hp3', 'JC-HIST-CHECKED MOTOR FOR POWER AND FUNCTIONALITY, TRACED SIGNAL TO PLC. NO 24VDC SIGNAL FROM PLC', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'TIMBE K.', 'Closed', 'MUNDANDI K.', '2026-03-01', '72618') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7kqf9hxva', 'c2lgd9hp3', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gedo6vi8g', 'JC-HIST-REPLACED CONE RING, FIXED WATER LEAK ON AFFECTED CAVITIES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'GAMBE C.', 'Closed', 'MUZEMBE E.', '2026-03-01', '73060') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('j4nve8t2h', 'gedo6vi8g', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('20yuz0ozk', 'JC-HIST-WORK DONE A SPER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'BVUNDE B., HWEZA I', 'Closed', 'NYANYIWA L.', '2026-03-01', '71404') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('b456a8wz6', '20yuz0ozk', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('xtdalnofd', 'JC-HIST-WORK DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'TIMBE K.; MUNYA', 'Closed', 'SAIDE I.', '2026-03-01', '71403') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('jvy0k0oim', 'xtdalnofd', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ping6b9xh', 'JC-HIST-DONE MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'HWEZA I.', 'Closed', 'SHORIWA S.', '2026-03-01', '71402') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('toszaay6a', 'ping6b9xh', 'SHORIWA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('komjfl26v', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST,', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'GATSI. F.', 'Closed', 'SIMANGO P.', '2026-03-01', '71410') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('bnnm8kdiu', 'komjfl26v', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('d2x52whe6', 'JC-HIST-CHECKED FOR SIGNALS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'TIMBE K.', '2026-03-01', '72993') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('hbjejaiv8', 'd2x52whe6', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('kapdu24nq', 'JC-HIST-IDENTIFIED AND FIXED BROKEN HEATER CABLE', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '30', '30', 'PASIRAYI', 'Closed', 'WATSIKA A.', 'NOZZLE HEATERS-FAULTY BARREL', '73556') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cwy15tq5e', 'kapdu24nq', 'WATSIKA A.', '0779233526', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('t1rb7vxep', 'JC-HIST-POLISHED BURS ON CAVITY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUYAMBO G.', 'Closed', 'ZINYAMA S.', '2026-03-01', '72970') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('eqdmgtly6', 't1rb7vxep', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('x15molx0u', 'JC-HIST-REPLACED VACCUM PUMP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MHANGAMI B.', 'Closed', 'BVUNDE B.', '2026-03-01', '70687') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('t6vgr420e', 'x15molx0u', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('w7afpus0o', 'JC-HIST-RESET TRIPPED BREAKER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '45', '45', 'PASIRAYI', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '72950') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ptr2d7tkq', 'w7afpus0o', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gkt5lr1oy', 'JC-HIST-RESET OVERLOAD', 'Historical Import', '2026-03-01', '08:00', 'Medium', '45', '45', 'PASIRAYI', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '72949') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7iqty6all', 'gkt5lr1oy', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('s905ovb21', 'JC-HIST-TESTED ALL HEATERS, OK. ADJUSTED SETTINGS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'PASIRAYI', 'Closed', 'CHIRINDA L.', '2026-03-01', '72945') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('890o46jh9', 's905ovb21', 'CHIRINDA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('o4jhub9ra', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '210', '210', 'HWEZA I.+ DUBE+ GAMBE', 'Closed', 'CHIWERE A.', '2026-03-01', '70680') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('eb3dx2l4l', 'o4jhub9ra', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9dhb0jd0j', 'JC-HIST-NOT DONE', 'Historical Import', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', '08:00', 'Medium', 'Maintenance Job', 'Maintenance Job', 'PASIRAYI', 'Closed', 'DUBE', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', '73110') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('eodlemupw', '9dhb0jd0j', 'DUBE', '0779233526', 'System', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('wnju36li8', 'JC-HIST-REPLACED NOZZLE D HEATER AND SPRUE BUSH HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'PASIRAYI', 'Closed', 'GAMBE C.', '2026-03-01', '73102') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ihdw7ru3h', 'wnju36li8', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('d66brbqvv', 'JC-HIST-removed faulty sensor and connected new one', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'MUNDANDI K.', 'Closed', 'GAPARE A.', '2026-03-01', '72916') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1ispv5620', 'd66brbqvv', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ee8krfhqr', 'JC-HIST-WELDED LEAKING MANIFOLD', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'MALIANGA A.', 'Closed', 'GATSI. F.', '2026-03-01', '72326') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ulml7z9l9', 'ee8krfhqr', 'GATSI. F.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('znb4p9a43', 'JC-HIST-ADJUSTED WATER LEVEL SENSOR, CHECKED WATER LEVEL', 'Historical Import', ' COOLING TOWER-FAULTY CHILLER', '08:00', 'Medium', '30', '30', 'MALIANGA A.', 'Closed', 'GORE E.', ' COOLING TOWER-FAULTY CHILLER', '69446') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('w6vcay4iw', 'znb4p9a43', 'GORE E.', '0786223289', 'System', ' COOLING TOWER-FAULTY CHILLER', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bt5r4jpt7', 'JC-HIST-REPLACED FAULTY SOCKETS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'MUNDANDI K.', 'Closed', 'HWEZA I.', '2026-03-01', '69426') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ggkwxzjq0', 'bt5r4jpt7', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('sb4xadv9i', 'JC-HIST-REPLACED PROXIMITY INDUCTIVE SENSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '20', '20', 'HWEZA I.', 'Closed', 'MABIYA L.', '2026-03-01', '72551') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('fxy8x5vju', 'sb4xadv9i', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('p8bd4b8z6', 'JC-HIST-RETERMINATED BROKEN CABLES AND REPLACED BLOWN UP FUSE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUNDANDI K.', 'Closed', 'MALIANGA A.', '2026-03-01', '69424') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xzqft2okq', 'p8bd4b8z6', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('x0kt3xzc2', 'JC-HIST-REPLACED QUARTZ HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '85', '85', 'PASIRAYI', 'Closed', 'MAPFINYA J.', '2026-03-01', '72553') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3c3l5vc8x', 'x0kt3xzc2', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('1byw3wrmx', 'JC-HIST-CLEANED CLOGGED FILTERS, CLEANED CLOGGED MAIN STRAINER, SECURED LEAKING FILTERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '540', '540', 'MALIANGA A.', 'Closed', 'MASINGA S.', '2026-03-01', '70089') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('9cx6ykysc', '1byw3wrmx', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ayjkx5dxp', 'JC-HIST-REPLACED FILTER MATS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'HWEZA I.', 'Closed', 'MAZAI T.', '2026-03-01', '70085') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7a0v1zkt0', 'ayjkx5dxp', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ru8hqrhuq', 'JC-HIST-INSTALLED AND COMMISSIONED NEW BLOWER FOR BARREL ZONE 5', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUNDANDI K.', 'Closed', 'MHANGAMI B.', '2026-03-01', '70082') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g03l09fpx', 'ru8hqrhuq', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k45jd1sqp', 'JC-HIST-SWITCHED ON AND OFF REPEATEDLY ON MACHINE TO RESET CAMERA', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUNDANDI K.', 'Closed', 'MOFFAT I.', '2026-03-01', '69423') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cavywxdvs', 'k45jd1sqp', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bu6292r1h', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUKAZHI E.', '2026-03-01', '70675') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('u2hf2c7je', 'bu6292r1h', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('plbhrbv02', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUNDANDI K.', '2026-03-01', '70674') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('oqo7hemdg', 'plbhrbv02', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3ni7mn4d3', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUZEMBE E.', '2026-03-01', '70673') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('o8oefsfqg', '3ni7mn4d3', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('o9yox0pyk', 'JC-HIST-LEAK TESTING, CLEANING EQUIPMENT, CHECKING RUNNING PRESSURE OF ALL CIRCUITS, FIXING LEAKS ON CHILLERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MALIANGA A. + MAZAI T.', 'Closed', 'NYANYIWA L.', '2026-03-01', '70672') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('oojrr5v3h', 'o9yox0pyk', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('1tpkgnxbf', 'JC-HIST-DRILLED, MOUNTED AND CONNECTED NEW NOVA SOCKET TO THE MC (modification)', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MUNDANDI K.', 'Closed', 'SAIDE I.', '2026-03-01', '70080') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('uhdfcvto2', '1tpkgnxbf', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('2mqw1s29l', 'JC-HIST-REMOVED CONTROL PANEL, SECURED ALL LOOSE HANGING COMPONENTS, INSTALLED A 160A MCB AND DN-RAIL , MOUNT POWER SUPPLY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '450', '450', 'PASIRAYI', 'Closed', 'SHORIWA S.', '2026-03-01', '70079') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('muuu9wfen', '2mqw1s29l', 'SHORIWA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('lijisvs2r', 'JC-HIST-DISCONECTED FAULTY LIMIT SWITCH AND REPLACED IT WITH A NEW ONE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '150', '150', 'MUNDANDI K.', 'Closed', 'SIMANGO P.', '2026-03-01', '70078') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('0d9980pj7', 'lijisvs2r', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('5iwaqn2s6', 'JC-HIST-REPLACED FILTER MATS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'TIMBE K.+ DENZEL + MUNYA', 'Closed', 'TIMBE K.', '2026-03-01', '70670') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4q3ae297r', '5iwaqn2s6', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('4rqenpbyt', 'JC-HIST-REPLACED PLUG TOP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '10', '10', 'DENZEL', 'Closed', 'WATSIKA A.', '2026-03-01', '55790') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7c3la6t0i', '4rqenpbyt', 'WATSIKA A.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gv1zfcm8w', 'JC-HIST-CHECKED TRANSDUCER, SWITCHED OFF BARREL HEATERS, SECURED WIPER BRACKET', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'GAPARE A.', 'Closed', 'ZINYAMA S.', '2026-03-01', '71679') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('6fb5zyn87', 'gv1zfcm8w', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('0u5f5a4jy', 'JC-HIST-TESTED POWER, TESTED CARDS AND CABLES, REPLACED PRESSURE SENSOR CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'GAPARE A.', 'Closed', 'BVUNDE B.', '2026-03-01', '71648') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('haxgf2gfi', '0u5f5a4jy', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('owrolf7e6', 'JC-HIST-TESTED FOR POWER, CHECKED CABLE CONTINUITY, JOINED CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '71645') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('02867ok9a', 'owrolf7e6', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('u0siwihhn', 'JC-HIST-TESTED HEATERS, TESTED POWER, CHECKED THERMOCOUPLES, JOINED BROKEN CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'GAPARE A.', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '71644') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dcqk7tum5', 'u0siwihhn', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('8da94tti7', 'JC-HIST-SEPARATED BLOCK, REPLACED FAULTY NOZZLE HEATERS', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '120', '120', 'MAPFINYA J., GAMBE', 'Closed', 'CHIRINDA L.', 'NOZZLE HEATERS-FAULTY BARREL', '72031') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xvntqbnk8', '8da94tti7', 'CHIRINDA L.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('tduvispal', 'JC-HIST-TEATSED HEATER, REPLACED HEATER, TESTED POWER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'GAMBE C.', '2026-03-01', '72026') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3jtwhy176', 'tduvispal', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ymdmpste4', 'JC-HIST-CHECKED SENSORS FOR FUNCTIONALITY. WIP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'GAPARE A.', '2026-03-01', '72025') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('uu0ddh6vz', 'ymdmpste4', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('kalqox6dm', 'JC-HIST-TESTED COMPRESSORS AND PUMPS. REBOOTED CHILLER', 'Historical Import', 'HIGH VOLTAGE-LOW', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'GATSI. F.', 'HIGH VOLTAGE-LOW', '71325') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ckar5h7eg', 'kalqox6dm', 'GATSI. F.', '0779233526', 'System', 'HIGH VOLTAGE-LOW', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('5xspah9uf', 'JC-HIST-REPLACED HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'GAPARE A.', 'Closed', 'GORE E.', '2026-03-01', '72015') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('oqjxpx6vu', '5xspah9uf', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dtczzkhuq', 'JC-HIST-REBOOTED MACHINE', 'Historical Import', 'CLOSE PROBLEM-BLOW MOULD OPEN', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'HWEZA I.', 'CLOSE PROBLEM-BLOW MOULD OPEN', '72016') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('eywro63fm', 'dtczzkhuq', 'HWEZA I.', '0774551882', 'System', 'CLOSE PROBLEM-BLOW MOULD OPEN', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('fpbaez9uw', 'JC-HIST-SHAKED IP CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MABIYA L.', '2026-03-01', '72014') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2dyjgrtbb', 'fpbaez9uw', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('uzg97q34u', 'JC-HIST-MEASURED HEATER RESISTANCE, RECTIFIED SHOR CCT ON HEATER TERMINAL BOX, RESET TRIPPED BREAKER', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '40', '40', 'MAPFINYA J.', 'Closed', 'MALIANGA A.', 'NOZZLE HEATERS-FAULTY BARREL', '71296') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('yq61g8yea', 'uzg97q34u', 'MALIANGA A.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('v7pq5pt6x', 'JC-HIST-TESTED HEATER, TESTED THERMOCOUPLE, REPLACED TEMP. CONTROLLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MAPFINYA J.', '2026-03-01', '71102') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('kfym4df22', 'v7pq5pt6x', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k8gqrqzah', 'JC-HIST-CLEANED CONDENSORS, REPLACED CONDENSOR FAN, CHECKED RUNNING PRESSURES AND THERE WERE HIGH DISCHARGE PRESSURES', 'Historical Import', ' COOLING TOWER-FAULTY CHILLER', '08:00', 'Medium', '150', '150', 'MALIANGA A., MAZAI', 'Closed', 'MASINGA S.', ' COOLING TOWER-FAULTY CHILLER', '71282') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('jzkbiqxwm', 'k8gqrqzah', 'MASINGA S.', '0779233526', 'System', ' COOLING TOWER-FAULTY CHILLER', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('wctbtnmyz', 'JC-HIST-TESTED HEATER, CHECKED POWER, TESTED THERMOCOUPLE CABLE, RE-INSERTED THERMOCOUPLE', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '30', '30', 'GAPARE A.', 'Closed', 'MAZAI T.', 'NOZZLE HEATERS-FAULTY BARREL', '71278') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('mezbdotwb', 'wctbtnmyz', 'MAZAI T.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ya7zt0d8p', 'JC-HIST-REMOVED LUMP, JOINED BROKEN CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MHANGAMI B.', '2026-03-01', '71268') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dyz1tmzft', 'ya7zt0d8p', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nggf7hlzb', 'JC-HIST-REPLACED BROKEN CABLE TRAY CLIPS, SECURED TRAY WITH CABLE TIES, SECURED CABLE TRAY', 'Historical Import', 'BROKEN PINS-LOOSE', '08:00', 'Medium', '110', '110', 'MAPFINYA J.', 'Closed', 'MOFFAT I.', 'BROKEN PINS-LOOSE', '71273') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('b0jmclzmo', 'nggf7hlzb', 'MOFFAT I.', '0779233526', 'System', 'BROKEN PINS-LOOSE', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mljyg9nam', 'JC-HIST-REMOVED TRANSDUCER AND CONNECTED BACK BROKEN SIGNAL CABLES, TEAT RUN MACHINE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'MUKAZHI E.', '2026-03-01', '71275') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('txl36lhhn', 'mljyg9nam', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('4l8jljh9y', 'JC-HIST-CHECKED COLD HALF AND HR, CHECKED FOR LOOSE SCREWS, REPLACED HOSES AND NIPPLES THAT WERE MISSING, LUBRICATION OF MOVING PARTS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'GAMBE C.', 'Closed', 'MUNDANDI K.', '2026-03-01', '71262') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('j6lb5kl8y', '4l8jljh9y', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('u33zb7guy', 'JC-HIST-CHECKED SENSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MUZEMBE E.', '2026-03-01', '72146') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('01f6cn930', 'u33zb7guy', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jte7giwmg', 'JC-HIST-SEPERATED CAVITY PLATE, CLEANED PLASTICS, REMOVED FOREIGN BODIES FROM NOZZLE TIP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '55', '55', 'MUKAZHI E.', 'Closed', 'NYANYIWA L.', '2026-03-01', '72150') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('znchzrk5u', 'jte7giwmg', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('u1s2zwmv0', 'JC-LIVE-5000', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'Location', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('vgm461nwu', 'JC-LIVE-5001', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'PREFORMS', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('movcz6wj3', 'JC-LIVE-5002', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('lib5lz6ue', 'JC-LIVE-5003', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor') ON CONFLICT (ticket_number) DO NOTHING;
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('yewboxffl', 'JC-LIVE-5004', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor') ON CONFLICT (ticket_number) DO NOTHING;

COMMIT;