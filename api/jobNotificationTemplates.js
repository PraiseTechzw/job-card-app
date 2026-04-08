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

const resolveTargets = (notificationConfig, job) => {
  return (notificationConfig?.recipients || []).map((recipient) => {
    if (recipient === 'Requested By') {
      return { kind: 'person', name: job?.requested_by, includeUsers: true, includeArtisans: false };
    }
    if (recipient === 'Assigned Artisan') {
      return { kind: 'person', name: job?.issued_to, includeUsers: true, includeArtisans: true };
    }
    return { kind: 'roles', roles: [recipient] };
  }).filter(Boolean);
};

const buildPlan = ({ eventName, notificationConfig, message, job }) => {
  if (!notificationConfig) return null;
  const channels = {
    email: notificationConfig.email !== false,
    inApp: notificationConfig.inApp !== false,
    sms: notificationConfig.sms === true,
  };
  if (!channels.email && !channels.inApp && !channels.sms) return null;

  return {
    eventName,
    jobCardId: job?.id || null,
    channels,
    targets: resolveTargets(notificationConfig, job),
    message,
  };
};

export function getCreationNotificationPlan(job, runtimeConfig) {
  const status = job?.status;
  if (!status || status === 'Draft') return null;

  if (status === 'Pending_Supervisor') {
    return buildPlan({
      eventName: 'Job Submission',
      notificationConfig: runtimeConfig?.notifications?.['Job Submission'],
      job,
      message: `Megapak: New job ${jobRef(job)} from ${compact(job?.requested_by, 'Initiator')}. Priority ${priorityText(job?.priority)}. Please review and approve.`,
    });
  }

  return null;
}

export function getStatusNotificationPlan({ currentStatus, nextStatus, job }, runtimeConfig) {
  if (!nextStatus || nextStatus === currentStatus) return null;

  switch (nextStatus) {
    case 'Pending_Supervisor':
      return buildPlan({
        eventName: 'Job Submission',
        notificationConfig: runtimeConfig?.notifications?.['Job Submission'],
        job,
        message: `Megapak: Job ${jobRef(job)} submitted by ${compact(job?.requested_by, 'Initiator')}. Priority ${priorityText(job?.priority)}. Supervisor review required.`,
      });
    case 'Pending_HOD':
      return buildPlan({
        eventName: 'Approval Pending',
        notificationConfig: runtimeConfig?.notifications?.['Approval Pending'],
        job,
        message: `Megapak: Job ${jobRef(job)} moved to HOD review. Priority ${priorityText(job?.priority)}. Please approve or reject in portal.`,
      });
    case 'Approved':
      return buildPlan({
        eventName: 'Approval Pending',
        notificationConfig: runtimeConfig?.notifications?.['Approval Pending'],
        job,
        message: `Megapak: Job ${jobRef(job)} approved. Planning registration required. Priority ${priorityText(job?.priority)}.`,
      });
    case 'Registered':
      return buildPlan({
        eventName: 'Approval Pending',
        notificationConfig: runtimeConfig?.notifications?.['Approval Pending'],
        job,
        message: `Megapak: Job ${jobRef(job)} is registered and ready for artisan assignment.`,
      });
    case 'Assigned':
      return buildPlan({
        eventName: 'Job Assignment',
        notificationConfig: runtimeConfig?.notifications?.['Job Assignment'],
        job,
        message: `Megapak Assignment: You are assigned to ${jobRef(job)}. Priority ${priorityText(job?.priority)}. Open portal and start work.`,
      });
    case 'InProgress':
      return buildPlan({
        eventName: 'Job Assignment',
        notificationConfig: runtimeConfig?.notifications?.['Job Assignment'],
        job,
        message: `Megapak Update: Work started on your request ${jobRef(job)}. Current status: ${labelStatus(nextStatus)}.`,
      });
    case 'Awaiting_SignOff':
      return buildPlan({
        eventName: 'Job Completed',
        notificationConfig: runtimeConfig?.notifications?.['Job Completed'],
        job,
        message: `Megapak Action: Work completed for ${jobRef(job)}. Please review and sign off in portal.`,
      });
    case 'SignedOff':
      return buildPlan({
        eventName: 'Job Completed',
        notificationConfig: runtimeConfig?.notifications?.['Job Completed'],
        job,
        message: `Megapak Update: Job ${jobRef(job)} signed off by originator. Supervisor may close ticket after final check.`,
      });
    case 'Closed':
      return buildPlan({
        eventName: 'Closure',
        notificationConfig: runtimeConfig?.notifications?.Closure,
        job,
        message: `Megapak Closed: Job ${jobRef(job)} is now closed. Thank you.`,
      });
    case 'Rejected': {
      const baseReason = compact(job?.supervisor_comments, '');
      const reasonPart = baseReason ? ` Reason: ${baseReason}` : '';
      return buildPlan({
        eventName: 'Rejection / Return',
        notificationConfig: runtimeConfig?.notifications?.['Rejection / Return'],
        job,
        message: `Megapak Alert: Job ${jobRef(job)} was rejected and returned for correction.${reasonPart}`,
      });
    }
    default:
      return null;
  }
}
