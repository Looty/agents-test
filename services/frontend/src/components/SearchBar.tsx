"use client";

import { useEffect, useState } from "react";

type Suggestion = {
    name: string;
    region?: string;
    country?: string;
};

type Props = {
    onSelect: (location: string) => void;
};

export default function SearchBar({ onSelect }: Props) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        const id = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8080/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.slice(0, 6).map((s: any) => ({ name: s.name, region: s.region, country: s.country })));
                }
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(id);
    }, [query]);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <label htmlFor="search" className="sr-only">Search for a city or country</label>
            <input
                id="search"
                className="w-full rounded-full border-2 border-transparent bg-white/20 px-6 py-4 text-lg text-white placeholder-gray-300 shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-white/80 backdrop-blur-sm"
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-autocomplete="list"
                aria-controls={suggestions.length > 0 ? "search-suggestions" : undefined}
            />

            {loading && <div className="absolute right-5 top-4 text-sm text-white/80">Searching...</div>}

            {suggestions.length > 0 && (
                <ul id="search-suggestions" className="absolute z-10 mt-2 w-full max-h-72 overflow-auto rounded-2xl border border-white/20 bg-white/20 p-2 shadow-2xl backdrop-blur-md">
                    {suggestions.map((s, idx) => (
                        <li key={idx}>
                            <button
                                className="w-full text-left rounded-lg px-4 py-3 text-white transition-colors hover:bg-white/20"
                                onClick={() => {
                                    const loc = s.region ? `${s.name}, ${s.region}, ${s.country}` : `${s.name}, ${s.country}`;
                                    setQuery("");
                                    setSuggestions([]);
                                    onSelect(loc);
                                }}
                            >
                                <div className="font-medium">{s.name}</div>
                                <div className="text-sm text-white/80">{s.region ? `${s.region}, ${s.country}` : s.country}</div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
