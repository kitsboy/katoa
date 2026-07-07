import { describe, expect, it } from 'vitest';
import { asRow, asRows } from '../supabase';

describe('asRow', () => {
  it('returns null for nullish input', () => {
    expect(asRow<{ id: string }>(null)).toBeNull();
    expect(asRow<{ id: string }>(undefined)).toBeNull();
  });

  it('returns the row object for valid data', () => {
    const row = { id: 'abc', title: 'Test' };
    expect(asRow<{ id: string; title: string }>(row)).toEqual(row);
  });
});

describe('asRows', () => {
  it('returns empty array for nullish input', () => {
    expect(asRows<{ id: string }>(null)).toEqual([]);
    expect(asRows<{ id: string }>(undefined)).toEqual([]);
  });

  it('returns the rows array for valid data', () => {
    const rows = [{ id: '1' }, { id: '2' }];
    expect(asRows<{ id: string }>(rows)).toEqual(rows);
  });
});