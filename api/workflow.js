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

export const ROLE_REQUIREMENTS = {
  // Initiator flows
  [`${JobCardStatus.DRAFT}->${JobCardStatus.PENDING_SUPERVISOR}`]: ['Initiator', 'Admin'],
  [`${JobCardStatus.AWAITING_SIGN_OFF}->${JobCardStatus.SIGNED_OFF}`]: ['Initiator', 'Admin'],
  
  // Supervisor flows
  [`${JobCardStatus.PENDING_SUPERVISOR}->${JobCardStatus.PENDING_HOD}`]: ['Supervisor', 'Admin'],
  [`${JobCardStatus.PENDING_SUPERVISOR}->${JobCardStatus.APPROVED}`]: ['Supervisor', 'Admin'], // If no HOD required?
  [`${JobCardStatus.SIGNED_OFF}->${JobCardStatus.CLOSED}`]: ['Supervisor', 'Admin'],
  
  // HOD flows
  [`${JobCardStatus.PENDING_HOD}->${JobCardStatus.APPROVED}`]: ['HOD', 'Admin'],
  
  // Planning Office
  [`${JobCardStatus.APPROVED}->${JobCardStatus.REGISTERED}`]: ['PlanningOffice', 'Admin'],
  
  // Engineering Supervisor / Production Supervisor
  [`${JobCardStatus.REGISTERED}->${JobCardStatus.ASSIGNED}`]: ['EngSupervisor', 'Supervisor', 'Admin'],
  
  // Artisan flows
  [`${JobCardStatus.ASSIGNED}->${JobCardStatus.IN_PROGRESS}`]: ['Artisan', 'Admin'],
  [`${JobCardStatus.IN_PROGRESS}->${JobCardStatus.AWAITING_SIGN_OFF}`]: ['Artisan', 'Admin'],
  
  // Universal Rejection
  ['ANY->' + JobCardStatus.REJECTED]: ['Supervisor', 'HOD', 'EngSupervisor', 'Admin'],
  
  // universal restart
  [`${JobCardStatus.REJECTED}->${JobCardStatus.DRAFT}`]: ['Initiator', 'Admin'],
};

/**
 * Validates a status transition based on status flow and user role.
 * @param {string} currentStatus The current status of the job card.
 * @param {string} nextStatus The desired next status.
 * @param {string} userRole The role of the user performing the action.
 * @returns {boolean} True if the transition is allowed.
 */
export function isValidTransition(currentStatus, nextStatus, userRole) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) return false;
  
  // Check role requirement
  const transitionKey = `${currentStatus}->${nextStatus}`;
  const requiredRoles = ROLE_REQUIREMENTS[transitionKey] || ROLE_REQUIREMENTS['ANY->' + nextStatus];
  
  if (requiredRoles) {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }
  
  // If no specific role defined but transition is within allowed list, allow it for all
  return true;
}
