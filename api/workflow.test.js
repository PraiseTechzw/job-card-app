import { describe, it, expect } from 'vitest';
import { isValidTransition, JobCardStatus } from './workflow';

describe('Job Card Workflow', () => {
  it('should allow valid transitions (Draft -> Pending_Supervisor)', () => {
    expect(isValidTransition(JobCardStatus.DRAFT, JobCardStatus.PENDING_SUPERVISOR, 'Initiator')).toBe(true);
  });

  it('should allow rejecting from most states (Pending_Supervisor -> Rejected)', () => {
    expect(isValidTransition(JobCardStatus.PENDING_SUPERVISOR, JobCardStatus.REJECTED, 'Supervisor')).toBe(true);
  });

  it('should allow restarting from Rejected (Rejected -> Draft)', () => {
    expect(isValidTransition(JobCardStatus.REJECTED, JobCardStatus.DRAFT, 'Initiator')).toBe(true);
  });

  it('should block invalid transitions (Draft -> Closed)', () => {
    expect(isValidTransition(JobCardStatus.DRAFT, JobCardStatus.CLOSED)).toBe(false);
  });

  it('should block transitions from terminal state (Closed -> Approved)', () => {
    expect(isValidTransition(JobCardStatus.CLOSED, JobCardStatus.APPROVED)).toBe(false);
  });

  it('should return true if status hasn\'t changed', () => {
    expect(isValidTransition(JobCardStatus.DRAFT, JobCardStatus.DRAFT)).toBe(true);
  });

  it('should handle undefined or null statuses gracefully', () => {
    expect(isValidTransition(null, JobCardStatus.DRAFT)).toBe(false);
    expect(isValidTransition(JobCardStatus.DRAFT, null)).toBe(false);
  });

  describe('Role-based Transitions', () => {
    it('should allow Initiator to submit Draft -> Pending_Supervisor', () => {
      expect(isValidTransition(JobCardStatus.DRAFT, JobCardStatus.PENDING_SUPERVISOR, 'Initiator')).toBe(true);
    });

    it('should allow Admin to perform any valid transition', () => {
      expect(isValidTransition(JobCardStatus.DRAFT, JobCardStatus.PENDING_SUPERVISOR, 'Admin')).toBe(true);
      expect(isValidTransition(JobCardStatus.PENDING_SUPERVISOR, JobCardStatus.APPROVED, 'Admin')).toBe(true);
    });

    it('should block unauthorized roles from performing transitions', () => {
      expect(isValidTransition(JobCardStatus.PENDING_SUPERVISOR, JobCardStatus.APPROVED, 'Artisan')).toBe(false);
    });

    it('should allow HOD to approve from Pending_HOD', () => {
      expect(isValidTransition(JobCardStatus.PENDING_HOD, JobCardStatus.APPROVED, 'HOD')).toBe(true);
    });

    it('should allow PlanningOffice to register Approved cards', () => {
      expect(isValidTransition(JobCardStatus.APPROVED, JobCardStatus.REGISTERED, 'PlanningOffice')).toBe(true);
    });

    it('should allow EngSupervisor to assign Registered cards', () => {
      expect(isValidTransition(JobCardStatus.REGISTERED, JobCardStatus.ASSIGNED, 'EngSupervisor')).toBe(true);
    });

    it('should allow Artisan to start and complete work', () => {
      expect(isValidTransition(JobCardStatus.ASSIGNED, JobCardStatus.IN_PROGRESS, 'Artisan')).toBe(true);
      expect(isValidTransition(JobCardStatus.IN_PROGRESS, JobCardStatus.AWAITING_SIGN_OFF, 'Artisan')).toBe(true);
    });

    it('should allow Initiator to sign off Awaiting_SignOff', () => {
      expect(isValidTransition(JobCardStatus.AWAITING_SIGN_OFF, JobCardStatus.SIGNED_OFF, 'Initiator')).toBe(true);
    });

    it('should allow Supervisor to close SignedOff cards', () => {
      expect(isValidTransition(JobCardStatus.SIGNED_OFF, JobCardStatus.CLOSED, 'Supervisor')).toBe(true);
    });
  });
});
