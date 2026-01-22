"use client";

import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import UnitToggle from "../components/UnitToggle";
import CurrentWeather from "../components/CurrentWeather";
import Forecast from "../components/Forecast";

export default function Home() {
  const [location, setLocation] = useState<string | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('weather_unit');
    if (stored === 'imperial') setUnit('imperial');
  }, []);

  useEffect(() => {
    if (!location) return;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
        const res = await fetch(`${apiUrl}/weather?location=${encodeURIComponent(location)}`);
        if (!res.ok) throw new Error('Failed to load weather');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  const themeClass = (cond?: string) => {
    if (!cond) return 'from-sky-400 to-blue-600'; // Default gradient
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('shower')) return 'from-blue-400 to-gray-600';
    if (c.includes('cloud')) return 'from-gray-400 to-gray-600';
    if (c.includes('clear') || c.includes('sun')) return 'from-yellow-300 to-orange-500';
    if (c.includes('snow')) return 'from-white to-blue-300';
    return 'from-sky-400 to-blue-600';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeClass(data?.current?.condition?.text)} transition-colors duration-500`}>
      <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-shadow-lg">
              Weather
            </h1>
          </header>

          <div className="mb-6">
            <SearchBar onSelect={(loc) => setLocation(loc)} />
            <div className="mt-4 flex justify-end">
              <UnitToggle onChange={(u) => setUnit(u)} />
            </div>
          </div>

          {loading && <div className="text-center text-white text-lg">Loading...</div>}
          {error && (
            <div className="mt-6 text-center text-red-200 bg-red-900 bg-opacity-60 rounded-lg p-4">
              {error}
            </div>
          )}

          {data && (
            <div className="grid grid-cols-1 gap-6">
              <CurrentWeather data={data} unit={unit} />
              <Forecast data={data} unit={unit} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
