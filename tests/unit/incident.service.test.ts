import { describe, it, expect } from 'vitest';
import {
  validateCreateInput,
  validateUpdateInput,
  formatIncidentId,
} from '../../src/backend/services/incident.service.js';

describe('formatIncidentId', () => {
  it('pads single digit IDs', () => {
    expect(formatIncidentId(1)).toBe('INC-001');
  });

  it('pads double digit IDs', () => {
    expect(formatIncidentId(42)).toBe('INC-042');
  });

  it('does not pad triple digit IDs', () => {
    expect(formatIncidentId(100)).toBe('INC-100');
  });

  it('handles four digits', () => {
    expect(formatIncidentId(1234)).toBe('INC-1234');
  });
});

describe('validateCreateInput', () => {
  const validInput = {
    title: 'Database outage',
    severity: 'P1',
    affected_service: 'api-gateway',
    created_by: 1,
  };

  it('returns no errors for valid input', () => {
    expect(validateCreateInput(validInput)).toEqual([]);
  });

  it('rejects missing title', () => {
    const errors = validateCreateInput({ ...validInput, title: '' });
    expect(errors).toContain('Title is required');
  });

  it('rejects whitespace-only title', () => {
    const errors = validateCreateInput({ ...validInput, title: '   ' });
    expect(errors).toContain('Title is required');
  });

  it('rejects title exceeding 200 chars', () => {
    const errors = validateCreateInput({ ...validInput, title: 'a'.repeat(201) });
    expect(errors).toContain('Title must be 200 characters or less');
  });

  it('accepts title at exactly 200 chars', () => {
    const errors = validateCreateInput({ ...validInput, title: 'a'.repeat(200) });
    expect(errors).toEqual([]);
  });

  it('rejects description exceeding 10,000 chars', () => {
    const errors = validateCreateInput({ ...validInput, description: 'x'.repeat(10001) });
    expect(errors).toContain('Description must be 10,000 characters or less');
  });

  it('accepts description at exactly 10,000 chars', () => {
    const errors = validateCreateInput({ ...validInput, description: 'x'.repeat(10000) });
    expect(errors).toEqual([]);
  });

  it('rejects invalid severity', () => {
    const errors = validateCreateInput({ ...validInput, severity: 'P5' });
    expect(errors).toContain('Severity must be one of: P1, P2, P3, P4');
  });

  it('rejects missing affected_service', () => {
    const errors = validateCreateInput({ ...validInput, affected_service: '' });
    expect(errors).toContain('Affected service is required');
  });

  it('accumulates multiple errors', () => {
    const errors = validateCreateInput({
      title: '',
      severity: 'INVALID',
      affected_service: '',
      created_by: 1,
    });
    expect(errors.length).toBe(3);
  });
});

describe('validateUpdateInput', () => {
  it('returns no errors for valid status', () => {
    expect(validateUpdateInput({ status: 'Investigating' })).toEqual([]);
  });

  it('rejects invalid status', () => {
    const errors = validateUpdateInput({ status: 'InProgress' });
    expect(errors).toContain('Status must be one of: Open, Investigating, Resolved, Closed');
  });

  it('rejects invalid severity', () => {
    const errors = validateUpdateInput({ severity: 'P0' });
    expect(errors).toContain('Severity must be one of: P1, P2, P3, P4');
  });

  it('allows undefined fields (no-op update)', () => {
    expect(validateUpdateInput({})).toEqual([]);
  });
});
