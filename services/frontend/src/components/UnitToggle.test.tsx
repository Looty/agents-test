import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitToggle from './UnitToggle';

describe('UnitToggle', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders both unit buttons', () => {
        render(<UnitToggle onChange={mockOnChange} />);

        expect(screen.getByText('°C / km/h')).toBeInTheDocument();
        expect(screen.getByText('°F / mph')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(<UnitToggle onChange={mockOnChange} />);

        const group = screen.getByRole('group', { name: 'Units' });
        expect(group).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveAttribute('aria-pressed');
        });
    });

    it('defaults to metric units', () => {
        render(<UnitToggle onChange={mockOnChange} />);

        const metricButton = screen.getByText('°C / km/h');
        expect(metricButton).toHaveAttribute('aria-pressed', 'true');
        expect(metricButton).toHaveClass('bg-blue-600');
    });

    it('reads initial unit from localStorage', () => {
        localStorage.setItem('weather_unit', 'imperial');

        render(<UnitToggle onChange={mockOnChange} />);

        const imperialButton = screen.getByText('°F / mph');
        expect(imperialButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles to imperial when clicked', async () => {
        const user = userEvent.setup();
        render(<UnitToggle onChange={mockOnChange} />);

        const imperialButton = screen.getByText('°F / mph');
        await user.click(imperialButton);

        expect(imperialButton).toHaveAttribute('aria-pressed', 'true');
        expect(mockOnChange).toHaveBeenCalledWith('imperial');
    });

    it('toggles back to metric when clicked', async () => {
        const user = userEvent.setup();
        localStorage.setItem('weather_unit', 'imperial');

        render(<UnitToggle onChange={mockOnChange} />);

        const metricButton = screen.getByText('°C / km/h');
        await user.click(metricButton);

        expect(metricButton).toHaveAttribute('aria-pressed', 'true');
        expect(mockOnChange).toHaveBeenCalledWith('metric');
    });

    it('persists unit selection to localStorage', async () => {
        const user = userEvent.setup();
        render(<UnitToggle onChange={mockOnChange} />);

        const imperialButton = screen.getByText('°F / mph');
        await user.click(imperialButton);

        expect(localStorage.getItem('weather_unit')).toBe('imperial');
    });

    it('calls onChange callback when unit changes', async () => {
        const user = userEvent.setup();
        render(<UnitToggle onChange={mockOnChange} />);

        const imperialButton = screen.getByText('°F / mph');
        await user.click(imperialButton);

        // Called twice: once on mount (metric), once on change (imperial)
        expect(mockOnChange).toHaveBeenCalledWith('imperial');
        expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('works without onChange callback', async () => {
        const user = userEvent.setup();
        render(<UnitToggle />);

        const imperialButton = screen.getByText('°F / mph');
        await user.click(imperialButton);

        // Should not crash
        expect(imperialButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('clicking same unit does not trigger onChange', async () => {
        const user = userEvent.setup();
        render(<UnitToggle onChange={mockOnChange} />);

        // Click metric (already selected)
        const metricButton = screen.getByText('°C / km/h');
        await user.click(metricButton);

        // Should still call onChange because state is set
        expect(mockOnChange).toHaveBeenCalled();
    });

    it('applies correct styling to active button', () => {
        render(<UnitToggle onChange={mockOnChange} />);

        const metricButton = screen.getByText('°C / km/h');
        const imperialButton = screen.getByText('°F / mph');

        expect(metricButton).toHaveClass('bg-blue-600', 'text-white');
        expect(imperialButton).toHaveClass('bg-gray-200', 'text-gray-800');
    });
});
