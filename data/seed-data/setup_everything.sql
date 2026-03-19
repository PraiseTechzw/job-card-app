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
INSERT INTO users (id, name, username, password_hash, role) VALUES ('admin-1', 'Praise Masunga', 'pmasunga', '$2b$10$6tBVPjR4BcQKekmRD6J0wutH8fTeXFh3pkCFYki1AkVuCYFkm97I.', 'Admin');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('super-1', 'Production Supervisor', 'production_super', '$2b$10$6tBVPjR4BcQKekmRD6J0wutH8fTeXFh3pkCFYki1AkVuCYFkm97I.', 'Supervisor');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('plan-1', 'Planning Officer', 'planning_office', '$2b$10$6tBVPjR4BcQKekmRD6J0wutH8fTeXFh3pkCFYki1AkVuCYFkm97I.', 'PlanningOffice');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('init-1', 'Maintenance Initiator', 'initiator', '$2b$10$6tBVPjR4BcQKekmRD6J0wutH8fTeXFh3pkCFYki1AkVuCYFkm97I.', 'Initiator');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('art-1', 'Lead Artisan', 'artisan', '$2b$10$6tBVPjR4BcQKekmRD6J0wutH8fTeXFh3pkCFYki1AkVuCYFkm97I.', 'Artisan');
INSERT INTO users (id, name, username, password_hash, role) VALUES ('hod-1', 'Dept. Manager', 'manager', '$2b$10$6tBVPjR4BcQKekmRD6J0wutH8fTeXFh3pkCFYki1AkVuCYFkm97I.', 'HOD');

