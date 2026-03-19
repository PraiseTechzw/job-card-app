-- Seed Data for Job Card System
BEGIN;

INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('i78uuvzta', 'JC-2026-1000', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-0', 'Location', 'Breakdown', 'Mechanical failure', 'InProgress');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('45y9urnmd', 'i78uuvzta', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1000"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('23uulgux4', 'i78uuvzta', 'BVUNDE B.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('cdy442rg1', 'JC-2026-1001', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-1', 'PREFORMS', 'Breakdown', 'Mechanical failure', 'Closed');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('ngfh44ofk', 'cdy442rg1', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1001"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('svshj6n9x', 'cdy442rg1', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Closed"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('xsgendzuc', 'cdy442rg1', 'CHAGOMOKA R.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('vatp38hja', 'JC-2026-1002', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-2', 'LIM', 'Breakdown', 'Mechanical failure', 'Awaiting_SignOff');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('uw22482ku', 'vatp38hja', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1002"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('qiznojixf', 'vatp38hja', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Awaiting_SignOff"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('pchsdt4fy', 'vatp38hja', 'CHAKANYUKA K.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('mjcjwipuu', 'JC-2026-1003', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-3', 'LIM', 'Breakdown', 'Mechanical failure', 'Approved');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('ql94rzbpf', 'mjcjwipuu', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1003"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('5001d0u41', 'mjcjwipuu', 'CHIRINDA L.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('41n8snykx', 'JC-2026-1004', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-4', 'LIM', 'Breakdown', 'Mechanical failure', 'Registered');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('0pcoi4p2t', '41n8snykx', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1004"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('c3b7kea9d', '41n8snykx', 'CHIWERE A.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('l1rblb4iw', 'JC-2026-1005', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-5', 'LIM', 'Breakdown', 'Mechanical failure', 'InProgress');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('xfacwyv6d', 'l1rblb4iw', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1005"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('7lsz37rp0', 'l1rblb4iw', 'DUBE', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('f7a74fcuc', 'JC-2026-1006', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-6', 'PREFORM', 'Breakdown', 'Mechanical failure', 'Closed');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('5mdgwx5gm', 'f7a74fcuc', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1006"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('z30j4gt5i', 'f7a74fcuc', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Closed"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('h798ihqv4', 'f7a74fcuc', 'GAMBE C.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('pybtdpd9d', 'JC-2026-1007', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-7', 'LIM', 'Breakdown', 'Mechanical failure', 'Awaiting_SignOff');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('99equu8ai', 'pybtdpd9d', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1007"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('2tpf92vp5', 'pybtdpd9d', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Awaiting_SignOff"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('3ymixrddq', 'pybtdpd9d', 'GAPARE A.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('1gtrtjgue', 'JC-2026-1008', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-8', 'LIM', 'Breakdown', 'Mechanical failure', 'Approved');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('49a0uvlkl', '1gtrtjgue', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1008"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('2qxr0xd9u', '1gtrtjgue', 'GATSI. F.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('2209zccwj', 'JC-2026-1009', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-9', 'BLOW', 'Breakdown', 'Mechanical failure', 'Registered');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('luhmxtozd', '2209zccwj', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1009"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('btbv9n4ii', '2209zccwj', 'GORE E.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('h9x27tyvi', 'JC-2026-1010', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-10', 'BLOW', 'Breakdown', 'Mechanical failure', 'InProgress');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('afsjzieai', 'h9x27tyvi', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1010"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('bssa75eqa', 'h9x27tyvi', 'HWEZA I.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('co6ya7aws', 'JC-2026-1011', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-11', 'BLOW', 'Breakdown', 'Mechanical failure', 'Closed');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('x7u4d8vu3', 'co6ya7aws', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1011"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('fyokl3799', 'co6ya7aws', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Closed"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('hc0aplhbb', 'co6ya7aws', 'MABIYA L.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('qy5snj257', 'JC-2026-1012', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-12', 'BLOW', 'Breakdown', 'Mechanical failure', 'Awaiting_SignOff');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('4kghrs7h0', 'qy5snj257', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1012"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('vc0boyyli', 'qy5snj257', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Awaiting_SignOff"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('3m5t8on0j', 'qy5snj257', 'MALIANGA A.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('gtfox5q0c', 'JC-2026-1013', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-13', 'BLOW', 'Breakdown', 'Mechanical failure', 'Approved');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('2uraasm6b', 'gtfox5q0c', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1013"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('k2ccusa42', 'gtfox5q0c', 'MAPFINYA J.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('9leb1ui00', 'JC-2026-1014', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-14', 'BLOW', 'Breakdown', 'Mechanical failure', 'Registered');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('ngbzvc71u', '9leb1ui00', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1014"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('u2ne6lajd', '9leb1ui00', 'MASINGA S.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('5q9nkvaid', 'JC-2026-1015', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-15', 'BLOW', 'Breakdown', 'Mechanical failure', 'InProgress');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('sk5yqp2cn', '5q9nkvaid', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1015"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('08po425a3', '5q9nkvaid', 'MAZAI T.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('a5076a4hf', 'JC-2026-1016', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-16', 'LIM', 'Breakdown', 'Mechanical failure', 'Closed');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('ofbiufjgc', 'a5076a4hf', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1016"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('7fsyf59du', 'a5076a4hf', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Closed"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('dxtjx6d0e', 'a5076a4hf', 'MHANGAMI B.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('pfox9r5nr', 'JC-2026-1017', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-17', 'LIM', 'Breakdown', 'Mechanical failure', 'Awaiting_SignOff');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('6whqeq3la', 'pfox9r5nr', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1017"}');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('jiqi0rjfh', 'pfox9r5nr', 'Status Update', 'Supervisor', '{"fromStatus": "InProgress", "toStatus": "Awaiting_SignOff"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('2gb7f4w85', 'pfox9r5nr', 'MOFFAT I.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('hp19jvvvy', 'JC-2026-1018', 'Production Team', '2026-03-10', '08:00', 'Critical', 'Asset-18', 'PETFORM', 'Breakdown', 'Mechanical failure', 'Approved');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('xhba5577m', 'hp19jvvvy', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1018"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('kv5x7cza3', 'hp19jvvvy', 'MUKAZHI E.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');
INSERT INTO job_cards (id, ticket_number, requested_by, date_raised, time_raised, priority, plant_number, plant_description, plant_status, defect, status)
VALUES ('m2yrszc08', 'JC-2026-1019', 'Production Team', '2026-03-10', '08:00', 'High', 'Asset-19', 'LIM', 'Breakdown', 'Mechanical failure', 'Registered');
INSERT INTO audit_logs (id, job_card_id, action, performed_by, details)
VALUES ('fzz27mcrv', 'm2yrszc08', 'Initial Creation', 'System', '{"ticketNumber": "JC-2026-1019"}');
INSERT INTO assignments (id, job_card_id, artisan_name, section, assigned_by, assigned_date, status)
VALUES ('i4k4qyhcq', 'm2yrszc08', 'MUNDANDI K.', 'Maintenance', 'Supervisor', '2026-03-11', 'Assigned');

COMMIT;