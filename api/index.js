import express from 'express';
import cors from 'cors';
import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidTransition } from './workflow.js';
import { createAuditLog } from './audit.js';
import { sanitizeJobCardData } from './validation.js';
import { sendSms } from './sms.js';
import { getCreationNotificationPlan, getStatusNotificationPlan } from './jobNotificationTemplates.js';
import { STARTUP_MIGRATIONS } from './startupMigrations.js';
import {
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PERMISSIONS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_WORKFLOW_CONFIG,
  WORKFLOW_FIELD_ALIASES,
  getNotificationEventName,
  mergeGlobalConfig,
  mergeNotificationConfig,
  mergePermissionsConfig,
  mergeSystemSettingsConfig,
  mergeWorkflowConfig,
  normalizeDetailText,
} from './configDefaults.js';

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL environment variable is missing.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

const processStartTime = Date.now();
const responseTimes = [];
const MAX_RECORDED_RESPONSE_TIMES = 500;

const formatDuration = (seconds) => {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const days = Math.floor(wholeSeconds / 86400);
  const hours = Math.floor((wholeSeconds % 86400) / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const secs = wholeSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const pushResponseTime = (value) => {
  responseTimes.push(value);
  if (responseTimes.length > MAX_RECORDED_RESPONSE_TIMES) {
    responseTimes.splice(0, responseTimes.length - MAX_RECORDED_RESPONSE_TIMES);
  }
};

app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    if (!req.path.startsWith('/api')) return;
    pushResponseTime(performance.now() - start);
  });
  next();
});

// --- Bypassing Port 5432 Blocks via Neon WebSocket Driver ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Replacement query function that uses the secure WebSocket driver
const query = (text, params) => pool.query(text, params);

for (const statement of STARTUP_MIGRATIONS) {
  query(statement).catch(() => {});
}

const randomId = () => Math.random().toString(36).slice(2, 11);

const parseConfigRowValue = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const fetchSystemConfig = async () => {
  const result = await query('SELECT key, value, updated_at FROM system_config');
  const config = {};
  for (const row of result.rows) {
    config[row.key] = parseConfigRowValue(row.value);
  }
  return config;
};

const getRetentionMonthsFromConfig = (config) => {
  const candidate = config?.retention_months;
  return Number.isInteger(candidate) ? candidate : 24;
};

const getMergedRuntimeConfig = async () => {
  const config = await fetchSystemConfig();
  const retentionMonths = getRetentionMonthsFromConfig(config);

  return {
    raw: config,
    permissions: mergePermissionsConfig(config.permissions || DEFAULT_PERMISSIONS),
    workflow: mergeWorkflowConfig(config.workflow || DEFAULT_WORKFLOW_CONFIG),
    notifications: mergeNotificationConfig(config.notifications || DEFAULT_NOTIFICATION_SETTINGS),
    global: mergeGlobalConfig(config.global || DEFAULT_GLOBAL_CONFIG),
    systemSettings: mergeSystemSettingsConfig(config.system_settings || DEFAULT_SYSTEM_SETTINGS, config.global || DEFAULT_GLOBAL_CONFIG, retentionMonths),
    retentionMonths,
  };
};

const getModuleAccessForRole = (permissions, role) => {
  if (!role) return {};
  const rolePermissions = permissions?.[role] || {};
  if (role === 'Admin') {
    return Object.fromEntries(Object.keys(DEFAULT_PERMISSIONS.Admin).map((moduleName) => [moduleName, true]));
  }
  return rolePermissions;
};

const hasModulePermission = (permissions, role, moduleName) => {
  if (!moduleName) return true;
  if (role === 'Admin') return true;
  return Boolean(permissions?.[role]?.[moduleName]);
};

const resolveRecipients = async (recipientTokens, job) => {
  const recipients = [];
  for (const token of recipientTokens || []) {
    if (token === 'Requested By' && job?.requested_by) {
      recipients.push({ kind: 'person', name: job.requested_by, includeUsers: true, includeArtisans: false });
      continue;
    }
    if (token === 'Assigned Artisan' && job?.issued_to) {
      recipients.push({ kind: 'person', name: job.issued_to, includeUsers: true, includeArtisans: true });
      continue;
    }
    recipients.push({ kind: 'roles', roles: [token] });
  }
  return recipients;
};

const normalizeWorkflowFieldName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const WORKFLOW_FIELD_ALIASES_NORMALIZED = Object.entries(WORKFLOW_FIELD_ALIASES).reduce((acc, [label, key]) => {
  acc[normalizeWorkflowFieldName(label)] = key;
  return acc;
}, {});

const getRecordValueLoose = (record, fieldName) => {
  if (!record || !fieldName) return undefined;
  if (Object.prototype.hasOwnProperty.call(record, fieldName)) return record[fieldName];
  const normalizedName = normalizeWorkflowFieldName(fieldName);
  for (const key of Object.keys(record)) {
    if (normalizeWorkflowFieldName(key) === normalizedName) return record[key];
  }
  return undefined;
};

const getFieldValue = (record, fieldName) => {
  if (!fieldName) return undefined;
  const direct = getRecordValueLoose(record, fieldName);
  if (direct !== undefined && direct !== null && direct !== '') return direct;

  const alias =
    WORKFLOW_FIELD_ALIASES[fieldName] ||
    WORKFLOW_FIELD_ALIASES_NORMALIZED[normalizeWorkflowFieldName(fieldName)];
  if (alias) return getRecordValueLoose(record, alias);
  return undefined;
};

const listMissingMandatoryFields = (record, mandatoryFields = []) => {
  return mandatoryFields.filter((fieldName) => {
    const value = getFieldValue(record, fieldName);
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === '';
  });
};


// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

const authorizeModule = (moduleName) => {
  return async (req, res, next) => {
    try {
      const runtimeConfig = await getMergedRuntimeConfig();
      if (!hasModulePermission(runtimeConfig.permissions, req.user?.role, moduleName)) {
        return res.status(403).json({ error: `Access denied: ${moduleName} is disabled for your role.` });
      }
      req.runtimeConfig = runtimeConfig;
      next();
    } catch (err) {
      next(err);
    }
  };
};

app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'healthy', time: result.rows[0].now });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

