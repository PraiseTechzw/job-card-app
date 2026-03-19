/**
 * Job Card Workflow Engine
 * Enforces the 9-stage workflow and status transitions.
 */

export const JobCardStatus = {
  DRAFT: 'Draft',
  PENDING_SUPERVISOR: 'Pending_Supervisor',
  PENDING_HOD: 'Pending_HOD',
  APPROVED: 'Approved',
  REGISTERED: 'Registered',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'InProgress',
  AWAITING_SIGN_OFF: 'Awaiting_SignOff',
  SIGNED_OFF: 'SignedOff',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export const VALID_TRANSITIONS = {
  [JobCardStatus.DRAFT]: [JobCardStatus.PENDING_SUPERVISOR, JobCardStatus.REJECTED],
  [JobCardStatus.PENDING_SUPERVISOR]: [JobCardStatus.PENDING_HOD, JobCardStatus.APPROVED, JobCardStatus.REJECTED],
  [JobCardStatus.PENDING_HOD]: [JobCardStatus.APPROVED, JobCardStatus.REJECTED],
  [JobCardStatus.APPROVED]: [JobCardStatus.REGISTERED, JobCardStatus.REJECTED],
  [JobCardStatus.REGISTERED]: [JobCardStatus.ASSIGNED, JobCardStatus.REJECTED],
  [JobCardStatus.ASSIGNED]: [JobCardStatus.IN_PROGRESS, JobCardStatus.REJECTED],
  [JobCardStatus.IN_PROGRESS]: [JobCardStatus.AWAITING_SIGN_OFF, JobCardStatus.REJECTED],
  [JobCardStatus.AWAITING_SIGN_OFF]: [JobCardStatus.SIGNED_OFF, JobCardStatus.REJECTED],
  [JobCardStatus.SIGNED_OFF]: [JobCardStatus.CLOSED, JobCardStatus.REJECTED],
  [JobCardStatus.CLOSED]: [], // Terminal state
  [JobCardStatus.REJECTED]: [JobCardStatus.DRAFT], // Allow restarting from draft if rejected
};

/**
 * Validates a status transition.
 * @param {string} currentStatus The current status of the job card.
 * @param {string} nextStatus The desired next status.
 * @returns {boolean} True if the transition is allowed.
 */
export function isValidTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  
  return allowed.includes(nextStatus);
}
