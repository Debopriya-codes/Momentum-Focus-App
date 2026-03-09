import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { focus as api } from "../api";

// ── Context ───────────────────────────────────────────────────────────────────
const FocusTimerContext = createContext(null);

export function useFocusTimer() {
    const ctx = useContext(FocusTimerContext);
    if (!ctx) throw new Error("useFocusTimer must be used inside FocusTimerProvider");
    return ctx;
}

// ── Provider — mounts once at the App level ───────────────────────────────────
export function FocusTimerProvider({ children }) {
    const [targetMinutes, setTargetMinutes] = useState(25);
    const [timeLeft, setTimeLeft]           = useState(25 * 60);
    const [running, setRunning]             = useState(false);
    const [sessions, setSessions]           = useState([]);
    const [totalTodayMins, setTotalTodayMins] = useState(0);

    // Track whether we've loaded sessions from the API already
    const loadedRef = useRef(false);

    const loadSessions = useCallback(async () => {
        try {
            const [all, todaySummary] = await Promise.all([api.getAll(), api.today()]);
            setSessions(all);
            setTotalTodayMins(todaySummary.totalMinutes || 0);
        } catch (e) {
            // Backend might not be running yet — fail silently
        }
    }, []);

    useEffect(() => {
        if (!loadedRef.current) {
            loadedRef.current = true;
            loadSessions();
        }
    }, [loadSessions]);

    // ── The main countdown — survives page changes ────────────────────────────
    useEffect(() => {
        if (!running) return;
        if (timeLeft <= 0) {
            setRunning(false);

            // Play a chime
            try {
                const audio = new Audio("https://actions.google.com/sounds/v1/nature/bird_chirp.ogg");
                audio.volume = 0.5;
                audio.play().catch(() => {});
            } catch (_) {}

            // Save completed session to backend
            const sessionData = {
                duration: targetMinutes,
                date:     new Date().toISOString().slice(0, 10),
                time:     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            api.create(sessionData)
                .then(created => {
                    setSessions(prev => [created, ...prev]);
                    setTotalTodayMins(prev => prev + targetMinutes);
                })
                .catch(console.error);

            return;
        }

        const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [running, timeLeft, targetMinutes]);

    // ── Control helpers ───────────────────────────────────────────────────────
    const startPause = () => {
        if (timeLeft <= 0) return; // Don't start a finished timer
        setRunning(r => !r);
    };

    const reset = () => {
        setRunning(false);
        setTimeLeft(targetMinutes * 60);
    };

    const setPreset = (mins) => {
        setRunning(false);
        setTargetMinutes(mins);
        setTimeLeft(mins * 60);
    };

    const progress = targetMinutes > 0
        ? ((targetMinutes * 60 - timeLeft) / (targetMinutes * 60)) * 100
        : 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter(s => s.date === todayStr);

    return (
        <FocusTimerContext.Provider value={{
            targetMinutes, timeLeft, running, progress,
            sessions, todaySessions, totalTodayMins,
            startPause, reset, setPreset,
            refreshSessions: loadSessions,
        }}>
            {children}
        </FocusTimerContext.Provider>
    );
}
