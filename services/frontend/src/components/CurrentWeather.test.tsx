import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CurrentWeather from './CurrentWeather';
import { mockWeatherData } from '../test/mocks';

expect.extend(toHaveNoViolations);

describe('CurrentWeather', () => {
    it('renders current weather with metric units', () => {
        render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        expect(screen.getByText('12°C')).toBeInTheDocument();
        expect(screen.getByText('Partly cloudy')).toBeInTheDocument();
        expect(screen.getByText(/Wind: 20.2 km\/h/)).toBeInTheDocument();
        expect(screen.getByText(/Humidity: 82%/)).toBeInTheDocument();
        expect(screen.getByText(/UV: 2/)).toBeInTheDocument();
    });

    it('renders current weather with imperial units', () => {
        render(<CurrentWeather data={mockWeatherData} unit="imperial" />);

        expect(screen.getByText('53.6°F')).toBeInTheDocument();
        expect(screen.getByText(/Wind: 12.5 mph/)).toBeInTheDocument();
    });

    it('displays feels-like temperature in metric', () => {
        render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        expect(screen.getByText(/Feels like 10.5°C/)).toBeInTheDocument();
    });

    it('displays feels-like temperature in imperial', () => {
        render(<CurrentWeather data={mockWeatherData} unit="imperial" />);

        expect(screen.getByText(/Feels like 50.9°F/)).toBeInTheDocument();
    });

    it('renders weather icon with alt text', () => {
        render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        const icon = screen.getByAltText('Partly cloudy');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', expect.stringContaining('116.png'));
    });

    it('returns null when no data provided', () => {
        const { container } = render(<CurrentWeather data={null} unit="metric" />);

        expect(container.firstChild).toBeNull();
    });

    it('has proper accessibility structure', () => {
        render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        const section = screen.getByRole('region', { name: 'Current Weather' });
        expect(section).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
        const { container } = render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('displays all weather metrics', () => {
        render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        // Check all metrics are displayed
        expect(screen.getByText('12°C')).toBeInTheDocument();
        expect(screen.getByText('Partly cloudy')).toBeInTheDocument();
        expect(screen.getByText(/20.2 km\/h/)).toBeInTheDocument();
        expect(screen.getByText(/82%/)).toBeInTheDocument();
        expect(screen.getByText(/UV: 2/)).toBeInTheDocument();
    });

    it('applies glassmorphism styling', () => {
        const { container } = render(<CurrentWeather data={mockWeatherData} unit="metric" />);

        const section = container.querySelector('section');
        expect(section).toHaveClass('backdrop-blur-md');
        expect(section).toHaveClass('bg-white/60');
    });
});
