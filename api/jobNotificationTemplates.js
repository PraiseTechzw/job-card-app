const labelStatus = (status) => (status || '').replaceAll('_', ' ');

const compact = (value, fallback = 'N/A') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
};

const priorityText = (priority) => compact(priority, 'Normal').toUpperCase();

const jobRef = (job) => {
  const ticket = compact(job?.ticket_number, 'UNKNOWN');
  const plant = compact(job?.plant_description, 'General Asset');
  return `${ticket} | ${plant}`;
};

export function getCreationNotificationPlan(job) {
  const status = job?.status;
  if (!status || status === 'Draft') return null;

  if (status === 'Pending_Supervisor') {
    return {
      targets: [{ kind: 'roles', roles: ['Supervisor'] }],
      message: `Megapak: New job ${jobRef(job)} from ${compact(job?.requested_by, 'Initiator')}. Priority ${priorityText(job?.priority)}. Please review and approve.`,
    };
  }

  return null;
}

export function getStatusNotificationPlan({ currentStatus, nextStatus, job }) {
  if (!nextStatus || nextStatus === currentStatus) return null;

  switch (nextStatus) {
    case 'Pending_Supervisor':
      return {
        targets: [{ kind: 'roles', roles: ['Supervisor'] }],
        message: `Megapak: Job ${jobRef(job)} submitted by ${compact(job?.requested_by, 'Initiator')}. Priority ${priorityText(job?.priority)}. Supervisor review required.`,
      };
    case 'Pending_HOD':
      return {
        targets: [{ kind: 'roles', roles: ['HOD'] }],
        message: `Megapak: Job ${jobRef(job)} moved to HOD review. Priority ${priorityText(job?.priority)}. Please approve or reject in portal.`,
      };
    case 'Approved':
      return {
        targets: [{ kind: 'roles', roles: ['PlanningOffice'] }],
        message: `Megapak: Job ${jobRef(job)} approved. Planning registration required. Priority ${priorityText(job?.priority)}.`,
      };
    case 'Registered':
      return {
        targets: [{ kind: 'roles', roles: ['EngSupervisor', 'Supervisor'] }],
        message: `Megapak: Job ${jobRef(job)} is registered and ready for artisan assignment.`,
      };
    case 'Assigned':
      return {
        targets: [{ kind: 'person', name: job?.issued_to, includeUsers: true, includeArtisans: true }],
        message: `Megapak Assignment: You are assigned to ${jobRef(job)}. Priority ${priorityText(job?.priority)}. Open portal and start work.`,
      };
    case 'InProgress':
      return {
        targets: [{ kind: 'person', name: job?.requested_by, includeUsers: true, includeArtisans: false }],
        message: `Megapak Update: Work started on your request ${jobRef(job)}. Current status: ${labelStatus(nextStatus)}.`,
      };
    case 'Awaiting_SignOff':
      return {
        targets: [{ kind: 'person', name: job?.requested_by, includeUsers: true, includeArtisans: false }],
        message: `Megapak Action: Work completed for ${jobRef(job)}. Please review and sign off in portal.`,
      };
    case 'SignedOff':
      return {
        targets: [
          { kind: 'roles', roles: ['Supervisor'] },
          { kind: 'person', name: job?.issued_to, includeUsers: true, includeArtisans: true },
        ],
        message: `Megapak Update: Job ${jobRef(job)} signed off by originator. Supervisor may close ticket after final check.`,
      };
    case 'Closed':
      return {
        targets: [
          { kind: 'person', name: job?.requested_by, includeUsers: true, includeArtisans: false },
          { kind: 'person', name: job?.issued_to, includeUsers: true, includeArtisans: true },
        ],
        message: `Megapak Closed: Job ${jobRef(job)} is now closed. Thank you.`,
      };
    case 'Rejected': {
      const baseReason = compact(job?.supervisor_comments, '');
      const reasonPart = baseReason ? ` Reason: ${baseReason}` : '';
      return {
        targets: [{ kind: 'person', name: job?.requested_by, includeUsers: true, includeArtisans: false }],
        message: `Megapak Alert: Job ${jobRef(job)} was rejected and returned for correction.${reasonPart}`,
      };
    }
    default:
      return null;
  }
}
