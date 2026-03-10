import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Journal from "./pages/Journal";
import Habits from "./pages/Habit";
import FocusTimerPage from "./pages/FocusTimer";
import Tasks from "./pages/Task";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import { Sun, Moon, Cloud, Leaf, Play, Pause, X } from "lucide-react";
import { getToken, clearToken } from "./api";
import { FocusTimerProvider, useFocusTimer } from "./context/FocusTimerContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ── Google OAuth Client ID ───────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "1038749720495-p7a974fn7p5j8sj60qqp1jrlrue46q8j.apps.googleusercontent.com";

// ── Floating mini-timer pill (global, shown on every page) ─────────────────────
function MiniTimer({ navigate }) {
    const { timeLeft, running, targetMinutes, startPause, reset } = useFocusTimer();

    const isActive  = running || timeLeft < targetMinutes * 60;
    const isDone    = timeLeft <= 0;
    const pct       = targetMinutes > 0 ? ((targetMinutes * 60 - timeLeft) / (targetMinutes * 60)) * 100 : 0;

    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    // Only show when timer has been interacted with (not at full idle 25:00)
    if (!isActive) return null;

    return (
        <div
            className={`
                fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border-2
                backdrop-blur-md font-heading font-bold text-sm
                transition-all duration-500 animate-pop cursor-pointer
                ${isDone
                    ? "bg-[#7FB77E] border-[#6CA36B] text-white shadow-[0_0_20px_rgba(127,183,126,0.5)]"
                    : running
                        ? "bg-ghibli-card/90 border-ghibli-accent text-ghibli-text shadow-[0_0_20px_rgba(242,201,76,0.4)]"
                        : "bg-ghibli-card/90 border-ghibli-border text-ghibli-text"
                }
            `}
            onClick={() => navigate("focus")}
            title="Click to go to Focus page"
        >
            {/* Tiny arc progress ring */}
            <div className="relative w-7 h-7 flex-shrink-0">
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
                    <circle
                        cx="14" cy="14" r="11"
                        fill="none"
                        stroke={isDone ? "#fff" : running ? "#F2C94C" : "#7FB77E"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 11}`}
                        strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct / 100)}`}
                        className="transition-all duration-1000"
                    />
                </svg>
                {/* Dot in the center */}
                <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-black ${running ? "animate-pulse-glow" : ""}`}>
                    {isDone ? "✓" : "🍃"}
                </div>
            </div>

            {/* Time display */}
            <span className={`text-base tracking-wider font-ui ${running && !isDone ? "animate-pulse" : ""}`}>
                {isDone ? "Done!" : timeStr}
            </span>

            {/* Tag */}
            <span className="text-[10px] uppercase tracking-widest opacity-60 hidden sm:inline">
                {isDone ? "Session complete" : running ? "focusing" : "paused"}
            </span>

            {/* Play/Pause button */}
            {!isDone && (
                <button
                    className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); startPause(); }}
                    title={running ? "Pause" : "Resume"}
                >
                    {running ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                </button>
            )}

            {/* Close / dismiss button */}
            <button
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-red-400 hover:text-white flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                title="Reset timer"
            >
                <X size={12} />
            </button>
        </div>
    );
}

// ── Inner app (needs the context) ─────────────────────────────────────────────
function AppInner() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
    // Restore user from localStorage so profile info survives page refresh
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("momentum_user");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [page, setPage]   = useState("dashboard");
    const [theme, setTheme] = useState("light");


    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const navigate = (p) => setPage(p);

    const handleLogin = (data) => {
        setUser(data);
        localStorage.setItem("momentum_user", JSON.stringify(data));
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        clearToken();
        localStorage.removeItem("momentum_user");
        setUser(null);
        setIsLoggedIn(false);
        setPage("dashboard");
    };

    const renderPage = () => {
        if (page === "notes")   return <Notes navigate={navigate} />;
        if (page === "habits")  return <Habits navigate={navigate} />;
        if (page === "focus")   return <FocusTimerPage navigate={navigate} />;
        if (page === "tasks")   return <Tasks navigate={navigate} />;
        if (page === "journal") return <Journal navigate={navigate} />;
        return <Dashboard navigate={navigate} />;
    };

    if (!isLoggedIn) {
        return <LoginPage onLogin={handleLogin} />;
    }

    // Hide mini-timer when already on the focus page
    const showMiniTimer = page !== "focus";

    return (
        <div className="min-h-screen bg-ghibli-bg text-ghibli-text flex relative overflow-x-hidden font-ui selection:bg-ghibli-accent selection:text-ghibli-text">

            {/* Theme Toggle + Logout */}
            <div className="fixed top-6 right-6 z-50 flex gap-2">
                <button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="w-12 h-12 rounded-full bg-ghibli-card shadow-sm border-2 border-ghibli-border flex items-center justify-center text-ghibli-text transition-all hover:scale-110 hover:-rotate-12 hover:shadow-md"
                    title="Toggle Theme"
                >
                    {theme === "light" ? <Moon size={22} className="text-[#a8a8a8]" /> : <Sun size={22} className="text-ghibli-accent" />}
                </button>
                <button
                    onClick={handleLogout}
                    className="w-12 h-12 rounded-full bg-ghibli-card shadow-sm border-2 border-ghibli-border flex items-center justify-center text-ghibli-text/60 hover:text-red-400 transition-all hover:scale-110 hover:shadow-md text-xs font-bold font-heading"
                    title="Sign Out"
                >
                    Out
                </button>
            </div>

            {/* Background texture */}
            {theme === "light" && (
                <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-[0.06] pointer-events-none mix-blend-multiply" />
            )}

            {/* Ambient nature decorations */}
            <div className="fixed top-[5%] left-[20%] text-ghibli-primary opacity-[0.05] pointer-events-none mix-blend-multiply animate-float">
                <Cloud size={400} strokeWidth={0.5} />
            </div>
            <div className="fixed top-[15%] right-[10%] text-ghibli-primary opacity-[0.06] pointer-events-none mix-blend-multiply animate-wind" style={{ animationDuration: "40s" }}>
                <Cloud size={300} strokeWidth={0.5} />
            </div>
            <div className="fixed bottom-[-5%] left-[-5%] text-[#52796F] opacity-[0.08] pointer-events-none mix-blend-multiply rotate-[-15deg] animate-breathe" style={{ animationDuration: "6s" }}>
                <Leaf size={500} strokeWidth={0.5} />
            </div>
            <div className="fixed bottom-[10%] right-[-10%] text-ghibli-accent opacity-[0.06] pointer-events-none mix-blend-multiply rotate-[25deg] animate-float" style={{ animationDelay: "3s", animationDuration: "7s" }}>
                <Leaf size={400} strokeWidth={0.5} />
            </div>

            {/* Floating dust motes */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-40">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={`dust-${i}`}
                        className="absolute bg-[#E9C46A] rounded-full blur-[2px] animate-float opacity-50"
                        style={{
                            width:  Math.random() * 6 + 2 + "px",
                            height: Math.random() * 6 + 2 + "px",
                            left:   Math.random() * 100 + "%",
                            top:    Math.random() * 100 + "%",
                            animationDelay:    Math.random() * 5 + "s",
                            animationDuration: Math.random() * 6 + 4 + "s",
                        }}
                    />
                ))}
            </div>

            {/* Ground glow */}
            <div className="fixed bottom-[-40%] left-0 right-0 h-[60%] bg-[#7FA37C] opacity-[0.03] blur-[100px] rounded-[100%] pointer-events-none mix-blend-screen" />

            <Sidebar currentPage={page} navigate={navigate} user={user} />

            <div className="flex-1 h-screen overflow-y-auto w-full relative z-10">
                {renderPage()}
            </div>

            {/* ── Global floating mini-timer ── */}
            {showMiniTimer && <MiniTimer navigate={navigate} />}
        </div>
    );
}

// ── Root: wraps everything in the timer provider + Google OAuth ─────────────────
function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <FocusTimerProvider>
                <AppInner />
            </FocusTimerProvider>
        </GoogleOAuthProvider>
    );
}

export default App;