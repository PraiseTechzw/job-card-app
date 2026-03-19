import { describe, it, expect } from 'vitest';
import { isValidTransition, JobCardStatus } from './workflow';

describe('Job Card Workflow', () => {
  it('should allow valid transitions (Draft -> Pending_Supervisor)', () => {
    expect(isValidTransition(JobCardStatus.DRAFT, JobCardStatus.PENDING_SUPERVISOR)).toBe(true);
  });

  it('should allow rejecting from most states (Pending_Supervisor -> Rejected)', () => {
    expect(isValidTransition(JobCardStatus.PENDING_SUPERVISOR, JobCardStatus.REJECTED)).toBe(true);
  });

  it('should allow restarting from Rejected (Rejected -> Draft)', () => {
    expect(isValidTransition(JobCardStatus.REJECTED, JobCardStatus.DRAFT)).toBe(true);
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
});
