import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { mockSearchResults } from '../test/mocks';

describe('SearchBar', () => {
    const mockOnSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        global.fetch = vi.fn();
    });

    it('renders search input with correct placeholder', () => {
        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByPlaceholderText('Search for a city or country...');
        expect(input).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByLabelText('Search for a city or country');
        expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('displays loading state when fetching suggestions', async () => {
        const user = userEvent.setup();
        (global.fetch as any).mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({
                ok: true,
                json: async () => mockSearchResults,
            }), 100))
        );

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        // Should show loading while debouncing/fetching
        await waitFor(() => {
            expect(screen.getByText('Searching...')).toBeInTheDocument();
        });
    });

    it('fetches and displays suggestions after debounce', async () => {
        const user = userEvent.setup();
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSearchResults,
        });

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        // Wait for debounce and fetch
        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        // Should display multiple suggestions
        const suggestions = screen.getAllByRole('button');
        expect(suggestions).toHaveLength(3);
    });

    it('calls onSelect when a suggestion is clicked', async () => {
        const user = userEvent.setup();
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSearchResults,
        });

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const firstSuggestion = screen.getAllByRole('button')[0];
        await user.click(firstSuggestion);

        expect(mockOnSelect).toHaveBeenCalledWith('London, City of London, Greater London, United Kingdom');
    });

    it('clears input and suggestions after selection', async () => {
        const user = userEvent.setup();
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSearchResults,
        });

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox') as HTMLInputElement;
        await user.type(input, 'London');

        await waitFor(() => {
            expect(screen.getByText('City of London, Greater London, United Kingdom')).toBeInTheDocument();
        });

        const firstSuggestion = screen.getAllByRole('button')[0];
        await user.click(firstSuggestion);

        expect(input.value).toBe('');
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('does not fetch when query is empty', async () => {
        const user = userEvent.setup();
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSearchResults,
        });

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');
        await user.clear(input);

        await waitFor(() => {
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    it('handles fetch errors gracefully', async () => {
        const user = userEvent.setup();
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'London');

        await waitFor(() => {
            // Should not crash and should not show suggestions
            expect(screen.queryByRole('list')).not.toBeInTheDocument();
        });
    });

    it('debounces search requests', async () => {
        const user = userEvent.setup({ delay: null });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSearchResults,
        });

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');

        // Type quickly
        await user.type(input, 'Lon');

        // Should only fetch once after debounce
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    it('handles location without region correctly', async () => {
        const user = userEvent.setup();
        const resultsWithoutRegion = [
            {
                name: 'Paris',
                country: 'France',
            },
        ];

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => resultsWithoutRegion,
        });

        render(<SearchBar onSelect={mockOnSelect} />);

        const input = screen.getByRole('textbox');
        await user.type(input, 'Paris');

        await waitFor(() => {
            expect(screen.getByText('Paris')).toBeInTheDocument();
        });

        const suggestion = screen.getByRole('button');
        await user.click(suggestion);

        expect(mockOnSelect).toHaveBeenCalledWith('Paris, France');
    });
});
