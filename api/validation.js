/**
 * Job Card Validation & Sanitization
 */

export const ALLOWED_JOB_CARD_FIELDS = [
  'requestedBy',
  'dateRaised',
  'timeRaised',
  'priority',
  'requiredCompletionDate',
  'plantNumber',
  'plantDescription',
  'plantStatus',
  'defect',
  'workRequest',
  'maintenanceSchedule',
  'allocatedTrades',
  'status',
  // Back Form Fields
  'workDoneDetails',
  'dateFinished',
  'machineDowntime',
  'isBreakdown',
  'hasHistory',
  'supervisorComments',
  // Sign-off Fields
  'approvedBySupervisor',
  'approvedByHOD',
  'issuedTo',
  'registrationPlanning',
  'originatorSignOff',
  'originatorComment',
  'originatorSignOffDate',
  'originatorSignOffTime',
  'closedBy',
  'closureComment',
  'closedByDate',
  'closedByTime'
];

/**
 * Sanitizes input data by only keeping allowed fields.
 * @param {object} data The raw input data.
 * @returns {object} The sanitized data.
 */
export function sanitizeJobCardData(data) {
  const sanitized = {};
  for (const field of ALLOWED_JOB_CARD_FIELDS) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }
  return sanitized;
}
