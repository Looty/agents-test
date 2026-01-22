"use client";

import { useState, useEffect } from "react";

export default function ServerClock() {
    const [time, setTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTime = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
                const res = await fetch(`${apiUrl}/time`);
                if (!res.ok) throw new Error('Failed to fetch server time');
                const data = await res.json();
                setTime(new Date(data.time));
            } catch {
                setError('Unable to fetch server time');
            }
        };

        // Initial fetch
        fetchTime();
        
        // Sync with server every 30 seconds
        const syncInterval = setInterval(fetchTime, 30000);

        // Update display every second using local time
        const displayInterval = setInterval(() => {
            setTime(prevTime => {
                if (!prevTime) return null;
                return new Date(prevTime.getTime() + 1000);
            });
        }, 1000);

        return () => {
            clearInterval(syncInterval);
            clearInterval(displayInterval);
        };
    }, []);

    if (error) {
        return (
            <div className="text-white/80 text-sm" role="status" aria-live="polite">
                {error}
            </div>
        );
    }

    if (!time) {
        return (
            <div className="text-white/80 text-sm" role="status" aria-live="polite">
                Loading time...
            </div>
        );
    }

    return (
        <div className="text-white/90 text-sm font-medium" role="status" aria-live="polite" aria-label="Server time">
            Server Time: {time.toLocaleString()}
        </div>
    );
}
