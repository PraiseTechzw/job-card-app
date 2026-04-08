export const MODULES = [
  'Job Requests',
  'Approvals',
  'Assignments',
  'Work Execution',
  'Planning & Records',
  'Reporting & Analytics',
  'Archiving',
  'Admin Controls',
];

const allModulesDisabled = Object.fromEntries(MODULES.map((moduleName) => [moduleName, false]));

export const DEFAULT_PERMISSIONS = {
  Initiator: { ...allModulesDisabled, 'Job Requests': true },
  Supervisor: { ...allModulesDisabled, Approvals: true, Assignments: true, 'Reporting & Analytics': true },
  EngSupervisor: { ...allModulesDisabled, Approvals: true, Assignments: true, 'Reporting & Analytics': true },
  Artisan: { ...allModulesDisabled, 'Work Execution': true },
  PlanningOffice: { ...allModulesDisabled, 'Planning & Records': true, 'Reporting & Analytics': true, Archiving: true },
  HOD: { ...allModulesDisabled, Approvals: true, 'Reporting & Analytics': true },
  Admin: Object.fromEntries(MODULES.map((moduleName) => [moduleName, true])),
};

export const DEFAULT_WORKFLOW_CONFIG = {
  Draft: {
    label: 'Draft',
    requiredRoles: ['Initiator', 'Admin'],
    nextStatus: 'Pending_Supervisor',
    returnStatus: 'Rejected',
    mandatoryFields: ['Priority', 'Plant Status', 'Target Date'],
    emailNotify: false,
  },
  Pending_Supervisor: {
    label: 'Supervisor Approval',
    requiredRoles: ['Supervisor', 'EngSupervisor', 'Admin'],
    nextStatus: 'Pending_HOD',
    returnStatus: 'Rejected',
    mandatoryFields: ['Priority', 'Plant Status', 'Trade Allocation'],
    emailNotify: true,
  },
  Pending_HOD: {
    label: 'HOD Approval',
    requiredRoles: ['HOD', 'Admin'],
    nextStatus: 'Approved',
    returnStatus: 'Rejected',
    mandatoryFields: ['Priority', 'Plant Status'],
    emailNotify: true,
  },
  Approved: {
    label: 'Planning Registration',
    requiredRoles: ['PlanningOffice', 'Admin'],
    nextStatus: 'Registered',
    returnStatus: 'Rejected',
    mandatoryFields: ['Priority', 'Plant Status', 'Target Date'],
    emailNotify: true,
  },
  Registered: {
    label: 'Assignment',
    requiredRoles: ['Supervisor', 'EngSupervisor', 'Admin'],
    nextStatus: 'Assigned',
    returnStatus: 'Rejected',
    mandatoryFields: ['Artisan Assignee', 'Trade Allocation', 'Target Date'],
    emailNotify: true,
  },
  Assigned: {
    label: 'Work Start',
    requiredRoles: ['Artisan', 'Admin'],
    nextStatus: 'InProgress',
    returnStatus: 'Rejected',
    mandatoryFields: ['Artisan Assignee'],
    emailNotify: true,
  },
  InProgress: {
    label: 'Work Completion',
    requiredRoles: ['Artisan', 'Admin'],
    nextStatus: 'Awaiting_SignOff',
    returnStatus: 'Rejected',
    mandatoryFields: ['Failure Code'],
    emailNotify: true,
  },
  Awaiting_SignOff: {
    label: 'Originator Sign-Off',
    requiredRoles: ['Initiator', 'Supervisor', 'Admin'],
    nextStatus: 'SignedOff',
    returnStatus: 'InProgress',
    mandatoryFields: [],
    emailNotify: true,
  },
  SignedOff: {
    label: 'Closure',
    requiredRoles: ['Supervisor', 'Admin'],
    nextStatus: 'Closed',
    returnStatus: 'Rejected',
    mandatoryFields: [],
    emailNotify: true,
  },
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  'Job Submission': { email: true, inApp: true, sms: false, recipients: ['Supervisor', 'EngSupervisor'] },
  'Approval Pending': { email: true, inApp: true, sms: true, recipients: ['Supervisor', 'HOD'] },
  'Job Assignment': { email: true, inApp: true, sms: true, recipients: ['Assigned Artisan'] },
  'Job Completed': { email: true, inApp: true, sms: true, recipients: ['Requested By', 'Supervisor'] },
  'Work Overdue': { email: true, inApp: true, sms: true, recipients: ['Supervisor', 'PlanningOffice'] },
  'Rejection / Return': { email: true, inApp: true, sms: true, recipients: ['Requested By'] },
  Closure: { email: true, inApp: true, sms: false, recipients: ['Requested By', 'Assigned Artisan'] },
};

