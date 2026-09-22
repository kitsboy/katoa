import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreatorStoryChapters } from '../CreatorStoryChapters';

const chapters = [
  { id: 'story', eyebrow: 'Who I am', title: 'Meet the creator', body: 'A clear introduction.', detail: 'The context.' },
  { id: 'goal', eyebrow: 'The goal', title: 'What support unlocks', body: 'A concrete goal.', detail: 'The next step.' },
];

describe('CreatorStoryChapters', () => {
  it('opens a chapter and reveals progressive detail', () => {
    render(<CreatorStoryChapters chapters={chapters} demo />);
    expect(screen.getByText('A clear introduction.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /What support unlocks/ }));
    expect(screen.getByText('A concrete goal.')).toBeInTheDocument();
    expect(screen.getByText('The next step.')).toBeInTheDocument();
  });
});