-- Seed Artisans with SMS enabled numbers
INSERT INTO artisans (id, name, phone) VALUES ('h6k0mzffc', 'BVUNDE B.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ijrriapip', 'CHAGOMOKA R.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('rc4fyu94z', 'CHAKANYUKA K.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('vq4q0dt7k', 'CHIRINDA L.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('bw6kzaicc', 'CHIWERE A.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('nop88mxzh', 'DUBE', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('w70wzyz4a', 'GAMBE C.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ysdks5lmt', 'GAPARE A.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('p0peppkim', 'GATSI. F.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('4n1z2h8av', 'GORE E.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('qlayr4tt4', 'HWEZA I.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('zeev4in71', 'MABIYA L.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('hv13zbzk6', 'MALIANGA A.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('gh85q3jyg', 'MAPFINYA J.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('mbn10on0m', 'MASINGA S.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('ep18t2746', 'MAZAI T.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('dhiu1aa0v', 'MHANGAMI B.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('wm0kussjc', 'MOFFAT I.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('un7796wgn', 'MUKAZHI E.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('bqbezxxpt', 'MUNDANDI K.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('t1lr1j39o', 'MUZEMBE E.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('f4hia7lve', 'NYANYIWA L.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('r9io6xivu', 'SAIDE I.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('l4jxrqa2f', 'SHORIWA S.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('nrdjq6hkj', 'SIMANGO P.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('4sy483sa0', 'TIMBE K.', '0774551882') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('bxq0b790h', 'WATSIKA A.', '0779233526') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;
INSERT INTO artisans (id, name, phone) VALUES ('se61a3xkx', 'ZINYAMA S.', '0786223289') ON CONFLICT (name) DO UPDATE SET phone = EXCLUDED.phone;

INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('pzhh96u1x', 'JC-HIST-Work Done', 'Historical Import', '2026-03-01', '08:00', 'Medium', 'Time Taken', 'Time Taken', 'Artisan', 'Closed', 'CHIWERE A.', '2026-03-01', 'Jorb Card Number');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('mul15r620', 'pzhh96u1x', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('25wwpfff8', 'JC-HIST-TERMINATED BROKEN CABLE AFTER CHECKING CONTACTOR, HEATER AND POWER SUPPLY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUNDANDI K.', 'Closed', 'DUBE', '2026-03-01', '72808');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('0uad7dbs1', '25wwpfff8', 'DUBE', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('2sdejbr0y', 'JC-HIST-readjusted temposonic magnet on injection unit', 'Historical Import', '2026-03-01', '08:00', 'Medium', '28', '28', 'WATSIKA A.', 'Closed', 'GAMBE C.', '2026-03-01', '74822');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ks5ghys10', '2sdejbr0y', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('wohusrsuf', 'JC-HIST-TROUBLESHOOTING. FAULTY CONTACTOR', 'Historical Import', '2026-03-01', '08:00', 'Medium', '150', '150', 'WATSIKA A.', 'Closed', 'GAPARE A.', '2026-03-01', '74688');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8zfx1d6u7', 'wohusrsuf', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jvcxxk6rv', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'GATSI. F.', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '74803');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('e1ys5coeh', 'jvcxxk6rv', 'GATSI. F.', '0779233526', 'System', 'ALARM-FAULTY EMERGENCY STOP SWITCH', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('hldbj3887', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'GORE E.', '2026-03-01', '74647');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('q8u5f9res', 'hldbj3887', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3mhdaxo9t', 'JC-HIST-TIGHTENED ALL LOOSE COMMUNICATION CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'WATSIKA A.', 'Closed', 'HWEZA I.', '2026-03-01', '74642');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('un4c5p3nt', '3mhdaxo9t', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('i2nyy3nki', 'JC-HIST-checked air conditioner on the electric board and found 1 fan faulty', 'Historical Import', '2026-03-01', '08:00', 'Medium', '110', '110', 'MUNDANDI K.', 'Closed', 'MABIYA L.', '2026-03-01', '74722');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ez4cad0bv', 'i2nyy3nki', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k5klgvk7j', 'JC-HIST-repaired dammaged suction pipe', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'WATSIKA A.', 'Closed', 'MALIANGA A.', '2026-03-01', '74640');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('lh5bmov0t', 'k5klgvk7j', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('880wcdf94', 'JC-HIST-RECALIBRATED ROBOT AXIS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '25', '25', 'WATSIKA A.', 'Closed', 'MAPFINYA J.', '2026-03-01', '74678');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wnbc1saur', '880wcdf94', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ltgxlnuvj', 'JC-HIST-replaced blown fuses', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'MASINGA S.', '2026-03-01', '74709');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2y7kxk7fi', 'ltgxlnuvj', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3zr78w5ra', 'JC-HIST-changed pump VT card', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'MAZAI T.', '2026-03-01', '74655');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('m701u894w', '3zr78w5ra', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('z80fzibjy', 'JC-HIST-Replaced switched overload', 'Historical Import', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '08:00', 'Medium', '120', '120', 'WATSIKA A.', 'Closed', 'MHANGAMI B.', 'ALARM-FAULTY EMERGENCY STOP SWITCH', '74653');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g7y7sk5mn', 'z80fzibjy', 'MHANGAMI B.', '0774551882', 'System', 'ALARM-FAULTY EMERGENCY STOP SWITCH', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3tkaoc8lp', 'JC-HIST-REWIRED THE WHOLE CIRCUIT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'WATSIKA A.', 'Closed', 'MOFFAT I.', '2026-03-01', '72815');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wdw6fcx7n', '3tkaoc8lp', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('13zrgdytl', 'JC-HIST-CARRIED OUT 720HR MAINTENANCE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'CHAGOMOKA R., WATSIKA', 'Closed', 'MUKAZHI E.', '2026-03-01', '71427');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('601hyatqg', '13zrgdytl', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('kavjafq8k', 'JC-HIST-CHANGED CLAMP LOCK MODULE', 'Historical Import', 'CLOSE PROBLEM-BLOW MOULD OPEN', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'MUNDANDI K.', 'CLOSE PROBLEM-BLOW MOULD OPEN', '74191');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4djheu2mg', 'kavjafq8k', 'MUNDANDI K.', '0774551882', 'System', 'CLOSE PROBLEM-BLOW MOULD OPEN', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('birvntcf9', 'JC-HIST-CLEANED CLOGGED VALVE, SWAPPED SOLENOID VALVES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'WATSIKA A.', 'Closed', 'MUZEMBE E.', '2026-03-01', '73746');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vo6cd5e0j', 'birvntcf9', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('qs5x5ot4a', 'JC-HIST-SWAPPED MODULES FOR CLAMP LOCK', 'Historical Import', '2026-03-01', '08:00', 'Medium', '20', '20', 'WATSIKA A.', 'Closed', 'NYANYIWA L.', '2026-03-01', '72779');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('hn5n94kgs', 'qs5x5ot4a', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ex8d0pmpm', 'JC-HIST-reconnected battery terminal', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'WATSIKA A.', 'Closed', 'SAIDE I.', '2026-03-01', '72777');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1ausiha7v', 'ex8d0pmpm', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('fudiy772i', 'JC-HIST-REPLACED SHORT CIRCUITED HEATERS ON CAVITY 7, REPLACED BLOWN FUSES ON CAVITY 4 & 11', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '360', '360', 'WATSIKA A.', 'Closed', 'SHORIWA S.', 'NOZZLE HEATERS-FAULTY BARREL', '74241');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8qpegxd0g', 'fudiy772i', 'SHORIWA S.', '0779233526', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('1oxzqhqjn', 'JC-HIST-REMOVED ACCUMULATED MATERIALON CABLES, REPAIRED DAMAGED CABLES, LUBRICATED MOTOR BEARINGS AND SLIDING PARTS, CHANGED INSERTION TURRET PISTON SEALS, ADJUSTED CUTTERS. CARRIED OUT MAINTENACE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '360', '360', 'CHAGOMOKA R., WATSIKA', 'Closed', 'SIMANGO P.', '2026-03-01', '73540');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('39ffh739c', '1oxzqhqjn', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('opr5py04z', 'JC-HIST-greased volumetric pump coupling, gearbox motor, SFM centre bearings, cleaned insertion turret an d replaced worn out gaskets, replaced leaking air pipes', 'Historical Import', '2026-03-01', '08:00', 'Medium', '360', '360', 'CHAGOMOKA R.', 'Closed', 'TIMBE K.', '2026-03-01', '70607');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('oruwntrin', 'opr5py04z', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('fk9g1fps9', 'JC-HIST-REPLACED O-RING, SOLDERED BROKEN TRANSDUCER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '105', '105', 'GATSI. F., GORE E', 'Closed', 'WATSIKA A.', '2026-03-01', '73953');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4wx67i0fr', 'fk9g1fps9', 'WATSIKA A.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('mi8lc0922', 'JC-HIST-maintenance done', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'GATSI. F.', 'Closed', 'ZINYAMA S.', '2026-03-01', '73531');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('lvlwotsms', 'mi8lc0922', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vqkoi564n', 'JC-HIST-Replaced oil filters and greased all moving parts. Maintenance done as per checklist', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'CHIRINDA L., MABIYA L', 'Closed', 'BVUNDE B.', '2026-03-01', '73528');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('tqhpatey4', 'vqkoi564n', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k7906ufhh', 'JC-HIST-CARRIRED OUT MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '135', '135', 'TIMBE K., BVUNDE, HWEZA', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '73525');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('igyc5muyx', 'k7906ufhh', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('lyptiyxje', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'HWEZA I.', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '73523');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('kph5e5yzy', 'lyptiyxje', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('e6zm7meqj', 'JC-HIST-CARRIED OUT MAINTENANCE ON DBs', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MUNDANDI K.', 'Closed', 'CHIRINDA L.', '2026-03-01', '73521');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('x9lbkq98c', 'e6zm7meqj', 'CHIRINDA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('p24f3qteh', 'JC-HIST-SERVICED DBs', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MABIYA L.', 'Closed', 'CHIWERE A.', '2026-03-01', '73522');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rvmjjqa29', 'p24f3qteh', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('imu8rv278', 'JC-HIST-Maintenance done', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHAGOMOKA R.', 'Closed', 'DUBE', '2026-03-01', '73517');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('qk334wtyk', 'imu8rv278', 'DUBE', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ewj24gs80', 'JC-HIST-FIXED 2 LEAKS, CHARGED SYSTEM, CLEANED CONDENSORS AND FILTERS FOR BOTH CHILLER AND DRIER, CHECKED EQUIPMNET AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MALIANGA A., MAZAI', 'Closed', 'GAMBE C.', '2026-03-01', '73516');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cxnfkei63', 'ewj24gs80', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('k9gxm4039', 'JC-HIST-CHECKED PRESSURES, CLEANED CONDENSORS, LEAK TESTING, CHECKING VIBRATIONS, CHECKE REFRIGERANT LEVELS, CHECKED OIL LEVELS ON COMPRESSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'MALIANGA A.', 'Closed', 'GAPARE A.', '2026-03-01', '73515');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('fllifjvwc', 'k9gxm4039', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('1xcfcqnb0', 'JC-HIST-TESTED FOR POWER, TESTED CAPACITOR FUNCTIONALITY, DISCONNECTED MOTOR AND TESTED MOTOR WINDINGS. MOTOR SENT OUT FOR REPAIRS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'TIMBE K.', 'Closed', 'GATSI. F.', '2026-03-01', '73191');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('r419mji1p', '1xcfcqnb0', 'GATSI. F.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ppnaqot4k', 'JC-HIST-CARRIED OUT MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'CHAGOMOKA R., MUNDANDI', 'Closed', 'GORE E.', '2026-03-01', '73507');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('0sh6psqun', 'ppnaqot4k', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('77bp5v33s', 'JC-HIST-CHANGED LEAKING VALVE ON HYDRAULIC WATER BOOSTER PUMP, CLEANED FILTERS, CHANGED DAMAGED FILTER SHELL FOR KM1&2 CHILLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'MALIANGA A.', 'Closed', 'HWEZA I.', '2026-03-01', '73184');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ndl7ork1i', '77bp5v33s', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gj7kt7rq6', 'JC-HIST-DILL ALL POSSIBLE CHECKS AS MACHINE WAS SWITCHED OFF', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'TIMBE K.', 'Closed', 'MABIYA L.', '2026-03-01', '73505');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rm81wj20b', 'gj7kt7rq6', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('0k6p8uik5', 'JC-HIST-Changed compressor on TC180 chiller, cleaned condensers, checked oil level and refrigerant pressures, checked intergrity of electrical circuits, cleaned water filters.', 'Historical Import', '2026-03-01', '08:00', 'Medium', '1080', '1080', 'MALIANGA A., MAZAI', 'Closed', 'MALIANGA A.', '2026-03-01', '73503');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wu49rt2fx', '0k6p8uik5', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('1nupv5s49', 'JC-HIST-ADJUSTED AND SECURED MAGNETIC SENSOR (UP), CHECKED BOTH CYLINDERS FOR CORRECT OPERATION (BYPASS), CHANGED PNEUMATIC VALVE FOR RECEIPT UNIT UP MOVEMENT WITH A NEW ONE', 'Historical Import', 'DOWN-RECEIPT UNIT UP', '08:00', 'Medium', '30', '30', 'TIMBE K.', 'Closed', 'MAPFINYA J.', 'DOWN-RECEIPT UNIT UP', '73907');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('uz3a7itu3', '1nupv5s49', 'MAPFINYA J.', '0774551882', 'System', 'DOWN-RECEIPT UNIT UP', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ccmltpuub', 'JC-HIST-ADJUSTED SENSOR TO LEAE 2-4MM SENSING DISTANCE WITH ACTUATOR, CHECKED CABLE FOR DAMAGE, FIXED LOOSE CONNECTION, CHANGED HYDRAULIC VALVE ON BLOW PIN MOVEMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'TIMBE K., GATSI F.', 'Closed', 'MASINGA S.', '2026-03-01', '73484');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('9an9ip31w', 'ccmltpuub', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dftua8srp', 'JC-HIST-CARRIED OUT 8000HR SERVICE AND REPLACED FAULTY CONTROLLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '600', '600', 'MAZAI T.; MALIANGA A.', 'Closed', 'MAZAI T.', '2026-03-01', '71423');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xuqw9gb4z', 'dftua8srp', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('oy2x6a00f', 'JC-HIST-CARRIED OUT 8000HR SERVICE AND CLEANED AIR AND OIL COOLERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '420', '420', 'MAZAI T.; MALINAG A.', 'Closed', 'MHANGAMI B.', '2026-03-01', '71422');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3r2s48jqx', 'oy2x6a00f', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('j285ienrh', 'JC-HIST-CHECKED FUNCTIONALITY, CHECKED VOLTAGE. THERE WAS OVER VOLTAGE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MALIANGA A.', 'Closed', 'MOFFAT I.', '2026-03-01', '70108');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('nygt4vxm0', 'j285ienrh', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('220ptop6a', 'JC-HIST-seperated mould, removed and cleaned tip', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUKAZHI E.', 'Closed', 'MUKAZHI E.', '2026-03-01', '72661');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3wi6xh4pf', '220ptop6a', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('rmx52fm0o', 'JC-HIST-CHECKED MOTOR FOR POWER AND FUNCTIONALITY, TRACED SIGNAL TO PLC. NO 24VDC SIGNAL FROM PLC', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'TIMBE K.', 'Closed', 'MUNDANDI K.', '2026-03-01', '72618');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('pjq6oazl6', 'rmx52fm0o', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gqn0wemuz', 'JC-HIST-REPLACED CONE RING, FIXED WATER LEAK ON AFFECTED CAVITIES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'GAMBE C.', 'Closed', 'MUZEMBE E.', '2026-03-01', '73060');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('92iwzrwu7', 'gqn0wemuz', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('i2v72ze62', 'JC-HIST-WORK DONE A SPER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'BVUNDE B., HWEZA I', 'Closed', 'NYANYIWA L.', '2026-03-01', '71404');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('4mlsuehi9', 'i2v72ze62', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('a1kkp72f8', 'JC-HIST-WORK DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'TIMBE K.; MUNYA', 'Closed', 'SAIDE I.', '2026-03-01', '71403');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('cjdd8bomi', 'a1kkp72f8', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('36ztaqgvu', 'JC-HIST-DONE MAINTENANCE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'HWEZA I.', 'Closed', 'SHORIWA S.', '2026-03-01', '71402');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('gt1rnt2d8', '36ztaqgvu', 'SHORIWA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('012n1lyoo', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST,', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'GATSI. F.', 'Closed', 'SIMANGO P.', '2026-03-01', '71410');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7nfk9b802', '012n1lyoo', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jdclaagm3', 'JC-HIST-CHECKED FOR SIGNALS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'TIMBE K.', '2026-03-01', '72993');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('u75dedfb1', 'jdclaagm3', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ihl7ol4dt', 'JC-HIST-IDENTIFIED AND FIXED BROKEN HEATER CABLE', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '30', '30', 'PASIRAYI', 'Closed', 'WATSIKA A.', 'NOZZLE HEATERS-FAULTY BARREL', '73556');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8spimjenv', 'ihl7ol4dt', 'WATSIKA A.', '0779233526', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('jpauufgm5', 'JC-HIST-POLISHED BURS ON CAVITY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUYAMBO G.', 'Closed', 'ZINYAMA S.', '2026-03-01', '72970');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vevapjvji', 'jpauufgm5', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vtaifzur8', 'JC-HIST-REPLACED VACCUM PUMP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MHANGAMI B.', 'Closed', 'BVUNDE B.', '2026-03-01', '70687');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('mmmxau0zw', 'vtaifzur8', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bc00eeafr', 'JC-HIST-RESET TRIPPED BREAKER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '45', '45', 'PASIRAYI', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '72950');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('vd3y36y1e', 'bc00eeafr', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dkazr9er8', 'JC-HIST-RESET OVERLOAD', 'Historical Import', '2026-03-01', '08:00', 'Medium', '45', '45', 'PASIRAYI', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '72949');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('wu9ktih52', 'dkazr9er8', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('m8h8wgkoq', 'JC-HIST-TESTED ALL HEATERS, OK. ADJUSTED SETTINGS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'PASIRAYI', 'Closed', 'CHIRINDA L.', '2026-03-01', '72945');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dcunpg2dc', 'm8h8wgkoq', 'CHIRINDA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3uraebwbz', 'JC-HIST-MAINTENANCE DONE AS PER CHECKLIST', 'Historical Import', '2026-03-01', '08:00', 'Medium', '210', '210', 'HWEZA I.+ DUBE+ GAMBE', 'Closed', 'CHIWERE A.', '2026-03-01', '70680');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('y5cu4mo9b', '3uraebwbz', 'CHIWERE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('r38dk2fdq', 'JC-HIST-NOT DONE', 'Historical Import', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', '08:00', 'Medium', 'Maintenance Job', 'Maintenance Job', 'PASIRAYI', 'Closed', 'DUBE', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', '73110');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('94hs23lwc', 'r38dk2fdq', 'DUBE', '0779233526', 'System', 'TINTING UNIT PROBLEM-COLOUR MATRIX ', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('l1u25z941', 'JC-HIST-REPLACED NOZZLE D HEATER AND SPRUE BUSH HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'PASIRAYI', 'Closed', 'GAMBE C.', '2026-03-01', '73102');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ny5rqrkdo', 'l1u25z941', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('j7udtxbat', 'JC-HIST-removed faulty sensor and connected new one', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'MUNDANDI K.', 'Closed', 'GAPARE A.', '2026-03-01', '72916');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('mksoe1478', 'j7udtxbat', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ep9dvw6yt', 'JC-HIST-WELDED LEAKING MANIFOLD', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'MALIANGA A.', 'Closed', 'GATSI. F.', '2026-03-01', '72326');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('pxpjpu6yq', 'ep9dvw6yt', 'GATSI. F.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dl10riu38', 'JC-HIST-ADJUSTED WATER LEVEL SENSOR, CHECKED WATER LEVEL', 'Historical Import', ' COOLING TOWER-FAULTY CHILLER', '08:00', 'Medium', '30', '30', 'MALIANGA A.', 'Closed', 'GORE E.', ' COOLING TOWER-FAULTY CHILLER', '69446');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dnkvp9fl5', 'dl10riu38', 'GORE E.', '0786223289', 'System', ' COOLING TOWER-FAULTY CHILLER', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ert01byqt', 'JC-HIST-REPLACED FAULTY SOCKETS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'MUNDANDI K.', 'Closed', 'HWEZA I.', '2026-03-01', '69426');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('b7c3f93xg', 'ert01byqt', 'HWEZA I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ctx2p4g3z', 'JC-HIST-REPLACED PROXIMITY INDUCTIVE SENSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '20', '20', 'HWEZA I.', 'Closed', 'MABIYA L.', '2026-03-01', '72551');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('af2tqit18', 'ctx2p4g3z', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('8tthswlq4', 'JC-HIST-RETERMINATED BROKEN CABLES AND REPLACED BLOWN UP FUSE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUNDANDI K.', 'Closed', 'MALIANGA A.', '2026-03-01', '69424');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('r97reu3nk', '8tthswlq4', 'MALIANGA A.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('tq60bt7ka', 'JC-HIST-REPLACED QUARTZ HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '85', '85', 'PASIRAYI', 'Closed', 'MAPFINYA J.', '2026-03-01', '72553');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('ig64y7x2n', 'tq60bt7ka', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('bjoblu8fc', 'JC-HIST-CLEANED CLOGGED FILTERS, CLEANED CLOGGED MAIN STRAINER, SECURED LEAKING FILTERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '540', '540', 'MALIANGA A.', 'Closed', 'MASINGA S.', '2026-03-01', '70089');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('9q9withtc', 'bjoblu8fc', 'MASINGA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('eju1e384t', 'JC-HIST-REPLACED FILTER MATS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'HWEZA I.', 'Closed', 'MAZAI T.', '2026-03-01', '70085');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rn7xbl810', 'eju1e384t', 'MAZAI T.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('00h5tp3vt', 'JC-HIST-INSTALLED AND COMMISSIONED NEW BLOWER FOR BARREL ZONE 5', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MUNDANDI K.', 'Closed', 'MHANGAMI B.', '2026-03-01', '70082');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('y1r55tzuw', '00h5tp3vt', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('64am6ivqh', 'JC-HIST-SWITCHED ON AND OFF REPEATEDLY ON MACHINE TO RESET CAMERA', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'MUNDANDI K.', 'Closed', 'MOFFAT I.', '2026-03-01', '69423');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2l59ihy11', '64am6ivqh', 'MOFFAT I.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('t7d9090ld', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUKAZHI E.', '2026-03-01', '70675');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('fqvzz5wai', 't7d9090ld', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('ioi5g3bil', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUNDANDI K.', '2026-03-01', '70674');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('eho71vy1z', 'ioi5g3bil', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('085r3r0az', 'JC-HIST-SERVICED EQUIPMENT', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'CHIRINDA L.; MABIYA L.', 'Closed', 'MUZEMBE E.', '2026-03-01', '70673');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('rhfq0mjek', '085r3r0az', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('1maskqbkq', 'JC-HIST-LEAK TESTING, CLEANING EQUIPMENT, CHECKING RUNNING PRESSURE OF ALL CIRCUITS, FIXING LEAKS ON CHILLERS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '480', '480', 'MALIANGA A. + MAZAI T.', 'Closed', 'NYANYIWA L.', '2026-03-01', '70672');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dn6owvfdh', '1maskqbkq', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('npbc2dr72', 'JC-HIST-DRILLED, MOUNTED AND CONNECTED NEW NOVA SOCKET TO THE MC (modification)', 'Historical Import', '2026-03-01', '08:00', 'Medium', '240', '240', 'MUNDANDI K.', 'Closed', 'SAIDE I.', '2026-03-01', '70080');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('dnhc571um', 'npbc2dr72', 'SAIDE I.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('h7t8xrpv2', 'JC-HIST-REMOVED CONTROL PANEL, SECURED ALL LOOSE HANGING COMPONENTS, INSTALLED A 160A MCB AND DN-RAIL , MOUNT POWER SUPPLY', 'Historical Import', '2026-03-01', '08:00', 'Medium', '450', '450', 'PASIRAYI', 'Closed', 'SHORIWA S.', '2026-03-01', '70079');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('p8mtpgta6', 'h7t8xrpv2', 'SHORIWA S.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('3c97jzux4', 'JC-HIST-DISCONECTED FAULTY LIMIT SWITCH AND REPLACED IT WITH A NEW ONE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '150', '150', 'MUNDANDI K.', 'Closed', 'SIMANGO P.', '2026-03-01', '70078');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('yh9x2ki0w', '3c97jzux4', 'SIMANGO P.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('5h9bpi84i', 'JC-HIST-REPLACED FILTER MATS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '40', '40', 'TIMBE K.+ DENZEL + MUNYA', 'Closed', 'TIMBE K.', '2026-03-01', '70670');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g19t0915k', '5h9bpi84i', 'TIMBE K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('o7d5hs5wa', 'JC-HIST-REPLACED PLUG TOP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '10', '10', 'DENZEL', 'Closed', 'WATSIKA A.', '2026-03-01', '55790');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('tvgt8yg26', 'o7d5hs5wa', 'WATSIKA A.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('s52r6i0y5', 'JC-HIST-CHECKED TRANSDUCER, SWITCHED OFF BARREL HEATERS, SECURED WIPER BRACKET', 'Historical Import', '2026-03-01', '08:00', 'Medium', '90', '90', 'GAPARE A.', 'Closed', 'ZINYAMA S.', '2026-03-01', '71679');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('2bw58lj22', 's52r6i0y5', 'ZINYAMA S.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('9myt3cuuz', 'JC-HIST-TESTED POWER, TESTED CARDS AND CABLES, REPLACED PRESSURE SENSOR CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '180', '180', 'GAPARE A.', 'Closed', 'BVUNDE B.', '2026-03-01', '71648');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('whehvzzoy', '9myt3cuuz', 'BVUNDE B.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('19xsa7eqg', 'JC-HIST-TESTED FOR POWER, CHECKED CABLE CONTINUITY, JOINED CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'CHAGOMOKA R.', '2026-03-01', '71645');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xgj5p7smh', '19xsa7eqg', 'CHAGOMOKA R.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('r6gwaajty', 'JC-HIST-TESTED HEATERS, TESTED POWER, CHECKED THERMOCOUPLES, JOINED BROKEN CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '120', '120', 'GAPARE A.', 'Closed', 'CHAKANYUKA K.', '2026-03-01', '71644');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('b8pm97vku', 'r6gwaajty', 'CHAKANYUKA K.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('qx44mdb79', 'JC-HIST-SEPARATED BLOCK, REPLACED FAULTY NOZZLE HEATERS', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '120', '120', 'MAPFINYA J., GAMBE', 'Closed', 'CHIRINDA L.', 'NOZZLE HEATERS-FAULTY BARREL', '72031');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('3nr7dh40n', 'qx44mdb79', 'CHIRINDA L.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('apwauxmhc', 'JC-HIST-TEATSED HEATER, REPLACED HEATER, TESTED POWER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'GAMBE C.', '2026-03-01', '72026');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('bys4achvx', 'apwauxmhc', 'GAMBE C.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('kn64f70wv', 'JC-HIST-CHECKED SENSORS FOR FUNCTIONALITY. WIP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'GAPARE A.', '2026-03-01', '72025');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('sy3l2oesi', 'kn64f70wv', 'GAPARE A.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('pkry3wjyn', 'JC-HIST-TESTED COMPRESSORS AND PUMPS. REBOOTED CHILLER', 'Historical Import', 'HIGH VOLTAGE-LOW', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'GATSI. F.', 'HIGH VOLTAGE-LOW', '71325');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('sjairfike', 'pkry3wjyn', 'GATSI. F.', '0779233526', 'System', 'HIGH VOLTAGE-LOW', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('owtwomkds', 'JC-HIST-REPLACED HEATER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '30', '30', 'GAPARE A.', 'Closed', 'GORE E.', '2026-03-01', '72015');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('e3yo4mtwp', 'owtwomkds', 'GORE E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('tk3gmib9q', 'JC-HIST-REBOOTED MACHINE', 'Historical Import', 'CLOSE PROBLEM-BLOW MOULD OPEN', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'HWEZA I.', 'CLOSE PROBLEM-BLOW MOULD OPEN', '72016');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7f46jx55q', 'tk3gmib9q', 'HWEZA I.', '0774551882', 'System', 'CLOSE PROBLEM-BLOW MOULD OPEN', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('njymqornx', 'JC-HIST-SHAKED IP CABLES', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MABIYA L.', '2026-03-01', '72014');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('g8bxic8yn', 'njymqornx', 'MABIYA L.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('p6kmfz540', 'JC-HIST-MEASURED HEATER RESISTANCE, RECTIFIED SHOR CCT ON HEATER TERMINAL BOX, RESET TRIPPED BREAKER', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '40', '40', 'MAPFINYA J.', 'Closed', 'MALIANGA A.', 'NOZZLE HEATERS-FAULTY BARREL', '71296');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1y3qu0ieg', 'p6kmfz540', 'MALIANGA A.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gebng8dbb', 'JC-HIST-TESTED HEATER, TESTED THERMOCOUPLE, REPLACED TEMP. CONTROLLER', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MAPFINYA J.', '2026-03-01', '71102');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('32c25xbn8', 'gebng8dbb', 'MAPFINYA J.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vn8jk0bbp', 'JC-HIST-CLEANED CONDENSORS, REPLACED CONDENSOR FAN, CHECKED RUNNING PRESSURES AND THERE WERE HIGH DISCHARGE PRESSURES', 'Historical Import', ' COOLING TOWER-FAULTY CHILLER', '08:00', 'Medium', '150', '150', 'MALIANGA A., MAZAI', 'Closed', 'MASINGA S.', ' COOLING TOWER-FAULTY CHILLER', '71282');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('09qq8d67b', 'vn8jk0bbp', 'MASINGA S.', '0779233526', 'System', ' COOLING TOWER-FAULTY CHILLER', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('isf5tmzjh', 'JC-HIST-TESTED HEATER, CHECKED POWER, TESTED THERMOCOUPLE CABLE, RE-INSERTED THERMOCOUPLE', 'Historical Import', 'NOZZLE HEATERS-FAULTY BARREL', '08:00', 'Medium', '30', '30', 'GAPARE A.', 'Closed', 'MAZAI T.', 'NOZZLE HEATERS-FAULTY BARREL', '71278');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('1qlc776e5', 'isf5tmzjh', 'MAZAI T.', '0786223289', 'System', 'NOZZLE HEATERS-FAULTY BARREL', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('x4fbvntdo', 'JC-HIST-REMOVED LUMP, JOINED BROKEN CABLE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MHANGAMI B.', '2026-03-01', '71268');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('7fll4f8b6', 'x4fbvntdo', 'MHANGAMI B.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('94n7baqa0', 'JC-HIST-REPLACED BROKEN CABLE TRAY CLIPS, SECURED TRAY WITH CABLE TIES, SECURED CABLE TRAY', 'Historical Import', 'BROKEN PINS-LOOSE', '08:00', 'Medium', '110', '110', 'MAPFINYA J.', 'Closed', 'MOFFAT I.', 'BROKEN PINS-LOOSE', '71273');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('z0kfx1vbg', '94n7baqa0', 'MOFFAT I.', '0779233526', 'System', 'BROKEN PINS-LOOSE', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('dj9nf90za', 'JC-HIST-REMOVED TRANSDUCER AND CONNECTED BACK BROKEN SIGNAL CABLES, TEAT RUN MACHINE', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'MAPFINYA J.', 'Closed', 'MUKAZHI E.', '2026-03-01', '71275');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('52jxlb00m', 'dj9nf90za', 'MUKAZHI E.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('gckfrhqoi', 'JC-HIST-CHECKED COLD HALF AND HR, CHECKED FOR LOOSE SCREWS, REPLACED HOSES AND NIPPLES THAT WERE MISSING, LUBRICATION OF MOVING PARTS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '300', '300', 'GAMBE C.', 'Closed', 'MUNDANDI K.', '2026-03-01', '71262');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('8w6fp94l0', 'gckfrhqoi', 'MUNDANDI K.', '0774551882', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('vdcjpsy84', 'JC-HIST-CHECKED SENSORS', 'Historical Import', '2026-03-01', '08:00', 'Medium', '60', '60', 'GAPARE A.', 'Closed', 'MUZEMBE E.', '2026-03-01', '72146');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('xe1qh81tp', 'vdcjpsy84', 'MUZEMBE E.', '0779233526', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, defect, work_done_details, status, issued_to, date_finished, machine_downtime)
  VALUES ('925mfvdg3', 'JC-HIST-SEPERATED CAVITY PLATE, CLEANED PLASTICS, REMOVED FOREIGN BODIES FROM NOZZLE TIP', 'Historical Import', '2026-03-01', '08:00', 'Medium', '55', '55', 'MUKAZHI E.', 'Closed', 'NYANYIWA L.', '2026-03-01', '72150');
INSERT INTO assignments (id, job_card_id, artisan_name, artisan_phone, assigned_by, assigned_date, status)
  VALUES ('jb524v0gd', '925mfvdg3', 'NYANYIWA L.', '0786223289', 'System', '2026-03-01', 'Completed');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('k4nm3rxaq', 'JC-LIVE-5000', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'Location', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('oqx6tgm14', 'JC-LIVE-5001', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'PREFORMS', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('6pbvkju5v', 'JC-LIVE-5002', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('ssqfhesds', 'JC-LIVE-5003', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_description, plant_status, defect, status)
VALUES ('e2kms0hc2', 'JC-LIVE-5004', 'Supervisor J.', '2026-03-18', '10:00', 'High', 'LIM', 'Breakdown', 'Urgent fault in electronics', 'Pending_Supervisor');

COMMIT;