app.get('/api/runtime/bootstrap', authenticateToken, async (req, res) => {
  try {
    const runtimeConfig = await getMergedRuntimeConfig();
    res.json({
      global: runtimeConfig.global,
      systemSettings: runtimeConfig.systemSettings,
      permissions: runtimeConfig.permissions,
      moduleAccess: getModuleAccessForRole(runtimeConfig.permissions, req.user?.role),
      masterData: runtimeConfig.raw.master_data || {},
      userRole: req.user?.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Utility to convert snake_case to camelCase
const toCamel = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

// Utility to convert camelCase to snake_case
const toSnake = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj = {};
  for (const key in obj) {
    let snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    // Fix specific acronym casing issues 
    snakeKey = snakeKey.replace(/_h_o_d/g, '_hod');
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

const quoteIdentifier = (value) => `"${String(value).replace(/"/g, '""')}"`;

const csvEscape = (value) => {
  if (value === null || value === undefined) return '""';
  const normalized = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
};

const getPublicTableDefinitions = async () => {
  const [columnsResult, statsResult] = await Promise.all([
    query(
      `SELECT c.table_name,
              c.column_name,
              c.data_type,
              c.ordinal_position,
              CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_primary
       FROM information_schema.columns c
       LEFT JOIN (
         SELECT kcu.table_name, kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
         WHERE tc.table_schema = 'public'
           AND tc.constraint_type = 'PRIMARY KEY'
       ) pk
         ON pk.table_name = c.table_name
        AND pk.column_name = c.column_name
       WHERE c.table_schema = 'public'
       ORDER BY c.table_name, c.ordinal_position`
    ),
    query(
      `SELECT c.relname AS table_name,
              COALESCE(s.n_live_tup::bigint, 0)::bigint AS estimated_rows
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
       WHERE n.nspname = 'public'
         AND c.relkind = 'r'
       ORDER BY c.relname`
    ),
  ]);

  const statsByTable = new Map(
    statsResult.rows.map((row) => [row.table_name, Number(row.estimated_rows || 0)])
  );

  const tables = new Map();
  for (const row of columnsResult.rows) {
    if (!tables.has(row.table_name)) {
      tables.set(row.table_name, {
        tableName: row.table_name,
        columnCount: 0,
        estimatedRows: statsByTable.get(row.table_name) || 0,
        primaryKey: null,
        columns: [],
      });
    }
    const table = tables.get(row.table_name);
    const isPrimary = row.is_primary === true || row.is_primary === 't';
    table.columnCount += 1;
    table.columns.push({
      name: row.column_name,
      dataType: row.data_type,
      isPrimary,
    });
    if (isPrimary && !table.primaryKey) {
      table.primaryKey = row.column_name;
    }
  }

  return Array.from(tables.values()).sort((a, b) => a.tableName.localeCompare(b.tableName));
};

const getPreferredSortColumn = (tableDefinition) => {
  const columnNames = tableDefinition?.columns?.map((column) => column.name) || [];
  if (columnNames.includes('updated_at')) return 'updated_at';
  if (columnNames.includes('created_at')) return 'created_at';
  if (columnNames.includes('archived_at')) return 'archived_at';
  if (tableDefinition?.primaryKey) return tableDefinition.primaryKey;
  return columnNames[0];
};

const ADMIN_CONFIG_KEYS = new Set([
  'permissions',
  'workflow',
  'notifications',
  'retention_months',
  'global',
  'system_settings',
  'master_data',
]);

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const isBoolean = (value) => typeof value === 'boolean';

const isStringArray = (value) => Array.isArray(value) && value.every((v) => typeof v === 'string');

const validatePermissionsConfig = (value) => {
  if (!isPlainObject(value)) return 'permissions must be an object.';
  for (const role of Object.keys(value)) {
    if (!isPlainObject(value[role])) return `permissions.${role} must be an object.`;
    for (const moduleKey of Object.keys(value[role])) {
      if (!isBoolean(value[role][moduleKey])) return `permissions.${role}.${moduleKey} must be boolean.`;
    }
  }
  return null;
};

const validateWorkflowConfig = (value) => {
  if (!isPlainObject(value)) return 'workflow must be an object.';
  for (const step of Object.keys(value)) {
    const rule = value[step];
    if (!isPlainObject(rule)) return `workflow.${step} must be an object.`;
    if (rule.requiredRoles && !isStringArray(rule.requiredRoles)) return `workflow.${step}.requiredRoles must be string array.`;
    if (rule.mandatoryFields && !isStringArray(rule.mandatoryFields)) return `workflow.${step}.mandatoryFields must be string array.`;
    if (rule.nextStatus && typeof rule.nextStatus !== 'string') return `workflow.${step}.nextStatus must be string.`;
    if (rule.returnStatus && typeof rule.returnStatus !== 'string') return `workflow.${step}.returnStatus must be string.`;
    if (rule.emailNotify !== undefined && !isBoolean(rule.emailNotify)) return `workflow.${step}.emailNotify must be boolean.`;
  }
  return null;
};

const validateNotificationsConfig = (value) => {
  if (!isPlainObject(value)) return 'notifications must be an object.';
  for (const eventName of Object.keys(value)) {
    const eventCfg = value[eventName];
    if (!isPlainObject(eventCfg)) return `notifications.${eventName} must be an object.`;
    if (eventCfg.email !== undefined && !isBoolean(eventCfg.email)) return `notifications.${eventName}.email must be boolean.`;
    if (eventCfg.inApp !== undefined && !isBoolean(eventCfg.inApp)) return `notifications.${eventName}.inApp must be boolean.`;
    if (eventCfg.sms !== undefined && !isBoolean(eventCfg.sms)) return `notifications.${eventName}.sms must be boolean.`;
    if (eventCfg.recipients !== undefined && !isStringArray(eventCfg.recipients)) return `notifications.${eventName}.recipients must be string array.`;
  }
  return null;
};

const validateGlobalConfig = (value) => {
  if (!isPlainObject(value)) return 'global must be an object.';
  if (value.appName !== undefined && typeof value.appName !== 'string') return 'global.appName must be string.';
  if (value.timezone !== undefined && typeof value.timezone !== 'string') return 'global.timezone must be string.';
  if (value.broadcastBanner !== undefined && typeof value.broadcastBanner !== 'string') return 'global.broadcastBanner must be string.';
  return null;
};

const validateSystemSettingsConfig = (value) => {
  if (!isPlainObject(value)) return 'system_settings must be an object.';
  if (value.general !== undefined && !isPlainObject(value.general)) return 'system_settings.general must be an object.';
  if (value.auth !== undefined && !isPlainObject(value.auth)) return 'system_settings.auth must be an object.';
  if (value.messaging !== undefined && !isPlainObject(value.messaging)) return 'system_settings.messaging must be an object.';
  if (value.erp !== undefined && !isPlainObject(value.erp)) return 'system_settings.erp must be an object.';
  if (value.storage !== undefined && !isPlainObject(value.storage)) return 'system_settings.storage must be an object.';
  if (value.security !== undefined && !isPlainObject(value.security)) return 'system_settings.security must be an object.';
  if (value.search !== undefined && !isPlainObject(value.search)) return 'system_settings.search must be an object.';
  return null;
};

const validateMasterDataConfig = (value) => {
  if (!isPlainObject(value)) return 'master_data must be an object.';
  for (const group of Object.keys(value)) {
    if (!Array.isArray(value[group])) return `master_data.${group} must be an array.`;
  }
  return null;
};

const validateAdminConfig = (key, value) => {
  if (!ADMIN_CONFIG_KEYS.has(key)) return `Unsupported config key: ${key}`;
  if (key === 'retention_months') {
    if (!Number.isInteger(value) || value < 6 || value > 120) {
      return 'retention_months must be an integer between 6 and 120.';
    }
    return null;
  }
  if (key === 'permissions') return validatePermissionsConfig(value);
  if (key === 'workflow') return validateWorkflowConfig(value);
  if (key === 'notifications') return validateNotificationsConfig(value);
  if (key === 'global') return validateGlobalConfig(value);
  if (key === 'system_settings') return validateSystemSettingsConfig(value);
  if (key === 'master_data') return validateMasterDataConfig(value);
  return null;
};

const notifyPhones = async (phones, message) => {
  const uniquePhones = [...new Set((phones || []).filter(Boolean))];
  if (!message || uniquePhones.length === 0) return;
  for (const phone of uniquePhones) {
    try {
      await sendSms(phone, message);
    } catch (err) {
      console.error(`[SMS] Failed to send to ${phone}:`, err);
    }
  }
};

const recordNotificationDispatch = async ({ jobCardId = null, eventName, channel, recipients = [], message, status }) => {
  await query(
    `INSERT INTO notification_dispatches (id, job_card_id, event_name, channel, recipients, message, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [randomId(), jobCardId, eventName, channel, JSON.stringify(recipients), message, status]
  );
};

const normalizeUsername = (username) => username?.trim();

const getPhonesByRoles = async (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) return [];
  const res = await query(
    `SELECT DISTINCT phone
     FROM users
     WHERE role = ANY($1::text[])
       AND phone IS NOT NULL
       AND phone != ''
       AND COALESCE(status, 'Active') = 'Active'`,
    [roles]
  );
  return res.rows.map((r) => r.phone);
};

const getPhonesByName = async (name, { includeUsers = true, includeArtisans = true } = {}) => {
  if (!name) return [];
  const phones = [];

  if (includeUsers) {
    const userRes = await query(
      `SELECT phone
       FROM users
       WHERE name = $1
         AND phone IS NOT NULL
         AND phone != ''
         AND COALESCE(status, 'Active') = 'Active'`,
      [name]
    );
    phones.push(...userRes.rows.map((r) => r.phone));
  }

  if (includeArtisans) {
    const artisanRes = await query(
      `SELECT phone
       FROM artisans
       WHERE name = $1
         AND phone IS NOT NULL
         AND phone != ''`,
      [name]
    );
    phones.push(...artisanRes.rows.map((r) => r.phone));
  }

  return [...new Set(phones)];
};

const dispatchNotificationPlan = async (plan, runtimeConfig) => {
  if (!plan || !Array.isArray(plan.targets) || !plan.message) return;

  const systemMessaging = runtimeConfig?.systemSettings?.messaging || DEFAULT_SYSTEM_SETTINGS.messaging;
  const enabledChannels = {
    email: systemMessaging.emailEnabled !== false && plan.channels?.email !== false,
    inApp: systemMessaging.pushEnabled !== false && plan.channels?.inApp !== false,
    sms: systemMessaging.smsEnabled !== false && plan.channels?.sms !== false,
  };

  const allPhones = [];
  const recipients = [];
  for (const target of plan.targets) {
    if (!target) continue;
    if (target.kind === 'roles') {
      const rolePhones = await getPhonesByRoles(target.roles || []);
      recipients.push(...(target.roles || []));
      allPhones.push(...rolePhones);
      continue;
    }
    if (target.kind === 'person') {
      if (target.name) recipients.push(target.name);
      const personPhones = await getPhonesByName(target.name, {
        includeUsers: target.includeUsers !== false,
        includeArtisans: target.includeArtisans !== false,
      });
      allPhones.push(...personPhones);
    }
  }

  const uniqueRecipients = [...new Set(recipients)];

  if (enabledChannels.email) {
    await recordNotificationDispatch({
      jobCardId: plan.jobCardId || null,
      eventName: plan.eventName || 'Notification',
      channel: 'email',
      recipients: uniqueRecipients,
      message: plan.message,
      status: 'queued',
    });
  }

  if (enabledChannels.inApp) {
    await recordNotificationDispatch({
      jobCardId: plan.jobCardId || null,
      eventName: plan.eventName || 'Notification',
      channel: 'in_app',
      recipients: uniqueRecipients,
      message: plan.message,
      status: 'queued',
    });
  }

  if (!enabledChannels.sms) {
    await recordNotificationDispatch({
      jobCardId: plan.jobCardId || null,
      eventName: plan.eventName || 'Notification',
      channel: 'sms',
      recipients: uniqueRecipients,
      message: plan.message,
      status: 'disabled',
    });
    return;
  }

  const uniquePhones = [...new Set(allPhones.filter(Boolean))];
  if (uniquePhones.length === 0) {
    await recordNotificationDispatch({
      jobCardId: plan.jobCardId || null,
      eventName: plan.eventName || 'Notification',
      channel: 'sms',
      recipients: uniqueRecipients,
      message: plan.message,
      status: 'no_recipients',
    });
    return;
  }

  await notifyPhones(uniquePhones, plan.message);
  await recordNotificationDispatch({
    jobCardId: plan.jobCardId || null,
    eventName: plan.eventName || 'Notification',
    channel: 'sms',
    recipients: uniqueRecipients,
    message: plan.message,
    status: 'sent',
  });
};

// --- AUTH ENDPOINTS ---

app.post('/api/auth/register', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const { name, username, password, role, department } = req.body;
  const normalizedUsername = normalizeUsername(username);

  if (!name || !normalizedUsername || !password || !role) {
    return res.status(400).json({ error: 'Name, username, password, and role are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    
    await query(
      'INSERT INTO users (id, name, username, password_hash, role, department) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name.trim(), normalizedUsername, passwordHash, role, department?.trim() || null]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed or user already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [normalizedUsername]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const accountStatus = user.status || 'Active';
    if (accountStatus !== 'Active') {
      return res.status(403).json({ error: `Account is ${accountStatus.toLowerCase()}. Please contact an administrator.` });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const loginTimestamp = new Date().toISOString();
    await query('UPDATE users SET last_login = $1 WHERE id = $2', [loginTimestamp, user.id]);
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { password_hash, ...userNoPass } = user;
    res.json({ token, user: toCamel({ ...userNoPass, last_login: loginTimestamp }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  const { role } = req.query;
  try {
    let result;
    if (role === 'Artisan') {
      result = await query("SELECT id, name, phone, trade FROM artisans WHERE status = 'Active' ORDER BY name ASC");
    } else if (role) {
      result = await query('SELECT id, name, username, role, department FROM users WHERE role = $1 ORDER BY name ASC', [role]);
    } else {
      result = await query('SELECT id, name, username, role, department FROM users ORDER BY name ASC');
    }
    res.json(toCamel(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- JOB CARDS ENDPOINTS ---

app.get('/api/job-cards', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM job_cards ORDER BY created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection error' });
  }
});

app.get('/api/job-cards/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM job_cards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/job-cards', authenticateToken, async (req, res) => {
  const { performedBy, ...dataBody } = req.body;
  const sanitizedData = sanitizeJobCardData(dataBody);
  const data = toSnake(sanitizedData);
  const ticketNumber = `JC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = randomId();
  
  const fields = ['id', 'ticket_number', ...Object.keys(data)];
  const values = [id, ticketNumber, ...Object.values(data).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    if (data.status === 'Pending_Supervisor') {
      const tradeAllocations = data.allocated_trades;
      if (!Array.isArray(tradeAllocations) || tradeAllocations.length === 0) {
        return res.status(400).json({ error: 'Missing mandatory workflow fields: Trade Allocation' });
      }
    }

    const runtimeConfig = await getMergedRuntimeConfig();
    const result = await query(
      `INSERT INTO job_cards (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    
    // Record Audit Log
    await createAuditLog(pool, id, 'Initial Creation', performedBy || req.user?.name || 'System', { ticketNumber });

    if (data.status && data.status !== 'Draft') {
      try {
        const createdJob = result.rows[0];
        const plan = getCreationNotificationPlan(createdJob, runtimeConfig);
        await dispatchNotificationPlan(plan, runtimeConfig);
      } catch (err) {
        console.error('[SMS] Create notification dispatcher failed:', err);
      }
    }

    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error('Create failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/job-cards/:id', authenticateToken, async (req, res) => {
  const { performedBy, ...updateData } = req.body;
  const userRole = req.user.role;
  const sanitizedUpdate = sanitizeJobCardData(updateData);
  const updates = toSnake(sanitizedUpdate);
  const fields = Object.keys(updates);
  
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  try {
    const runtimeConfig = await getMergedRuntimeConfig();
    // 1. Fetch current job card to check status
    const currentResult = await query('SELECT * FROM job_cards WHERE id = $1', [req.params.id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const currentRecord = currentResult.rows[0];
    const currentStatus = currentRecord.status;
    const nextStatus = updates.status;
    
    // 2. Validate transition if status is being updated
    if (nextStatus && nextStatus !== currentStatus) {
      if (!isValidTransition(currentStatus, nextStatus, userRole, runtimeConfig.workflow)) {
        return res.status(400).json({ 
          error: `Invalid status transition from ${currentStatus} to ${nextStatus} for role ${userRole || 'Unknown'}` 
        });
      }

      const currentRule = runtimeConfig.workflow?.[currentStatus];
      const mergedRecord = { ...toCamel(currentRecord), ...sanitizedUpdate };
      const missingFields = listMissingMandatoryFields(mergedRecord, currentRule?.mandatoryFields || []);
      if (nextStatus === 'Pending_Supervisor') {
        const trades = mergedRecord?.allocatedTrades;
        if (!Array.isArray(trades) || trades.length === 0) {
          missingFields.push('Trade Allocation');
        }
      }
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing mandatory workflow fields: ${[...new Set(missingFields)].join(', ')}`,
        });
      }
    }

    // 3. Perform update
    const setQuery = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const updateValues = Object.values(updates).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
    const updateResult = await query(
      `UPDATE job_cards SET ${setQuery}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...updateValues]
    );
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // 4. Record Audit Log
    const action = nextStatus && nextStatus !== currentStatus ? 'Status Update' : 'Fields Update';
    const auditDetails = {
      fromStatus: currentStatus,
      toStatus: nextStatus || currentStatus,
      changedFields: fields
    };
    
    await createAuditLog(pool, req.params.id, action, performedBy || req.user?.name || 'System', auditDetails);
    
    // 5. Send role-aware SMS notifications for status transitions
    const updatedJob = updateResult.rows[0];
    if (nextStatus && nextStatus !== currentStatus) {
      try {
        const plan = getStatusNotificationPlan({
          currentStatus,
          nextStatus,
          job: updatedJob,
        }, runtimeConfig);
        await dispatchNotificationPlan(plan, runtimeConfig);
      } catch(e) {
        console.error('[SMS] Notification dispatcher failed:', e);
      }
    }

    res.json(toCamel(updateResult.rows[0]));
  } catch (err) {
    console.error('Patch failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/job-cards/:id/notify-missing-fields', authenticateToken, authorizeRoles('Supervisor', 'EngSupervisor', 'Admin', 'HOD'), async (req, res) => {
  const { missingFields, attemptedStatus } = req.body || {};
  if (!Array.isArray(missingFields) || missingFields.length === 0) {
    return res.status(400).json({ error: 'missingFields must be a non-empty array.' });
  }

  try {
    const result = await query('SELECT * FROM job_cards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Card not found' });

    const job = result.rows[0];
    const requestedBy = job.requested_by;
    if (!requestedBy) {
      return res.status(400).json({ error: 'Cannot notify requester: requestedBy is not set on this job.' });
    }

    const runtimeConfig = await getMergedRuntimeConfig();
    const notificationConfig = runtimeConfig?.notifications?.['Rejection / Return'] || {};
    const channels = {
      email: notificationConfig.email !== false,
      inApp: notificationConfig.inApp !== false,
      sms: notificationConfig.sms === true,
    };

    const safeMissingFields = missingFields
      .map((field) => String(field || '').trim())
      .filter(Boolean)
      .slice(0, 6);

    const statusLabel = String(job.status || '').replaceAll('_', ' ');
    const nextLabel = String(attemptedStatus || '').replaceAll('_', ' ');
    const message = `Megapak Action Required: Job ${job.ticket_number || 'UNKNOWN'} (${job.plant_description || 'Asset'}) cannot move from ${statusLabel}${nextLabel ? ` to ${nextLabel}` : ''}. Missing fields: ${safeMissingFields.join(', ')}. Please update and resubmit.`;

    await dispatchNotificationPlan({
      eventName: 'Missing Workflow Fields',
      jobCardId: job.id,
      channels,
      targets: [{ kind: 'person', name: requestedBy, includeUsers: true, includeArtisans: false }],
      message,
    }, runtimeConfig);

    await createAuditLog(
      pool,
      req.params.id,
      'MISSING_FIELDS_NOTIFICATION_SENT',
      req.user?.name || 'System',
      {
        requestedBy,
        attemptedStatus: attemptedStatus || null,
        missingFields: safeMissingFields,
      }
    );

    res.json({ ok: true, notified: requestedBy, missingFields: safeMissingFields });
  } catch (err) {
    console.error('Missing fields notify failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- ALLOCATION SHEETS ENDPOINTS ---

app.get('/api/allocation-sheets', authenticateToken, authorizeModule('Assignments'), async (req, res) => {
  try {
    const sheetsResult = await query('SELECT * FROM allocation_sheets ORDER BY date DESC, created_at DESC');
    const sheets = toCamel(sheetsResult.rows);
    
    // Fetch all rows for these sheets
    const rowsResult = await query('SELECT * FROM allocation_rows');
    const allRows = toCamel(rowsResult.rows);
    
    // Group rows by sheet_id
    const sheetsWithRows = sheets.map(sheet => ({
      ...sheet,
      rows: allRows.filter(row => row.sheetId === sheet.id)
    }));
    
    res.json(sheetsWithRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/allocation-sheets', authenticateToken, authorizeRoles('Supervisor', 'EngSupervisor', 'Admin'), authorizeModule('Assignments'), async (req, res) => {
  const { supervisor, section, date, rows } = req.body;
  const sheetId = Math.random().toString(36).substr(2, 9);
  
  try {
    // 1. Insert Sheet
    await query(
      'INSERT INTO allocation_sheets (id, supervisor, section, date) VALUES ($1, $2, $3, $4)',
      [sheetId, supervisor, section, date]
    );
    
    // 2. Insert Rows
    const insertedRows = [];
    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        const rowId = Math.random().toString(36).substr(2, 9);
        const rResult = await query(
          'INSERT INTO allocation_rows (id, sheet_id, artisan_name, allocated_task, job_card_number, estimated_time, actual_time_taken) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [rowId, sheetId, row.artisanName, row.allocatedTask, row.jobCardNumber, row.estimatedTime, row.actualTimeTaken]
        );
        insertedRows.push(toCamel(rResult.rows[0]));
      }
    }
    
    await createAuditLog(pool, null, 'ALLOCATION_SHEET_CREATED', req.user?.name || 'System', { sheetId, supervisor, section, date, rowCount: insertedRows.length });

    res.status(201).json({ 
      id: sheetId, 
      supervisor, 
      section, 
      date, 
      rows: insertedRows 
    });
  } catch (err) {
    console.error('Allocation create failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/allocation-sheets/:id', authenticateToken, authorizeRoles('Supervisor', 'EngSupervisor', 'Admin'), authorizeModule('Assignments'), async (req, res) => {
  const { supervisor, section, date, rows } = req.body;
  const sheetId = req.params.id;
  
  try {
    // Update header
    await query(
      'UPDATE allocation_sheets SET supervisor = $1, section = $2, date = $3 WHERE id = $4',
      [supervisor, section, date, sheetId]
    );
    
    // Simpler approach: delete existing rows and re-insert
    await query('DELETE FROM allocation_rows WHERE sheet_id = $1', [sheetId]);
    
    const insertedRows = [];
    if (rows && Array.isArray(rows)) {
      for (const row of rows) {
        const rowId = Math.random().toString(36).substr(2, 9);
        const rResult = await query(
          'INSERT INTO allocation_rows (id, sheet_id, artisan_name, allocated_task, job_card_number, estimated_time, actual_time_taken) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [rowId, sheetId, row.artisanName, row.allocatedTask, row.jobCardNumber, row.estimatedTime, row.actualTimeTaken]
        );
        insertedRows.push(toCamel(rResult.rows[0]));
      }
    }
    
    await createAuditLog(pool, null, 'ALLOCATION_SHEET_UPDATED', req.user?.name || 'System', { sheetId, supervisor, section, date, rowCount: insertedRows.length });

    res.json({ id: sheetId, supervisor, section, date, rows: insertedRows });
  } catch (err) {
    console.error('Allocation update failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/allocation-sheets/:id', authenticateToken, authorizeRoles('Supervisor', 'EngSupervisor', 'Admin'), authorizeModule('Assignments'), async (req, res) => {
  try {
    await query('DELETE FROM allocation_sheets WHERE id = $1', [req.params.id]);
    await createAuditLog(pool, null, 'ALLOCATION_SHEET_DELETED', req.user?.name || 'System', { sheetId: req.params.id });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUDIT LOGS ENDPOINTS ---

app.get('/api/audit-logs/:jobCardId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM audit_logs WHERE job_card_id = $1 ORDER BY created_at DESC',
      [req.params.jobCardId]
    );
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', authenticateToken, async (req, res) => {
  const data = toSnake(req.body);
  const id = Math.random().toString(36).substr(2, 9);
  const fields = ['id', ...Object.keys(data)];
  const values = [id, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await query(
      `INSERT INTO audit_logs (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ASSIGNMENTS ENDPOINTS ---

app.get('/api/assignments', authenticateToken, authorizeModule('Assignments'), async (req, res) => {
  try {
    const result = await query('SELECT * FROM assignments ORDER BY created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assignments/:jobCardId', authenticateToken, authorizeModule('Assignments'), async (req, res) => {
  try {
    const result = await query('SELECT * FROM assignments WHERE job_card_id = $1', [req.params.jobCardId]);
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', authenticateToken, authorizeRoles('Supervisor', 'EngSupervisor', 'Admin'), authorizeModule('Assignments'), async (req, res) => {
  const data = toSnake(req.body);
  const id = Math.random().toString(36).substr(2, 9);
  const fields = ['id', ...Object.keys(data)];
  const values = [id, ...Object.values(data)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const result = await query(
      `INSERT INTO assignments (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/assignments/:id', authenticateToken, authorizeRoles('Supervisor', 'EngSupervisor', 'Admin'), authorizeModule('Assignments'), async (req, res) => {
  const updates = toSnake(req.body);
  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  const setQuery = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

  try {
    const result = await query(
      `UPDATE assignments SET ${setQuery} WHERE id = $1 RETURNING *`,
      [req.params.id, ...Object.values(updates)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    const resultData = toCamel(result.rows[0]);
    await createAuditLog(pool, resultData.jobCardId, 'ASSIGNMENT_UPDATED', req.user?.name || 'System', { assignmentId: req.params.id, updates: fields });
    res.json(resultData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PREVENTIVE MAINTENANCE ENDPOINTS ---

app.get('/api/pm-schedules', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Planning & Records'), async (req, res) => {
  try {
    const result = await query('SELECT * FROM pm_schedules ORDER BY next_run ASC, created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pm-schedules', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Planning & Records'), async (req, res) => {
  const data = toSnake(req.body);
  const id = randomId();
  const fields = ['id', ...Object.keys(data), 'created_by', 'updated_by'];
  const values = [id, ...Object.values(data).map((value) => (typeof value === 'object' && value !== null ? JSON.stringify(value) : value)), req.user?.name || 'System', req.user?.name || 'System'];
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  try {
    const result = await query(
      `INSERT INTO pm_schedules (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    await createAuditLog(pool, null, 'PM_SCHEDULE_CREATED', req.user?.name || 'System', {
      scheduleId: id,
      plantId: req.body.plantId,
      plantName: req.body.plantName,
    });
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/pm-schedules/:id', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Planning & Records'), async (req, res) => {
  const updates = toSnake(req.body);
  const fields = Object.keys(updates);
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

  const setQuery = [...fields.map((field, index) => `${field} = $${index + 2}`), `updated_by = $${fields.length + 2}`, 'updated_at = NOW()'].join(', ');
  const values = Object.values(updates).map((value) => (typeof value === 'object' && value !== null ? JSON.stringify(value) : value));

  try {
    const result = await query(
      `UPDATE pm_schedules SET ${setQuery} WHERE id = $1 RETURNING *`,
      [req.params.id, ...values, req.user?.name || 'System']
    );
    if (!result.rows.length) return res.status(404).json({ error: 'PM schedule not found' });
    await createAuditLog(pool, null, 'PM_SCHEDULE_UPDATED', req.user?.name || 'System', {
      scheduleId: req.params.id,
      changedFields: fields,
    });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pm-schedules/:id', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Planning & Records'), async (req, res) => {
  try {
    await query('DELETE FROM pm_schedules WHERE id = $1', [req.params.id]);
    await createAuditLog(pool, null, 'PM_SCHEDULE_DELETED', req.user?.name || 'System', { scheduleId: req.params.id });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pm-schedules/generate', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Planning & Records'), async (req, res) => {
  const { plantId } = req.body;
  if (!plantId) return res.status(400).json({ error: 'plantId is required' });

  try {
    const plantResult = await query(
      `SELECT plant_number, plant_description, COUNT(*) AS failures, MAX(date_raised) AS last_failure
       FROM job_cards
       WHERE plant_number = $1
       GROUP BY plant_number, plant_description`,
      [plantId]
    );
    if (!plantResult.rows.length) return res.status(404).json({ error: 'No failure history found for this plant' });

    const plant = plantResult.rows[0];
    const existing = await query('SELECT id FROM pm_schedules WHERE plant_id = $1 LIMIT 1', [plantId]);
    if (existing.rows.length) return res.status(409).json({ error: 'A PM schedule for this plant already exists' });

    const id = randomId();
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 14);

    const result = await query(
      `INSERT INTO pm_schedules (id, plant_id, plant_name, frequency, next_run, tasks, priority, notes, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        plant.plant_number,
        plant.plant_description,
        Number(plant.failures) >= 5 ? 'Monthly' : 'Quarterly',
        nextRun.toISOString().slice(0, 10),
        JSON.stringify(['Inspect recurrent failure points', 'Check lubrication status', 'Review maintenance history']),
        Number(plant.failures) >= 5 ? 'High' : 'Medium',
        `Auto-generated from ${plant.failures} recorded failures. Last failure ${plant.last_failure}.`,
        req.user?.name || 'System',
        req.user?.name || 'System',
      ]
    );

    await createAuditLog(pool, null, 'PM_SCHEDULE_GENERATED', req.user?.name || 'System', {
      plantId,
      scheduleId: id,
      failureCount: Number(plant.failures),
    });

    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ARCHIVE ENDPOINTS ---

app.get('/api/archive/records', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Archiving'), async (req, res) => {
  const status = String(req.query.status || 'candidates');
  const search = String(req.query.search || '').trim().toLowerCase();
  const runtimeConfig = await getMergedRuntimeConfig();
  const retentionMonths = runtimeConfig.retentionMonths;

  try {
    const conditions = [];
    const params = [];

    if (status === 'archived') {
      conditions.push('archived_at IS NOT NULL');
    } else {
      params.push(retentionMonths);
      conditions.push(`archived_at IS NULL`);
      conditions.push(`status IN ('Closed', 'SignedOff')`);
      conditions.push(`COALESCE(closed_by_date::date, updated_at::date, created_at::date) < (CURRENT_DATE - ($${params.length}::int || ' months')::interval)`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(LOWER(ticket_number) LIKE $${params.length} OR LOWER(COALESCE(plant_description, '')) LIKE $${params.length})`);
    }

    const result = await query(
      `SELECT *
       FROM job_cards
       WHERE ${conditions.join(' AND ')}
       ORDER BY COALESCE(archived_at, updated_at, created_at) DESC`,
      params
    );

    res.json({
      items: toCamel(result.rows),
      retentionMonths,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/archive/jobs/:id', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Archiving'), async (req, res) => {
  const { reason } = req.body || {};
  try {
    const result = await query(
      `UPDATE job_cards
       SET archived_at = NOW(),
           archived_by = $2,
           archive_reason = $3,
           archive_bucket = 'cold_storage',
           updated_at = NOW()
       WHERE id = $1 AND archived_at IS NULL
       RETURNING *`,
      [req.params.id, req.user?.name || 'System', reason || 'Manual archive']
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Archive candidate not found' });

    await createAuditLog(pool, req.params.id, 'ARCHIVE_EXECUTED', req.user?.name || 'System', {
      archiveReason: reason || 'Manual archive',
    });
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/archive/jobs/:id/retrieve', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Archiving'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE job_cards
       SET archived_at = NULL,
           archived_by = NULL,
           archive_reason = NULL,
           archive_bucket = NULL,
           retrieved_at = NOW(),
           retrieved_by = $2,
           updated_at = NOW()
       WHERE id = $1 AND archived_at IS NOT NULL
       RETURNING *`,
      [req.params.id, req.user?.name || 'System']
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Archived job not found' });
    await createAuditLog(pool, req.params.id, 'ARCHIVE_RETRIEVED', req.user?.name || 'System', {});
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/archive/export', authenticateToken, authorizeRoles('PlanningOffice', 'Admin'), authorizeModule('Archiving'), async (req, res) => {
  try {
    const result = await query(
      `SELECT ticket_number, plant_description, status, issued_to, archived_at, archived_by, archive_reason
       FROM job_cards
       WHERE archived_at IS NOT NULL
       ORDER BY archived_at DESC`
    );
    const csv = [
      'ticket_number,plant_description,status,issued_to,archived_at,archived_by,archive_reason',
      ...result.rows.map((row) => [
        row.ticket_number,
        `"${String(row.plant_description || '').replaceAll('"', '""')}"`,
        row.status,
        `"${String(row.issued_to || '').replaceAll('"', '""')}"`,
        row.archived_at ? new Date(row.archived_at).toISOString() : '',
        `"${String(row.archived_by || '').replaceAll('"', '""')}"`,
        `"${String(row.archive_reason || '').replaceAll('"', '""')}"`,
      ].join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="archived-job-cards.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GLOBAL SEARCH ---

app.get('/api/search', authenticateToken, async (req, res) => {
  const rawQuery = String(req.query.q || '').trim();
  if (rawQuery.length < 2) {
    return res.json({ items: [] });
  }

  try {
    const runtimeConfig = await getMergedRuntimeConfig();
    if (runtimeConfig.systemSettings.search.enabled === false) {
      return res.status(403).json({ error: 'Global search is disabled by system settings.' });
    }

    const limit = Math.min(25, Math.max(5, parseInt(req.query.limit) || runtimeConfig.systemSettings.search.maxResults || 8));
    const like = `%${rawQuery.toLowerCase()}%`;

    const [jobsResult, usersResult, pmResult, archiveResult] = await Promise.all([
      query(
        `SELECT id, ticket_number, plant_description, status, archived_at
         FROM job_cards
         WHERE LOWER(ticket_number) LIKE $1
            OR LOWER(COALESCE(plant_description, '')) LIKE $1
            OR LOWER(COALESCE(defect, '')) LIKE $1
         ORDER BY updated_at DESC
         LIMIT $2`,
        [like, limit]
      ),
      query(
        `SELECT id, name, role, department
         FROM users
         WHERE LOWER(name) LIKE $1
            OR LOWER(username) LIKE $1
         ORDER BY name ASC
         LIMIT $2`,
        [like, limit]
      ),
      query(
        `SELECT id, plant_id, plant_name, frequency, next_run
         FROM pm_schedules
         WHERE LOWER(plant_id) LIKE $1
            OR LOWER(plant_name) LIKE $1
         ORDER BY next_run ASC
         LIMIT $2`,
        [like, limit]
      ),
      query(
        `SELECT id, ticket_number, plant_description
         FROM job_cards
         WHERE archived_at IS NOT NULL
           AND (LOWER(ticket_number) LIKE $1 OR LOWER(COALESCE(plant_description, '')) LIKE $1)
         ORDER BY archived_at DESC
         LIMIT $2`,
        [like, limit]
      ),
    ]);

    const items = [
      ...jobsResult.rows.map((row) => ({
        id: `job-${row.id}`,
        type: row.archived_at ? 'Archived Job Card' : 'Job Card',
        title: row.ticket_number,
        subtitle: `${row.plant_description || 'No plant'} • ${row.status}`,
        route: row.archived_at ? '/planner/archive' : `/job-cards/view/${row.id}`,
      })),
      ...usersResult.rows.map((row) => ({
        id: `user-${row.id}`,
        type: 'User',
        title: row.name,
        subtitle: `${row.role}${row.department ? ` • ${row.department}` : ''}`,
        route: '/admin/users',
      })),
      ...pmResult.rows.map((row) => ({
        id: `pm-${row.id}`,
        type: 'PM Schedule',
        title: `${row.plant_name} (${row.plant_id})`,
        subtitle: `${row.frequency} • next ${row.next_run}`,
        route: '/planner/preventive',
      })),
      ...archiveResult.rows.map((row) => ({
        id: `archive-${row.id}`,
        type: 'Archived Job Card',
        title: row.ticket_number,
        subtitle: row.plant_description || 'Archived record',
        route: '/planner/archive',
      })),
    ].slice(0, limit);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
};

const buildTelemetrySnapshot = async (runtimeConfig) => {
  const dbSizeResult = await query(
    `SELECT pg_database_size(current_database()) AS bytes`
  ).catch(() => ({ rows: [{ bytes: 0 }] }));

  const latestArchiveEvent = await query(
    `SELECT created_at
     FROM audit_logs
     WHERE action IN ('MANUAL_ARCHIVE_SWEEP_TRIGGERED', 'ARCHIVE_EXECUTED', 'ARCHIVE_RETRIEVED')
     ORDER BY created_at DESC
     LIMIT 1`
  ).catch(() => ({ rows: [] }));

  const notificationStats = await query(
    `SELECT channel,
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS month_count,
            COUNT(*) FILTER (WHERE status IN ('sent', 'queued')) AS successful,
            COUNT(*) AS total
     FROM notification_dispatches
     GROUP BY channel`
  ).catch(() => ({ rows: [] }));

  const bytes = Number(dbSizeResult.rows?.[0]?.bytes || 0);
  const storageLimitGb = runtimeConfig.systemSettings.storage.storageLimitGb || 50;
  const storageUsedGb = bytes / (1024 * 1024 * 1024);
  const responseSamples = responseTimes.length ? responseTimes : [0];
  const avgResponseTimeMs = Math.round(responseSamples.reduce((sum, value) => sum + value, 0) / responseSamples.length);
  const p95LatencyMs = Math.round(percentile(responseSamples, 95));

  const notificationByChannel = Object.fromEntries(
    notificationStats.rows.map((row) => [
      row.channel,
      {
        monthCount: Number(row.month_count || 0),
        successful: Number(row.successful || 0),
        total: Number(row.total || 0),
      },
    ])
  );

  const channelHealth = {
    email: runtimeConfig.systemSettings.messaging.emailEnabled ? 'Configured' : 'Disabled',
    sms: runtimeConfig.systemSettings.messaging.smsEnabled ? 'Configured' : 'Disabled',
    push: runtimeConfig.systemSettings.messaging.pushEnabled ? 'Configured' : 'Disabled',
  };

  return {
    storageUsed: `${storageUsedGb.toFixed(2)} GB`,
    storageLimit: `${storageLimitGb} GB`,
    storagePercent: Math.min(100, Math.round((storageUsedGb / storageLimitGb) * 100)),
    avgResponseTime: `${avgResponseTimeMs}ms`,
    p95Latency: `${p95LatencyMs}ms`,
    lastBackup: latestArchiveEvent.rows?.[0]?.created_at
      ? `Recorded ${new Date(latestArchiveEvent.rows[0].created_at).toLocaleString('en-ZW')}`
      : 'No backup event recorded',
    databaseUptime: formatDuration((Date.now() - processStartTime) / 1000),
    cloudHealth: 'Online',
    searchEnabled: runtimeConfig.systemSettings.search.enabled !== false,
    notificationByChannel,
    channelHealth,
  };
};

// --- ADMIN ENDPOINTS ---

app.get('/api/admin/database/tables', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  try {
    const tables = await getPublicTableDefinitions();
    res.json({
      items: tables.map((table) => ({
        tableName: table.tableName,
        columnCount: table.columnCount,
        estimatedRows: table.estimatedRows,
        primaryKey: table.primaryKey,
        columns: table.columns,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/database/:tableName/export', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const tableName = String(req.params.tableName || '').trim();
  const rawQuery = String(req.query.q || '').trim();

  try {
    const tableDefinitions = await getPublicTableDefinitions();
    const tableDefinition = tableDefinitions.find((table) => table.tableName === tableName);
    if (!tableDefinition) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const quotedTableName = quoteIdentifier(tableDefinition.tableName);
    const params = [];
    let whereClause = '';

    if (rawQuery) {
      params.push(`%${rawQuery}%`);
      const clauses = tableDefinition.columns.map((column) => `CAST(${quoteIdentifier(column.name)} AS TEXT) ILIKE $1`);
      whereClause = clauses.length ? `WHERE ${clauses.join(' OR ')}` : '';
    }

    const sortColumn = getPreferredSortColumn(tableDefinition);
    const rowsResult = await query(
      `SELECT *
       FROM ${quotedTableName}
       ${whereClause}
       ORDER BY ${quoteIdentifier(sortColumn)} DESC NULLS LAST`,
      params
    );

    const header = tableDefinition.columns.map((column) => column.name).join(',');
    const lines = rowsResult.rows.map((row) =>
      tableDefinition.columns.map((column) => csvEscape(row[column.name])).join(',')
    );
    const csv = [header, ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${tableDefinition.tableName}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/database/:tableName', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const tableName = String(req.params.tableName || '').trim();
  const rawQuery = String(req.query.q || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(10, parseInt(req.query.limit, 10) || 25));
  const offset = (page - 1) * limit;

  try {
    const tableDefinitions = await getPublicTableDefinitions();
    const tableDefinition = tableDefinitions.find((table) => table.tableName === tableName);
    if (!tableDefinition) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const quotedTableName = quoteIdentifier(tableDefinition.tableName);
    const params = [];
    let whereClause = '';

    if (rawQuery) {
      params.push(`%${rawQuery}%`);
      const clauses = tableDefinition.columns.map((column) => `CAST(${quoteIdentifier(column.name)} AS TEXT) ILIKE $1`);
      whereClause = clauses.length ? `WHERE ${clauses.join(' OR ')}` : '';
    }

    const [countResult, rowsResult] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS total
         FROM ${quotedTableName}
         ${whereClause}`,
        params
      ),
      query(
        `SELECT *
         FROM ${quotedTableName}
         ${whereClause}
         ORDER BY ${quoteIdentifier(getPreferredSortColumn(tableDefinition))} DESC NULLS LAST
         LIMIT $${params.length + 1}
         OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
    ]);

    const total = Number(countResult.rows?.[0]?.total || 0);

    res.json({
      table: {
        tableName: tableDefinition.tableName,
        columnCount: tableDefinition.columnCount,
        estimatedRows: tableDefinition.estimatedRows,
        primaryKey: tableDefinition.primaryKey,
      },
      columns: tableDefinition.columns,
      items: rowsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  try {
    const runtimeConfig = req.runtimeConfig || await getMergedRuntimeConfig();
    const [usersCount, lockedCount, jobCount, auditCount, archivedCount, pmCount, notificationCount] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query("SELECT COUNT(*) FROM users WHERE status = 'Locked'"),
      query('SELECT COUNT(*) FROM job_cards'),
      query('SELECT COUNT(*) FROM audit_logs'),
      query('SELECT COUNT(*) FROM job_cards WHERE archived_at IS NOT NULL'),
      query('SELECT COUNT(*) FROM pm_schedules'),
      query("SELECT COUNT(*) FROM notification_dispatches WHERE created_at >= date_trunc('month', NOW())"),
    ]);

    const usersByRole = await query('SELECT role, COUNT(*) FROM users GROUP BY role');
    const rolesObj = {};
    usersByRole.rows.forEach(r => rolesObj[r.role] = parseInt(r.count));

    // Calculate Top Performers
    const topPerformersRes = await query(`
      SELECT issued_to as name, COUNT(*) as jobs 
      FROM job_cards 
      WHERE status IN ('Closed', 'SignedOff') 
      AND issued_to IS NOT NULL 
      GROUP BY issued_to 
      ORDER BY jobs DESC 
      LIMIT 5
    `);

    const telemetry = await buildTelemetrySnapshot(runtimeConfig);
    const totalRequests = responseTimes.length || 0;
    const errors = responseTimes.length ? 0 : 0;
    const healthy = telemetry.storagePercent < 90 && telemetry.avgResponseTime !== '0ms';

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      lockedUsers: parseInt(lockedCount.rows[0].count),
      jobCards: parseInt(jobCount.rows[0].count),
      auditLogs: parseInt(auditCount.rows[0].count),
      archivedJobs: parseInt(archivedCount.rows[0].count),
      pmSchedules: parseInt(pmCount.rows[0].count),
      notificationVolumeMonth: parseInt(notificationCount.rows[0].count),
      rolesDistribution: rolesObj,
      topPerformers: topPerformersRes.rows,
      systemHealth: healthy ? 'Healthy' : 'Degraded',
      uptime: telemetry.databaseUptime,
      telemetry,
      runtimeConfig: {
        global: runtimeConfig.global,
        systemSettings: runtimeConfig.systemSettings,
      },
      requestStats: {
        totalRequests,
        errors,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  try {
    const result = await query('SELECT id, name, username, role, department, email, phone, employee_id, status, last_login, created_at FROM users ORDER BY created_at DESC');
    res.json(toCamel(result.rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const { name, username, password, role, department, email, employeeId, phone } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    const hash = await bcrypt.hash(password || 'default123', 10);
    const result = await query(
      'INSERT INTO users (id, name, username, password_hash, role, department, email, employee_id, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, username, role, department, email, employee_id, phone, status',
      [id, name, username, hash, role, department, email, employeeId, phone]
    );

    if (role === 'Artisan') {
      try {
        await query(
          'INSERT INTO artisans (name, phone, email, employee_id, trade, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [name, phone || '', email || '', employeeId || '', department || 'General', 'Active']
        );
      } catch (artisansErr) {
        console.error('Artisan insert failed:', artisansErr.message);
        // Fallback if ID is strongly typed as string and required
        try {
          await query(
            'INSERT INTO artisans (id, name, phone, email, employee_id, trade, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [id, name, phone || '', email || '', employeeId || '', department || 'General', 'Active']
          );
        } catch (fallbackErr) {
           console.error('Artisan fallback insert also failed:', fallbackErr.message);
        }
      }
    }

    // Record system-wide audit event
    await createAuditLog(pool, null, 'USER_CREATED', req.user?.name || 'Admin', { name, username, role });

    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/status', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const { status } = req.body;
  try {
    const userRes = await query('SELECT name FROM users WHERE id = $1', [req.params.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    await query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);

    await createAuditLog(
      pool,
      null,
      status === 'Active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      req.user?.name || 'Admin',
      { userId: req.params.id, userName: userRes.rows[0].name }
    );

    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const updates = toSnake(req.body);
  const fields = Object.keys(updates);
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  
  // If password is being updated, hash it
  if (updates.password) {
    updates.password_hash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }
  
  const setQuery = Object.keys(updates).map((f, i) => `${f} = $${i + 2}`).join(', ');

  try {
    const result = await query(
      `UPDATE users SET ${setQuery} WHERE id = $1 RETURNING id, name, username, role, department, email, employee_id, phone, status`,
      [req.params.id, ...Object.values(updates)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    // Sync with artisans table if role is Artisan
    if (user.role === 'Artisan') {
      await query(
        'UPDATE artisans SET name = $1, phone = $2, email = $3, employee_id = $4, trade = $5 WHERE id = $6 OR name = $1',
        [user.name, user.phone, user.email, user.employee_id, user.department, user.id]
      ).catch(e => console.error('Artisan sync failed:', e.message));
    }

    await createAuditLog(pool, null, 'USER_UPDATED', req.user?.name || 'Admin', { userId: req.params.id, updates: Object.keys(updates) });
    res.json(toCamel(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  try {
    const userRes = await query('SELECT name, role FROM users WHERE id = $1', [req.params.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    
    // Also delete from artisans if it was an artisan
    if (user.role === 'Artisan') {
      await query('DELETE FROM artisans WHERE id = $1 OR name = $2', [req.params.id, user.name]).catch(() => {});
    }

    await createAuditLog(pool, null, 'USER_DELETED', req.user?.name || 'Admin', { userId: req.params.id, userName: user.name });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/unlock', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  try {
    const userRes = await query('SELECT name FROM users WHERE id = $1', [req.params.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    await query("UPDATE users SET status = 'Active' WHERE id = $1", [req.params.id]);

    await createAuditLog(pool, null, 'USER_UNLOCKED', req.user?.name || 'Admin', { userId: req.params.id, userName: userRes.rows[0].name });
    res.json({ message: 'User account unlocked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs/export', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const action = String(req.query.action || '').trim();
  const user = String(req.query.user || '').trim();
  try {
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(LOWER(performed_by) LIKE $${params.length} OR LOWER(action) LIKE $${params.length} OR LOWER(COALESCE(details, '')) LIKE $${params.length})`);
    }
    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }
    if (user) {
      params.push(user);
      conditions.push(`performed_by = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT *
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 5000`,
      params
    );

    const rows = result.rows.map((row) => ({
      ...row,
      details: normalizeDetailText(row.details),
      created_at: new Date(row.created_at).toISOString(),
    }));

    const headers = ['timestamp', 'performed_by', 'action', 'job_card_id', 'details'];
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        [
          row.created_at,
          row.performed_by,
          row.action,
          row.job_card_id || '',
          `"${String(row.details || '').replaceAll('"', '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(10, parseInt(req.query.limit) || 25));
  const search = String(req.query.search || '').trim().toLowerCase();
  const action = String(req.query.action || '').trim();
  const user = String(req.query.user || '').trim();
  try {
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(LOWER(performed_by) LIKE $${params.length} OR LOWER(action) LIKE $${params.length} OR LOWER(COALESCE(details, '')) LIKE $${params.length})`);
    }
    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }
    if (user) {
      params.push(user);
      conditions.push(`performed_by = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(`SELECT COUNT(*) FROM audit_logs ${whereClause}`, params);
    params.push(limit);
    params.push((page - 1) * limit);

    const result = await query(
      `SELECT *
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const items = result.rows.map((row) => toCamel({
      ...row,
      details: normalizeDetailText(row.details),
    }));

    res.json({
      items,
      pagination: {
        page,
        limit,
        total: Number(countResult.rows[0].count || 0),
        totalPages: Math.max(1, Math.ceil(Number(countResult.rows[0].count || 0) / limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/config', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  try {
    const runtimeConfig = await getMergedRuntimeConfig();
    res.json({
      ...runtimeConfig.raw,
      permissions: runtimeConfig.permissions,
      workflow: runtimeConfig.workflow,
      notifications: runtimeConfig.notifications,
      global: runtimeConfig.global,
      system_settings: runtimeConfig.systemSettings,
      retention_months: runtimeConfig.retentionMonths,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/config', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'Missing config key' });
  const validationError = validateAdminConfig(key, value);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    await query(
      'INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
      [key, JSON.stringify(value)]
    );

    if (key === 'global') {
      const currentSystemSettings = (await getMergedRuntimeConfig()).systemSettings;
      const nextSystemSettings = {
        ...currentSystemSettings,
        general: {
          ...currentSystemSettings.general,
          ...value,
        },
      };
      await query(
        'INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
        ['system_settings', JSON.stringify(nextSystemSettings)]
      );
    }

    if (key === 'system_settings' && value?.general) {
      await query(
        'INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
        ['global', JSON.stringify(value.general)]
      );
    }

    await createAuditLog(pool, null, 'SYSTEM_CONFIG_UPDATED', req.user?.name || 'Admin', { key });
    res.json({ message: 'Config updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/retention/manual-archive', authenticateToken, authorizeRoles('Admin'), authorizeModule('Admin Controls'), async (req, res) => {
  const execute = req.body?.execute === true;
  try {
    const runtimeConfig = await getMergedRuntimeConfig();
    const retentionMonths = runtimeConfig.retentionMonths;

    const candidateResult = await query(
      `SELECT id, ticket_number, closed_by_date
       FROM job_cards
       WHERE status IN ('Closed', 'SignedOff')
         AND archived_at IS NULL
         AND COALESCE(closed_by_date::date, updated_at::date, created_at::date) < (CURRENT_DATE - ($1::int || ' months')::interval)
       ORDER BY COALESCE(closed_by_date::date, updated_at::date, created_at::date) ASC
       LIMIT 500`,
      [retentionMonths]
    );

    const candidates = candidateResult.rows;

    if (execute && candidates.length > 0) {
      await query(
        `UPDATE job_cards
         SET archived_at = NOW(),
             archived_by = $1,
             archive_reason = 'Retention policy archive',
             archive_bucket = 'cold_storage',
             updated_at = NOW()
         WHERE id = ANY($2::text[])`,
        [req.user?.name || 'Admin', candidates.map((candidate) => candidate.id)]
      );
    }

    await createAuditLog(pool, null, 'MANUAL_ARCHIVE_SWEEP_TRIGGERED', req.user?.name || 'Admin', {
      retentionMonths,
      executed: execute,
      candidateCount: candidates.length,
      candidateSample: candidates.slice(0, 20).map((c) => c.ticket_number),
    });

    res.json({
      message: execute ? 'Manual archive sweep executed.' : 'Manual archive sweep executed in preview mode.',
      retentionMonths,
      executed: execute,
      candidateCount: candidates.length,
      candidates: candidates.slice(0, 50),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT} (exposed to network)`);
  });
}