export const DEFAULT_GLOBAL_CONFIG = {
  appName: 'Digital Job Card MMS',
  timezone: 'Africa/Harare',
  broadcastBanner: '',
};

export const DEFAULT_SYSTEM_SETTINGS = {
  auth: {
    provider: 'Local',
    forceResetOnProvisioning: false,
    mfaForPrivileged: true,
  },
  messaging: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    retryAttempts: 5,
    retryBackoffMinutes: 15,
    dailyDigestTime: '08:00',
  },
  erp: {
    endpoint: 'https://mms-sync.africa.corp/node/v2',
    tokenStatus: 'Configured',
    assetSyncLastDelta: null,
    materialSyncLastDelta: null,
  },
  storage: {
    storageLimitGb: 50,
    backupEnabled: true,
    backupStatus: 'Unknown',
    backupProvider: 'Platform Managed',
  },
  security: {
    alertFloodLimitPerPlantPerDay: 100,
    sessionTimeoutMinutes: 1440,
  },
  search: {
    enabled: true,
    maxResults: 8,
  },
};

const mergeSection = (defaults, overrides) => {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return { ...defaults };
  }

  const merged = { ...defaults };
  for (const key of Object.keys(overrides)) {
    const defaultValue = defaults[key];
    const overrideValue = overrides[key];
    if (
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue) &&
      overrideValue &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue)
    ) {
      merged[key] = mergeSection(defaultValue, overrideValue);
      continue;
    }
    merged[key] = overrideValue;
  }
  return merged;
};

export const mergePermissionsConfig = (storedPermissions = {}) => {
  const merged = {};
  for (const role of Object.keys(DEFAULT_PERMISSIONS)) {
    merged[role] = {
      ...DEFAULT_PERMISSIONS[role],
      ...(storedPermissions?.[role] || {}),
    };
  }
  return merged;
};

export const mergeWorkflowConfig = (storedWorkflow = {}) => {
  const merged = {};
  const keys = new Set([...Object.keys(DEFAULT_WORKFLOW_CONFIG), ...Object.keys(storedWorkflow || {})]);
  for (const key of keys) {
    merged[key] = {
      ...(DEFAULT_WORKFLOW_CONFIG[key] || {}),
      ...(storedWorkflow?.[key] || {}),
    };
  }
  return merged;
};

export const mergeNotificationConfig = (storedNotifications = {}) => {
  const merged = {};
  const keys = new Set([...Object.keys(DEFAULT_NOTIFICATION_SETTINGS), ...Object.keys(storedNotifications || {})]);
  for (const key of keys) {
    merged[key] = {
      ...(DEFAULT_NOTIFICATION_SETTINGS[key] || {}),
      ...(storedNotifications?.[key] || {}),
    };
  }
  return merged;
};

export const mergeGlobalConfig = (storedGlobal = {}) => ({
  ...DEFAULT_GLOBAL_CONFIG,
  ...(storedGlobal || {}),
});

export const mergeSystemSettingsConfig = (storedSystemSettings = {}, globalConfig = {}, retentionMonths) => {
  const merged = mergeSection(DEFAULT_SYSTEM_SETTINGS, storedSystemSettings);
  merged.general = {
    ...DEFAULT_GLOBAL_CONFIG,
    ...(globalConfig || {}),
  };
  if (Number.isInteger(retentionMonths)) {
    merged.storage.archiveRetentionMonths = retentionMonths;
  } else if (!Number.isInteger(merged.storage.archiveRetentionMonths)) {
    merged.storage.archiveRetentionMonths = 24;
  }
  return merged;
};

export const getNotificationEventName = ({ currentStatus, nextStatus, isCreation = false }) => {
  if (isCreation || nextStatus === 'Pending_Supervisor') return 'Job Submission';
  if (nextStatus === 'Pending_HOD' || nextStatus === 'Approved') return 'Approval Pending';
  if (nextStatus === 'Assigned') return 'Job Assignment';
  if (nextStatus === 'Awaiting_SignOff' || nextStatus === 'SignedOff') return 'Job Completed';
  if (nextStatus === 'Rejected') return 'Rejection / Return';
  if (nextStatus === 'Closed') return 'Closure';
  if (currentStatus === 'Closed' && nextStatus !== 'Closed') return 'Closure';
  return null;
};

export const normalizeDetailText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const WORKFLOW_FIELD_ALIASES = {
  Priority: 'priority',
  'Plant Status': 'plantStatus',
  'Trade Allocation': 'allocatedTrades',
  'Target Date': 'requiredCompletionDate',
  'Failure Code': 'failureType',
  'Artisan Assignee': 'issuedTo',
};
