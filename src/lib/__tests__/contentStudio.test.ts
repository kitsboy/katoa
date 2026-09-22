import { beforeEach, describe, expect, it } from 'vitest';
import { loadStudioDraft, loadStudioVersions, saveStudioDraft, saveStudioVersion } from '../contentStudio';

describe('contentStudio persistence', () => {
  beforeEach(() => localStorage.clear());

  it('autosaves drafts without losing the complete value', () => {
    const value = { project: { title: 'Story', description: 'Why', visibility: 'draft' }, cards: [{ id: 'one', title: 'Goal' }] };
    const saved = saveStudioDraft('project-1', value);
    expect(loadStudioDraft<typeof value>('project-1')).toEqual(saved);
  });

  it('keeps the newest eight versions', () => {
    for (let index = 0; index < 10; index += 1) saveStudioVersion('project-1', { index });
    const versions = loadStudioVersions<{ index: number }>('project-1');
    expect(versions).toHaveLength(8);
    expect(versions[0].value.index).toBe(9);
    expect(versions[7].value.index).toBe(2);
  });
});
