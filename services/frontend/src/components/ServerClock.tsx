"use client";

import { useState, useEffect, useRef } from "react";

export default function ServerClock() {
    const [serverOffset, setServerOffset] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const displayIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const syncWithServer = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
                const res = await fetch(`${apiUrl}/time`);
                if (!res.ok) throw new Error('Failed to fetch server time');
                const data = await res.json();
                
                // Calculate offset between server and client
                const serverTime = data.timestamp * 1000;
                const offset = serverTime - Date.now();
                
                setServerOffset(offset);
                setIsInitialized(true);
                setError(null);
            } catch {
                setError('Unable to fetch server time');
            }
        };

        // Initial sync
        syncWithServer();
        
        // Sync with server every 30 seconds
        const syncInterval = setInterval(syncWithServer, 30000);

        return () => {
            clearInterval(syncInterval);
            if (displayIntervalRef.current) {
                clearInterval(displayIntervalRef.current);
            }
        };
    }, []);

    // Update display every second
    useEffect(() => {
        if (!isInitialized) return;

        const updateDisplay = () => {
            // Force re-render to update time display
            setServerOffset(offset => offset);
        };

        displayIntervalRef.current = setInterval(updateDisplay, 1000);

        return () => {
            if (displayIntervalRef.current) {
                clearInterval(displayIntervalRef.current);
            }
        };
    }, [isInitialized]);

    if (error) {
        return (
            <div className="text-white/80 text-sm" role="status" aria-live="polite">
                {error}
            </div>
        );
    }

    if (!isInitialized) {
        return (
            <div className="text-white/80 text-sm" role="status" aria-live="polite">
                Loading time...
            </div>
        );
    }

    // Calculate current server time using offset
    const serverTime = new Date(Date.now() + serverOffset);

    return (
        <div className="text-white/90 text-sm font-medium" role="status" aria-live="off" aria-label="Server time">
            Server Time: {serverTime.toLocaleString()}
        </div>
    );
}
