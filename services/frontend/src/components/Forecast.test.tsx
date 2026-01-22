import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Forecast from './Forecast';
import { mockWeatherData } from '../test/mocks';

expect.extend(toHaveNoViolations);

describe('Forecast', () => {
    it('renders 5-day forecast', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        // Should render all 5 days
        const days = mockWeatherData.forecast.forecastday;
        expect(days).toHaveLength(5);

        // Check that days are rendered
        days.forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
            expect(screen.getByText(dayName)).toBeInTheDocument();
        });
    });

    it('displays temperatures in metric units', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        expect(screen.getByText('14° / 8°')).toBeInTheDocument(); // First day
    });

    it('displays temperatures in imperial units', () => {
        render(<Forecast data={mockWeatherData} unit="imperial" />);

        expect(screen.getByText('57.2° / 46.4°')).toBeInTheDocument(); // First day
    });

    it('displays weather condition icons', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        const icons = screen.getAllByRole('img');
        expect(icons.length).toBeGreaterThan(0);

        // Check first icon
        expect(icons[0]).toHaveAttribute('alt', 'Partly cloudy');
    });

    it('displays precipitation chance', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        expect(screen.getByText('Precip: 30%')).toBeInTheDocument();
        expect(screen.getByText('Precip: 60%')).toBeInTheDocument();
    });

    it('returns null when no data provided', () => {
        const { container } = render(<Forecast data={null} unit="metric" />);

        expect(container.firstChild).toBeNull();
    });

    it('returns null when forecast is missing', () => {
        const dataWithoutForecast = { ...mockWeatherData, forecast: undefined } as any;
        const { container } = render(<Forecast data={dataWithoutForecast} unit="metric" />);

        expect(container.firstChild).toBeNull();
    });

    it('has proper accessibility structure', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        const section = screen.getByRole('region', { name: '5 Day Forecast' });
        expect(section).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
        const { container } = render(<Forecast data={mockWeatherData} unit="metric" />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('displays condition text for each day', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        expect(screen.getAllByText('Partly cloudy')).toHaveLength(2);
        expect(screen.getByText('Rainy')).toBeInTheDocument();
        expect(screen.getByText('Sunny')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('applies correct grid layout', () => {
        const { container } = render(<Forecast data={mockWeatherData} unit="metric" />);

        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-5');
    });

    it('applies glassmorphism styling to cards', () => {
        const { container } = render(<Forecast data={mockWeatherData} unit="metric" />);

        const cards = container.querySelectorAll('.backdrop-blur-sm');
        expect(cards.length).toBeGreaterThan(0);
    });

    it('handles empty forecast array', () => {
        const dataWithEmptyForecast = {
            ...mockWeatherData,
            forecast: { forecastday: [] },
        };

        const { container } = render(<Forecast data={dataWithEmptyForecast} unit="metric" />);

        // Should render section but with no days
        expect(container.querySelector('section')).toBeInTheDocument();
        expect(container.querySelectorAll('.rounded-lg')).toHaveLength(0);
    });

    it('formats dates correctly', () => {
        render(<Forecast data={mockWeatherData} unit="metric" />);

        // Check that day names are abbreviated (e.g., "Mon", "Tue")
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const renderedText = screen.getByRole('region').textContent || '';

        const hasDayName = dayNames.some(day => renderedText.includes(day));
        expect(hasDayName).toBe(true);
    });
});
