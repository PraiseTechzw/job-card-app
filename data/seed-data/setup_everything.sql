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
INSERT INTO users (id, name, username, password_hash, role) VALUES ('admin-1', 'System Admin', 'admin', '$2b$10$2E1ehnSGMOhLieOAB2evluTy0knVR6D1ouMRyQ6mElzU4/FRdJ8F.', 'Admin');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('super-1', 'Jane Side', 'supervisor', '$2b$10$2E1ehnSGMOhLieOAB2evluTy0knVR6D1ouMRyQ6mElzU4/FRdJ8F.', 'Supervisor');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('init-1', 'John Doe', 'initiator', '$2b$10$2E1ehnSGMOhLieOAB2evluTy0knVR6D1ouMRyQ6mElzU4/FRdJ8F.', 'Initiator');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('hod-1', 'Robert K.', 'hod', '$2b$10$2E1ehnSGMOhLieOAB2evluTy0knVR6D1ouMRyQ6mElzU4/FRdJ8F.', 'HOD');

-- Seed Artisans with SMS enabled numbers
INSERT INTO artisans (id, name, phone) VALUES ('evu77a8tj', 'BVUNDE B.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('7or5bc0m8', 'CHAGOMOKA R.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('91tkhirh2', 'CHAKANYUKA K.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('tsqeknthh', 'CHIRINDA L.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ab5avy9vs', 'CHIWERE A.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('xdyffdusp', 'DUBE', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ak8bkxnej', 'GAMBE C.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ldvnei9pq', 'GAPARE A.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('eb8327cb2', 'GATSI. F.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('tkgx03ype', 'GORE E.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('9p0zdfsby', 'HWEZA I.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('v52mka5i3', 'MABIYA L.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('xk6pqes5w', 'MALIANGA A.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('6tociizn1', 'MAPFINYA J.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('q8d4olnrk', 'MASINGA S.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('fn9gil45y', 'MAZAI T.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('0cjswvok2', 'MHANGAMI B.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('08l98pa1n', 'MOFFAT I.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('bewy403jp', 'MUKAZHI E.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('57k71zets', 'MUNDANDI K.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('mtvg4g1cz', 'MUZEMBE E.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ehuye4ssn', 'NYANYIWA L.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('1qao0mgdl', 'SAIDE I.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('5rt2t64eh', 'SHORIWA S.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('7lfg3dyb3', 'SIMANGO P.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('4jtvivfr4', 'TIMBE K.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('oc2dx0ups', 'WATSIKA A.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ulmh53spt', 'ZINYAMA S.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;

INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('7aqm3xmjr', 'JC-HIST-Work Done', 'Historical Import', '2026-03-01', '08:00', 'Medium', 'Time Taken', 'Time Taken', 'Artisan', 'Closed', 'CHIWERE A.', '2026-03-01', 'Jorb Card Number');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('33vjbv3gq', '7aqm3xmjr', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vgbsju1a0', 'JC-HIST-TERMINATED BROKEN CABLE AFTER CHECKING CONTACTOR, HEATER AND POWER SUPPLY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUNDANDI K.', 'Closed', 'DUBE', '2026-03-01', '72808');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('h3fjj50to', 'vgbsju1a0', 'DUBE', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('2yukivmw7', 'JC-HIST-readjusted temposonic magnet on injection unit', 'Historical Import', '2026-03-01', '08:00', 'Medium', '28', '28', 'WATSIKA A.', 'Closed', 'GAMBE C.', '2026-03-01', '74822');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('15p1mjwke', '2yukivmw7', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('00162j0fi', 'JC-HIST-TROUBLESHOOTING. FAULTY CONTACTOR', 'Historical Import', '2026-03-01', '08:00', 'Medium', '150', '150', 'WATSIKA A.', 'Closed', 'GAPARE A.', '2026-03-01', '74688');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('9923wd1ar', '00162j0fi', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('h09q7tv87', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'GATSI. F.', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '74803');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vkw7suwar', 'h09q7tv87', 'GATSI. F.', '0779233526', 'System', 'ALARM-FAULTY EMERGENCY STOP SWITCH', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nu63g6h65', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'GORE E.', '2026-03-01', '74647');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('o724tx36a', 'nu63g6h65', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jf97fmmyq', 'JC-HIST-TIGHTENED ALL LOOSE COMMUNICATION CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'WATSIKA A.', 'Closed', 'HWEZA I.', '2026-03-01', '74642');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2401bp4j5', 'jf97fmmyq', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('wz211h5pi', 'JC-HIST-checked air conditioner on the electric board and found 1 fan faulty', 'Historical Import', '2026-03-01', '08:00', 'Medium', '110', '110', 'MUNDANDI K.', 'Closed', 'MABIYA L.', '2026-03-01', '74722');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('r9havx78p', 'wz211h5pi', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('8n7ebd88b', 'JC-HIST-repaired dammaged suction pipe', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'WATSIKA A.', 'Closed', 'MALIANGA A.', '2026-03-01', '74640');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cw046dllx', '8n7ebd88b', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('joipnctmt', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '25', '25', 'WATSIKA A.', 'Closed', 'MAPFINYA J.', '2026-03-01', '74678');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('l281yz475', 'joipnctmt', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('tk0b91if3', 'JC-HIST-replaced blown fuses', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'MASINGA S.', '2026-03-01', '74709');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('91uxq269p', 'tk0b91if3', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('zycqa1x6n', 'JC-HIST-changed pump VT card', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'MAZAI T.', '2026-03-01', '74655');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('t3084ktrq', 'zycqa1x6n', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mwc9oebj2', 'JC-HIST-Replaced switched overload', 'Historical Import', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '08:00', 'Medium', '120', '120', 'WATSIKA A.', 'Closed', 'MHANGAMI B.', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '74653');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('p710eidwy', 'mwc9oebj2', 'MHANGAMI B.', '0774551882', 'System', 'ALARM-FAULTY EMERGENCY STOP SWITCH', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('0ytfc5fmp', 'JC-HIST-REWIRED THE WHOLE CIRCUIT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'WATSIKA A.', 'Closed', 'MOFFAT I.', '2026-03-01', '72815');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('km1mbqi30', '0ytfc5fmp', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dhi1fh0od', 'JC-HIST-CARRIED OUT 720HR MAINTENANCE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'CHAGOMOKA R., WATSIKA', 'Closed', 'MUKAZHI E.', '2026-03-01', '71427');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('l58tsz95t', 'dhi1fh0od', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('65d0y3wn2', 'JC-HIST-CHANGED CLAMP LOCK MODULE', 'Historical Import', 'CLOSE PROBLEM-BLOW MOULD OPEN', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'MUNDANDI K.', 'CLOSE PROBLEM-BLOW MOULD OPEN', '74191');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('9eoeurn0e', '65d0y3wn2', 'MUNDANDI K.', '0774551882', 'System', 'CLOSE PROBLEM-BLOW MOULD OPEN', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('f5gtbrqkj', 'JC-HIST-CLEANED CLOGGED VALVE, SWAPPED SOLENOID VALVES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'MUZEMBE E.', '2026-03-01', '73746');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('90ji9vice', 'f5gtbrqkj', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('xk8ua3yi9', 'JC-HIST-SWAPPED MODULES FOR CLAMP LOCK', 'Historical Import', '2026-03-01', '08:00', 'Medium', '20', '20', 'WATSIKA A.', 'Closed', 'NYANYIWA L.', '2026-03-01', '72779');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cm73pf33s', 'xk8ua3yi9', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mxwlgqyrc', 'JC-HIST-reconnected battery terminal', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'SAIDE I.', '2026-03-01', '72777');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ms4ua6u5y', 'mxwlgqyrc', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('4yte0a7op', 'JC-HIST-REPLACED SHORT CIRCUITED HEATERS ON CAVITY 7, REPLACED BLOWN FUSES ON CAVITY 4 & 11', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '360', '360', 'WATSIKA A.', 'Closed', 'SHORIWA S.', 'NOZZLE HEATERS-FAULTY BARREL', '74241');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('y153bb4bj', '4yte0a7op', 'SHORIWA S.', '0779233526', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3j94d6xbr', 'JC-HIST-REMOVED ACCUMULATED MATERIALON CABLES, REPAIRED DAMAGED CABLES, LUBRICATED MOTOR BEARINGS AND SLIDING PARTS, CHANGED INSERTION TURRET PISTON SEALS, ADJUSTED CUTTERS. CARRIED OUT MAINTENACE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '360', '360', 'CHAGOMOKA R., WATSIKA', 'Closed', 'SIMANGO P.', '2026-03-01', '73540');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('styh1iad3', '3j94d6xbr', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('f2vp3cnmv', 'JC-HIST-greased volumetric pump coupling, gearbox motor, SFM centre bearings, cleaned insertion turret an d replaced worn out gaskets, replaced leaking air pipes', 'Historical Import', '2026-03-01', '08:00', 'Medium', '360', '360', 'CHAGOMOKA R.', 'Closed', 'TIMBE K.', '2026-03-01', '70607');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8z8sm5tbz', 'f2vp3cnmv', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('0vvi2275a', 'JC-HIST-REPLACED O-RING, SOLDERED BROKEN TRANSDUCER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '105', '105', 'GATSI. F., GORE E', 'Closed', 'WATSIKA A.', '2026-03-01', '73953');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7g6omi473', '0vvi2275a', 'WATSIKA A.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('8np5131c0', 'JC-HIST-maintenance done', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'GATSI. F.', 'Closed', 'ZINYAMA S.', '2026-03-01', '73531');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('36mtl6qib', '8np5131c0', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bdfhz0zhm', 'JC-HIST-Replaced oil filters and greased all moving parts. Maintenance done as per checklist', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'CHIRINDA L., MABIYA L', 'Closed', 'BVUNDE B.', '2026-03-01', '73528');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8odtbetwt', 'bdfhz0zhm', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vb2dszmu1', 'JC-HIST-CARRIRED OUT MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '135', '135', 'TIMBE K., BVUNDE, HWEZA', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '73525');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('sdavwefyo', 'vb2dszmu1', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('pnvg6f4yd', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'HWEZA I.', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '73523');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('619xnxtwu', 'pnvg6f4yd', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jkonocovu', 'JC-HIST-CARRIED OUT MAINTENANCE ON DBs', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MUNDANDI K.', 'Closed', 'CHIRINDA L.', '2026-03-01', '73521');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('37pa9nv8d', 'jkonocovu', 'CHIRINDA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('777gfderg', 'JC-HIST-SERVICED DBs', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MABIYA L.', 'Closed', 'CHIWERE A.', '2026-03-01', '73522');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('608joxbux', '777gfderg', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('el2mt9kf9', 'JC-HIST-Maintenance done', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHAGOMOKA R.', 'Closed', 'DUBE', '2026-03-01', '73517');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('d6vn5nqyp', 'el2mt9kf9', 'DUBE', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('icsjn71ac', 'JC-HIST-FIXED 2 LEAKS, CHARGED SYSTEM, CLEANED CONDENSORS AND FILTERS FOR BOTH CHILLER AND DRIER, CHECKED EQUIPMNET AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MALIANGA A., MAZAI', 'Closed', 'GAMBE C.', '2026-03-01', '73516');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wg1vmbwyf', 'icsjn71ac', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9sh692k3v', 'JC-HIST-CHECKED PRESSURES, CLEANED CONDENSORS, LEAK TESTING, CHECKING VIBRATIONS, CHECKE REFRIGERANT LEVELS, CHECKED OIL LEVELS ON COMPRESSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'MALIANGA A.', 'Closed', 'GAPARE A.', '2026-03-01', '73515');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('d4w5n1rxi', '9sh692k3v', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ljrk25pgn', 'JC-HIST-TESTED FOR POWER, TESTED CAPACITOR FUNCTIONALITY, DISCONNECTED MOTOR AND TESTED MOTOR WINDINGS. MOTOR SENT OUT FOR REPAIRS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'TIMBE K.', 'Closed', 'GATSI. F.', '2026-03-01', '73191');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('tjw5xvbqu', 'ljrk25pgn', 'GATSI. F.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3g5i55hhy', 'JC-HIST-CARRIED OUT MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'CHAGOMOKA R., MUNDANDI', 'Closed', 'GORE E.', '2026-03-01', '73507');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('k6agakqzp', '3g5i55hhy', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('l9riqnawz', 'JC-HIST-CHANGED LEAKING VALVE ON HYDRAULIC WATER BOOSTER PUMP, CLEANED FILTERS, CHANGED DAMAGED FILTER SHELL FOR KM1&2 CHILLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'MALIANGA A.', 'Closed', 'HWEZA I.', '2026-03-01', '73184');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('257iod0b7', 'l9riqnawz', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('4n1opz97m', 'JC-HIST-DILL ALL POSSIBLE CHECKS AS MACHINE WAS SWITCHED OFF', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'TIMBE K.', 'Closed', 'MABIYA L.', '2026-03-01', '73505');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('sqtbe8l84', '4n1opz97m', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ea274hotm', 'JC-HIST-Changed compressor on TC180 chiller, cleaned condensers, checked oil level and refrigerant pressures, checked intergrity of electrical circuits, cleaned water filters.', 'Historical Import', '2026-03-01', '08:00', 'Medium', '1080', '1080', 'MALIANGA A., MAZAI', 'Closed', 'MALIANGA A.', '2026-03-01', '73503');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('m602wire9', 'ea274hotm', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('cdqho44su', 'JC-HIST-ADJUSTED AND SECURED MAGNETIC SENSOR (UP), CHECKED BOTH CYLINDERS FOR CORRECT OPERATION (BYPASS), CHANGED PNEUMATIC VALVE FOR RECEIPT UNIT UP MOVEMENT WITH A NEW ONE', 'Historical Import', 'DOWN-RECEIPT UNIT UP', '08:00', 'Medium', '30', '30', 'TIMBE K.', 'Closed', 'MAPFINYA J.', 'DOWN-RECEIPT UNIT UP', '73907');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('qra55ifl6', 'cdqho44su', 'MAPFINYA J.', '0774551882', 'System', 'DOWN-RECEIPT UNIT UP', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('u6j0uihyi', 'JC-HIST-ADJUSTED SENSOR TO LEAE 2-4MM SENSING DISTANCE WITH ACTUATOR, CHECKED CABLE FOR DAMAGE, FIXED LOOSE CONNECTION, CHANGED HYDRAULIC VALVE ON BLOW PIN MOVEMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'TIMBE K., GATSI F.', 'Closed', 'MASINGA S.', '2026-03-01', '73484');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('gj35ognwr', 'u6j0uihyi', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('s78qw618q', 'JC-HIST-CARRIED OUT 8000HR SERVICE AND REPLACED FAULTY CONTROLLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '600', '600', 'MAZAI T.; MALIANGA A.', 'Closed', 'MAZAI T.', '2026-03-01', '71423');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('pcd9fwukc', 's78qw618q', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9wri4yu8h', 'JC-HIST-CARRIED OUT 8000HR SERVICE AND CLEANED AIR AND OIL COOLERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'MAZAI T.; MALINAG A.', 'Closed', 'MHANGAMI B.', '2026-03-01', '71422');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7nf1jezmd', '9wri4yu8h', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nvhz4houa', 'JC-HIST-CHECKED FUNCTIONALITY, CHECKED VOLTAGE. THERE WAS OVER VOLTAGE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MALIANGA A.', 'Closed', 'MOFFAT I.', '2026-03-01', '70108');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8nmffnnoe', 'nvhz4houa', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('xnlyqoi5g', 'JC-HIST-seperated mould, removed and cleaned tip', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUKAZHI E.', 'Closed', 'MUKAZHI E.', '2026-03-01', '72661');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4jbrbu0x4', 'xnlyqoi5g', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bhr7q0qxy', 'JC-HIST-CHECKED MOTOR FOR POWER AND FUNCTIONALITY, TRACED SIGNAL TO PLC. NO 24VDC SIGNAL FROM PLC', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'TIMBE K.', 'Closed', 'MUNDANDI K.', '2026-03-01', '72618');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g1jk7q573', 'bhr7q0qxy', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('5u19809fz', 'JC-HIST-REPLACED CONE RING, FIXED WATER LEAK ON AFFECTED CAVITIES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'GAMBE C.', 'Closed', 'MUZEMBE E.', '2026-03-01', '73060');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('08ya5n0cq', '5u19809fz', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('uzu7lo0c0', 'JC-HIST-WORK DONE A SPER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'BVUNDE B., HWEZA I', 'Closed', 'NYANYIWA L.', '2026-03-01', '71404');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dx1n8atxs', 'uzu7lo0c0', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ha5h65ixu', 'JC-HIST-WORK DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'TIMBE K.; MUNYA', 'Closed', 'SAIDE I.', '2026-03-01', '71403');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ff0qs4res', 'ha5h65ixu', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('t1yh2qpc3', 'JC-HIST-DONE MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'HWEZA I.', 'Closed', 'SHORIWA S.', '2026-03-01', '71402');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1hif5h4kl', 't1yh2qpc3', 'SHORIWA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nzpcdxm39', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST,', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'GATSI. F.', 'Closed', 'SIMANGO P.', '2026-03-01', '71410');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ntrz8t17i', 'nzpcdxm39', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ct50j2ojk', 'JC-HIST-CHECKED FOR SIGNALS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'TIMBE K.', '2026-03-01', '72993');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('mhgnwf2s1', 'ct50j2ojk', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('am5bb3e1a', 'JC-HIST-IDENTIFIED AND FIXED BROKEN HEATER CABLE', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '30', '30', 'PASIRAYI', 'Closed', 'WATSIKA A.', 'NOZZLE HEATERS-FAULTY BARREL', '73556');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('0v0s3yfyn', 'am5bb3e1a', 'WATSIKA A.', '0779233526', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9ktng1ot0', 'JC-HIST-POLISHED BURS ON CAVITY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUYAMBO G.', 'Closed', 'ZINYAMA S.', '2026-03-01', '72970');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('572dbiek3', '9ktng1ot0', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ajleaokra', 'JC-HIST-REPLACED VACCUM PUMP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MHANGAMI B.', 'Closed', 'BVUNDE B.', '2026-03-01', '70687');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('msh7h45jv', 'ajleaokra', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('yhz5ge9ot', 'JC-HIST-RESET TRIPPED BREAKER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '45', '45', 'PASIRAYI', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '72950');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('agf9up7yo', 'yhz5ge9ot', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('y1p0w63hc', 'JC-HIST-RESET OVERLOAD', 'Historical Import', '2026-03-01', '08:00', 'Medium', '45', '45', 'PASIRAYI', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '72949');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vctmwvk20', 'y1p0w63hc', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('e3hyhd55p', 'JC-HIST-TESTED ALL HEATERS, OK. ADJUSTED SETTINGS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'PASIRAYI', 'Closed', 'CHIRINDA L.', '2026-03-01', '72945');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('twxl9pwiy', 'e3hyhd55p', 'CHIRINDA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('n4zpmgcfw', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '210', '210', 'HWEZA I.+ DUBE+ GAMBE', 'Closed', 'CHIWERE A.', '2026-03-01', '70680');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('u4qcpow9j', 'n4zpmgcfw', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('m1wcnepb3', 'JC-HIST-NOT DONE', 'Historical Import', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', '08:00', 'Medium', 'Maintenance Job', 'Maintenance Job', 'PASIRAYI', 'Closed', 'DUBE', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', '73110');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('p6ycik9u2', 'm1wcnepb3', 'DUBE', '0779233526', 'System', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('431ake396', 'JC-HIST-REPLACED NOZZLE D HEATER AND SPRUE BUSH HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'PASIRAYI', 'Closed', 'GAMBE C.', '2026-03-01', '73102');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('0l5j1xhlo', '431ake396', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jn7cusdah', 'JC-HIST-removed faulty sensor and connected new one', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'MUNDANDI K.', 'Closed', 'GAPARE A.', '2026-03-01', '72916');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('50jdtz7at', 'jn7cusdah', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('q6gwg5erx', 'JC-HIST-WELDED LEAKING MANIFOLD', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'MALIANGA A.', 'Closed', 'GATSI. F.', '2026-03-01', '72326');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7mtlni30u', 'q6gwg5erx', 'GATSI. F.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dyngiz0sl', 'JC-HIST-ADJUSTED WATER LEVEL SENSOR, CHECKED WATER LEVEL', 'Historical Import', ' COOLING TOWER-FAULTY CHILLER', '08:00', 'Medium', '30', '30', 'MALIANGA A.', 'Closed', 'GORE E.', ' COOLING TOWER-FAULTY CHILLER', '69446');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('zhsuj3yl9', 'dyngiz0sl', 'GORE E.', '0786223289', 'System', ' COOLING TOWER-FAULTY CHILLER', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ztvebhqz3', 'JC-HIST-REPLACED FAULTY SOCKETS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'MUNDANDI K.', 'Closed', 'HWEZA I.', '2026-03-01', '69426');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('66p2jxx5g', 'ztvebhqz3', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ttg1hizna', 'JC-HIST-REPLACED PROXIMITY INDUCTIVE SENSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '20', '20', 'HWEZA I.', 'Closed', 'MABIYA L.', '2026-03-01', '72551');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('tluk7th6l', 'ttg1hizna', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3b3mpfhwi', 'JC-HIST-RETERMINATED BROKEN CABLES AND REPLACED BLOWN UP FUSE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUNDANDI K.', 'Closed', 'MALIANGA A.', '2026-03-01', '69424');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ex9n2r3wu', '3b3mpfhwi', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('d5mzk0mgz', 'JC-HIST-REPLACED QUARTZ HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '85', '85', 'PASIRAYI', 'Closed', 'MAPFINYA J.', '2026-03-01', '72553');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8t1t8y5aj', 'd5mzk0mgz', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('e0r17j6fe', 'JC-HIST-CLEANED CLOGGED FILTERS, CLEANED CLOGGED MAIN STRAINER, SECURED LEAKING FILTERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '540', '540', 'MALIANGA A.', 'Closed', 'MASINGA S.', '2026-03-01', '70089');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('k18pmi2bt', 'e0r17j6fe', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('i7qfsg2xd', 'JC-HIST-REPLACED FILTER MATS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'HWEZA I.', 'Closed', 'MAZAI T.', '2026-03-01', '70085');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2ogv8ekfc', 'i7qfsg2xd', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k9a4ev8e6', 'JC-HIST-INSTALLED AND COMMISSIONED NEW BLOWER FOR BARREL ZONE 5', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUNDANDI K.', 'Closed', 'MHANGAMI B.', '2026-03-01', '70082');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('a4m7j2969', 'k9a4ev8e6', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('suiygkmeu', 'JC-HIST-SWITCHED ON AND OFF REPEATEDLY ON MACHINE TO RESET CAMERA', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUNDANDI K.', 'Closed', 'MOFFAT I.', '2026-03-01', '69423');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vl2hrkm35', 'suiygkmeu', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('juodsf9zf', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUKAZHI E.', '2026-03-01', '70675');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('091838o9f', 'juodsf9zf', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9s6xd7o7d', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUNDANDI K.', '2026-03-01', '70674');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ydc06lbod', '9s6xd7o7d', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bfzhl4hrn', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUZEMBE E.', '2026-03-01', '70673');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('gpr762k7y', 'bfzhl4hrn', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('c1kt28upy', 'JC-HIST-LEAK TESTING, CLEANING EQUIPMENT, CHECKING RUNNING PRESSURE OF ALL CIRCUITS, FIXING LEAKS ON CHILLERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MALIANGA A. + MAZAI T.', 'Closed', 'NYANYIWA L.', '2026-03-01', '70672');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('efiefsof4', 'c1kt28upy', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('b7km7lezr', 'JC-HIST-DRILLED, MOUNTED AND CONNECTED NEW NOVA SOCKET TO THE MC (modification)', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MUNDANDI K.', 'Closed', 'SAIDE I.', '2026-03-01', '70080');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('gtvub8wn9', 'b7km7lezr', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('yb6bumpa3', 'JC-HIST-REMOVED CONTROL PANEL, SECURED ALL LOOSE HANGING COMPONENTS, INSTALLED A 160A MCB AND DN-RAIL , MOUNT POWER SUPPLY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '450', '450', 'PASIRAYI', 'Closed', 'SHORIWA S.', '2026-03-01', '70079');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rjyr1fm5c', 'yb6bumpa3', 'SHORIWA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vydp3x0xv', 'JC-HIST-DISCONECTED FAULTY LIMIT SWITCH AND REPLACED IT WITH A NEW ONE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '150', '150', 'MUNDANDI K.', 'Closed', 'SIMANGO P.', '2026-03-01', '70078');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('v5tuenshs', 'vydp3x0xv', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('57f6uk6my', 'JC-HIST-REPLACED FILTER MATS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'TIMBE K.+ DENZEL + MUNYA', 'Closed', 'TIMBE K.', '2026-03-01', '70670');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ytb1zns5c', '57f6uk6my', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3kxmtqqg4', 'JC-HIST-REPLACED PLUG TOP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '10', '10', 'DENZEL', 'Closed', 'WATSIKA A.', '2026-03-01', '55790');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rirwogv2t', '3kxmtqqg4', 'WATSIKA A.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('krj5cgdj9', 'JC-HIST-CHECKED TRANSDUCER, SWITCHED OFF BARREL HEATERS, SECURED WIPER BRACKET', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'GAPARE A.', 'Closed', 'ZINYAMA S.', '2026-03-01', '71679');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8wcdqqpbm', 'krj5cgdj9', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('tev49qha6', 'JC-HIST-TESTED POWER, TESTED CARDS AND CABLES, REPLACED PRESSURE SENSOR CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'GAPARE A.', 'Closed', 'BVUNDE B.', '2026-03-01', '71648');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3uu3by0fy', 'tev49qha6', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('964wvmxqn', 'JC-HIST-TESTED FOR POWER, CHECKED CABLE CONTINUITY, JOINED CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '71645');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ismu8b2ey', '964wvmxqn', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mub3gzeli', 'JC-HIST-TESTED HEATERS, TESTED POWER, CHECKED THERMOCOUPLES, JOINED BROKEN CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'GAPARE A.', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '71644');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wfrvpxd8y', 'mub3gzeli', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ndasj1oh6', 'JC-HIST-SEPARATED BLOCK, REPLACED FAULTY NOZZLE HEATERS', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '120', '120', 'MAPFINYA J., GAMBE', 'Closed', 'CHIRINDA L.', 'NOZZLE HEATERS-FAULTY BARREL', '72031');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4dp8sh8nf', 'ndasj1oh6', 'CHIRINDA L.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('n2w75xi95', 'JC-HIST-TEATSED HEATER, REPLACED HEATER, TESTED POWER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'GAMBE C.', '2026-03-01', '72026');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('07q08eycd', 'n2w75xi95', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('71p3r6o4y', 'JC-HIST-CHECKED SENSORS FOR FUNCTIONALITY. WIP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'GAPARE A.', '2026-03-01', '72025');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vltpr8w3q', '71p3r6o4y', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('i3vfq4mbr', 'JC-HIST-TESTED COMPRESSORS AND PUMPS. REBOOTED CHILLER', 'Historical Import', 'HIGH VOLTAGE-LOW', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'GATSI. F.', 'HIGH VOLTAGE-LOW', '71325');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wcvnubisi', 'i3vfq4mbr', 'GATSI. F.', '0779233526', 'System', 'HIGH VOLTAGE-LOW', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('30k96gkty', 'JC-HIST-REPLACED HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'GAPARE A.', 'Closed', 'GORE E.', '2026-03-01', '72015');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('21zqk04mu', '30k96gkty', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('wpj07s8np', 'JC-HIST-REBOOTED MACHINE', 'Historical Import', 'CLOSE PROBLEM-BLOW MOULD OPEN', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'HWEZA I.', 'CLOSE PROBLEM-BLOW MOULD OPEN', '72016');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('c1pq42tx0', 'wpj07s8np', 'HWEZA I.', '0774551882', 'System', 'CLOSE PROBLEM-BLOW MOULD OPEN', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9lg85e0q8', 'JC-HIST-SHAKED IP CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MABIYA L.', '2026-03-01', '72014');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2zv69vsf4', '9lg85e0q8', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('6szls74c9', 'JC-HIST-MEASURED HEATER RESISTANCE, RECTIFIED SHOR CCT ON HEATER TERMINAL BOX, RESET TRIPPED BREAKER', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '40', '40', 'MAPFINYA J.', 'Closed', 'MALIANGA A.', 'NOZZLE HEATERS-FAULTY BARREL', '71296');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('y106zowor', '6szls74c9', 'MALIANGA A.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('5d93gp936', 'JC-HIST-TESTED HEATER, TESTED THERMOCOUPLE, REPLACED TEMP. CONTROLLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MAPFINYA J.', '2026-03-01', '71102');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('esp7m1lcd', '5d93gp936', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('d0e4oek2q', 'JC-HIST-CLEANED CONDENSORS, REPLACED CONDENSOR FAN, CHECKED RUNNING PRESSURES AND THERE WERE HIGH DISCHARGE PRESSURES', 'Historical Import', ' COOLING TOWER-FAULTY CHILLER', '08:00', 'Medium', '150', '150', 'MALIANGA A., MAZAI', 'Closed', 'MASINGA S.', ' COOLING TOWER-FAULTY CHILLER', '71282');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('gyde9b2ky', 'd0e4oek2q', 'MASINGA S.', '0779233526', 'System', ' COOLING TOWER-FAULTY CHILLER', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('lzdnix22a', 'JC-HIST-TESTED HEATER, CHECKED POWER, TESTED THERMOCOUPLE CABLE, RE-INSERTED THERMOCOUPLE', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '30', '30', 'GAPARE A.', 'Closed', 'MAZAI T.', 'NOZZLE HEATERS-FAULTY BARREL', '71278');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wj5spzx1s', 'lzdnix22a', 'MAZAI T.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('8kzoikjcu', 'JC-HIST-REMOVED LUMP, JOINED BROKEN CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MHANGAMI B.', '2026-03-01', '71268');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3fp0k5si2', '8kzoikjcu', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nd4fzvkk3', 'JC-HIST-REPLACED BROKEN CABLE TRAY CLIPS, SECURED TRAY WITH CABLE TIES, SECURED CABLE TRAY', 'Historical Import', 'BROKEN PINS-LOOSE', '08:00', 'Medium', '110', '110', 'MAPFINYA J.', 'Closed', 'MOFFAT I.', 'BROKEN PINS-LOOSE', '71273');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('h2qoqnkre', 'nd4fzvkk3', 'MOFFAT I.', '0779233526', 'System', 'BROKEN PINS-LOOSE', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nquyo010h', 'JC-HIST-REMOVED TRANSDUCER AND CONNECTED BACK BROKEN SIGNAL CABLES, TEAT RUN MACHINE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'MUKAZHI E.', '2026-03-01', '71275');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2hd8kxiku', 'nquyo010h', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bddszn1ar', 'JC-HIST-CHECKED COLD HALF AND HR, CHECKED FOR LOOSE SCREWS, REPLACED HOSES AND NIPPLES THAT WERE MISSING, LUBRICATION OF MOVING PARTS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'GAMBE C.', 'Closed', 'MUNDANDI K.', '2026-03-01', '71262');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wwmjqhrdf', 'bddszn1ar', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('nzwv7vu0l', 'JC-HIST-CHECKED SENSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MUZEMBE E.', '2026-03-01', '72146');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('clse4vf1g', 'nzwv7vu0l', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('u4s6341k5', 'JC-HIST-SEPERATED CAVITY PLATE, CLEANED PLASTICS, REMOVED FOREIGN BODIES FROM NOZZLE TIP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '55', '55', 'MUKAZHI E.', 'Closed', 'NYANYIWA L.', '2026-03-01', '72150');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1l4mt65wz', 'u4s6341k5', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('a67tfczhh', 'JC-LIVE-5000', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'Location', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('8mgbhw8nm', 'JC-LIVE-5001', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'PREFORMS', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('xlov5ssrl', 'JC-LIVE-5002', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('26khm9w2f', 'JC-LIVE-5003', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('v5no07xqo', 'JC-LIVE-5004', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');

COMMIT;