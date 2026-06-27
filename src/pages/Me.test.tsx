import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Me from './Me';

describe('Me page', () => {
  it('shows Harish Kumar as the founder', () => {
    render(
      <MemoryRouter>
        <Me />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Harish Kumar/i)).toBeInTheDocument();
  });
});
