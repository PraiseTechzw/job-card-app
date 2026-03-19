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
  'plantNumberText',
  'plantDescription',
  'plantStatus',
  'defect',
  'maintenanceSchedule',
  'workRequest',
  'allocatedTrades',
  'issuedTo',
  'status',
  // Back Form Fields
  'workDoneDetails',
  'isBreakdown',
  'resourceUsage',
  'dateFinished',
  'startHours',
  'causeOfFailure',
  'machineDowntime',
  'numArtisans',
  'numApprentices',
  'numAssistants',
  'hasHistory',
  'furtherWorkRequired',
  'supervisorComments',
  'sparesOrdered',
  'sparesWithdrawn',
  // Sign-off Fields
  'approvedBySupervisor',
  'approvedByHOD',
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
