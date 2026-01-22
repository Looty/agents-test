"use client";

import { useEffect, useState } from "react";

type Props = {
    onChange?: (unit: "metric" | "imperial") => void;
};

export default function UnitToggle({ onChange }: Props) {
    const [unit, setUnit] = useState<"metric" | "imperial">("metric");

    useEffect(() => {
        const stored = localStorage.getItem("weather_unit");
        if (stored === "imperial") setUnit("imperial");
    }, []);

    useEffect(() => {
        localStorage.setItem("weather_unit", unit);
        onChange?.(unit);
    }, [unit, onChange]);

    return (
        <div className="inline-flex items-center rounded-full bg-white/20 p-1 backdrop-blur-sm" role="group" aria-label="Units">
            <button
                className={`px-5 py-2 text-md font-semibold rounded-full transition-colors duration-300 ${unit === "metric" ? "bg-white text-blue-600 shadow-lg" : "text-white hover:bg-white/10"}`}
                onClick={() => setUnit("metric")}
                aria-pressed={unit === "metric"}
            >
                °C
            </button>
            <button
                className={`px-5 py-2 text-md font-semibold rounded-full transition-colors duration-300 ${unit === "imperial" ? "bg-white text-blue-600 shadow-lg" : "text-white hover:bg-white/10"}`}
                onClick={() => setUnit("imperial")}
                aria-pressed={unit === "imperial"}
            >
                °F
            </button>
        </div>
    );
}
