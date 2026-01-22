import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from './page';
import { mockWeatherData, mockSearchResults } from '../test/mocks';

expect.extend(toHaveNoViolations);

describe('Home (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        global.fetch = vi.fn();
    });

    it('renders the home page with search bar', () => {
        render(<Home />);

        expect(screen.getByText('Weather')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search for a city or country...')).toBeInTheDocument();
    });

    it('renders unit toggle', () => {
        render(<Home />);

        expect(screen.getByText('°C / km/h')).toBeInTheDocument();
        expect(screen.getByText('°F / mph')).toBeInTheDocument();
    });

    it('loads weather data when location is selected', async () => {
        const user = userEvent.setup();

        // Mock search response
        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            // Mock weather response
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWeatherData,
            });

        render(<Home />);

        // Type in search
        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        // Wait for suggestions
        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        // Click first suggestion
        const suggestion = screen.getAllByRole('button')[2]; // Skip unit toggle buttons
        await user.click(suggestion);

        // Wait for weather data to load
        await waitFor(() => {
            expect(screen.getByText('12°C')).toBeInTheDocument();
        });

        // Check forecast is rendered (multiple instances of 'Partly cloudy')
        expect(screen.getAllByText('Partly cloudy').length).toBeGreaterThan(0);
    });

    it('displays loading state while fetching weather', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => mockWeatherData,
                }), 100))
            );

        render(<Home />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        // Should show loading
        expect(screen.getByText('Loading weather...')).toBeInTheDocument();
    });

    it('displays error when weather fetch fails', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockRejectedValueOnce(new Error('Network error'));

        render(<Home />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        await waitFor(() => {
            expect(screen.getByText(/Network error/)).toBeInTheDocument();
        });
    });

    it('toggles units and updates display', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWeatherData,
            });

        render(<Home />);

        // Load weather first
        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        await waitFor(() => {
            expect(screen.getByText('12°C')).toBeInTheDocument();
        });

        // Toggle to imperial
        const imperialButton = screen.getByText('°F / mph');
        await user.click(imperialButton);

        // Temperature should update
        await waitFor(() => {
            expect(screen.getByText('53.6°F')).toBeInTheDocument();
        });
    });

    it('persists unit selection in localStorage', async () => {
        const user = userEvent.setup();
        render(<Home />);

        const imperialButton = screen.getByText('°F / mph');
        await user.click(imperialButton);

        await waitFor(() => {
            expect(localStorage.getItem('weather_unit')).toBe('imperial');
        });
    });

    it('applies dynamic theme based on weather condition', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWeatherData,
            });

        const { container } = render(<Home />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        await waitFor(() => {
            expect(screen.getByText('12°C')).toBeInTheDocument();
        });

        // Check that gradient is applied (condition is "Partly cloudy")
        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv.className).toContain('bg-gradient-to-b');
    });

    it('displays both current weather and forecast', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWeatherData,
            });

        render(<Home />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        await waitFor(() => {
            // Current weather
            expect(screen.getByText('12°C')).toBeInTheDocument();
        });

        // Also check forecast is rendered
        expect(screen.getAllByText('Partly cloudy').length).toBeGreaterThan(0);
        expect(screen.getByText('14° / 8°')).toBeInTheDocument();
    });

    it('should have no accessibility violations', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWeatherData,
            });

        const { container } = render(<Home />);

        // Load weather to have complete UI
        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        await waitFor(() => {
            expect(screen.getByText('12°C')).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('handles HTTP error responses', async () => {
        const user = userEvent.setup();

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSearchResults,
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

        render(<Home />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const suggestion = screen.getAllByRole('button')[2];
        await user.click(suggestion);

        await waitFor(() => {
            expect(screen.getByText(/Failed to load weather/)).toBeInTheDocument();
        });
    });
});
