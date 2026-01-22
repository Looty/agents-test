import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ServerClock from './ServerClock';

expect.extend(toHaveNoViolations);

describe('ServerClock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('displays loading state initially', () => {
        global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves
        render(<ServerClock />);

        expect(screen.getByText('Loading time...')).toBeInTheDocument();
    });

    it('displays server time when fetch succeeds', async () => {
        const mockTime = '2024-01-15T12:30:00Z';
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ time: mockTime, timestamp: 1705322400 }),
        });

        render(<ServerClock />);

        await waitFor(() => {
            expect(screen.getByText(/Server Time:/)).toBeInTheDocument();
        });
    });

    it('displays error message when fetch fails', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<ServerClock />);

        await waitFor(() => {
            expect(screen.getByText('Unable to fetch server time')).toBeInTheDocument();
        });
    });

    it('displays error when response is not ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
        });

        render(<ServerClock />);

        await waitFor(() => {
            expect(screen.getByText('Unable to fetch server time')).toBeInTheDocument();
        });
    });

    it('has proper accessibility attributes', async () => {
        const mockTime = '2024-01-15T12:30:00Z';
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ time: mockTime, timestamp: 1705322400 }),
        });

        render(<ServerClock />);

        await waitFor(() => {
            const timeDisplay = screen.getByRole('status');
            expect(timeDisplay).toHaveAttribute('aria-live', 'polite');
        });
    });

    it('should have no accessibility violations', async () => {
        const mockTime = '2024-01-15T12:30:00Z';
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ time: mockTime, timestamp: 1705322400 }),
        });

        const { container } = render(<ServerClock />);

        await waitFor(() => {
            expect(screen.getByText(/Server Time:/)).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
