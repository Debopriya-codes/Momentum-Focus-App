import { Pause, Play, RotateCcw, CheckCircle2, Leaf, Wind, Sun } from "lucide-react";
import { useFocusTimer } from "../context/FocusTimerContext";

const PRESET_MINUTES = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120];

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatMins(mins) {
    if (mins === 0) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

// ── Brass watch face component ────────────────────────────────────────────────
function InteractiveBrassWatch({ progress, timeStr, running, totalMins }) {
    const pct      = Math.min(progress, 100);
    const rotation = (pct / 100) * 360;

    return (
        <div className="relative w-80 h-80 rounded-full flex items-center justify-center bg-ghibli-card shadow-[inset_0_8px_24px_rgba(0,0,0,0.06),_0_20px_40px_rgba(168,218,220,0.25)] border-[14px] border-[#D4A373] transition-all duration-700 hover:scale-[1.02] mx-auto">

            {/* Sunlight fill arc */}
            {running && (
                <div
                    className="absolute inset-0 rounded-full opacity-50 mix-blend-multiply transition-all duration-1000 ease-linear"
                    style={{ background: `conic-gradient(rgba(242,201,76,0.4) ${pct}%, transparent ${pct}%)` }}
                />
            )}

            {/* Tick marks */}
            {[...Array(60)].map((_, i) => (
                <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 6}deg)` }}>
                    <div className={`mx-auto w-1 ${i % 5 === 0 ? "h-4 bg-ghibli-text" : "h-2 bg-ghibli-text/30"} mt-2 rounded-full`} />
                </div>
            ))}

            {/* Needle */}
            <div
                className="absolute w-full h-full flex items-start justify-center z-10 transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="w-[4px] h-32 bg-ghibli-accent mt-6 rounded-full shadow-[0_0_12px_#F2C94C]" />
            </div>

            {/* Pivot */}
            <div className="w-6 h-6 rounded-full bg-[#D4A373] shadow-[0_2px_8px_rgba(0,0,0,0.4)] z-20 border-2 border-white/60" />

            {/* Time label */}
            <div className="absolute bottom-16 w-full text-center z-10">
                <p className={`text-5xl font-bold font-ui drop-shadow-sm transition-colors duration-500 ${running ? "text-ghibli-primary" : "text-ghibli-text"}`}>
                    {timeStr}
                </p>
                <p className="text-xs text-ghibli-text/50 uppercase tracking-[0.2em] font-bold mt-2 font-heading">{totalMins} min session</p>
            </div>
        </div>
    );
}

// ── Main Focus Page ────────────────────────────────────────────────────────────
export default function FocusTimerPage() {
    const {
        targetMinutes, timeLeft, running, progress,
        todaySessions, totalTodayMins,
        startPause, reset, setPreset,
    } = useFocusTimer();

    const todayStr = new Date().toISOString().slice(0, 10);

    return (
        <div className="max-w-6xl mx-auto space-y-10 w-full p-4 md:p-10 animate-[fadeIn_0.5s_ease-out]">

            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pl-4 border-b-2 border-ghibli-border/50 pb-6">
                <div>
                    <h2 className="text-5xl font-quote font-black text-ghibli-text flex items-center gap-4 drop-shadow-sm">
                        Focus Forest <TreeIcon size={40} className="text-[#52796F] translate-y-[-2px]" />
                    </h2>
                    <p className="text-ghibli-text/60 font-ui font-semibold text-sm mt-3 italic">
                        "The wind rises... We must try to live."
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ── Timer ── */}
                <div className="lg:col-span-8 flex flex-col items-center">
                    <InteractiveBrassWatch
                        progress={progress}
                        timeStr={formatTime(timeLeft)}
                        running={running}
                        totalMins={targetMinutes}
                    />

                    {/* Controls */}
                    <div className="flex gap-6 justify-center mt-12 mb-10 w-full">
                        <button
                            onClick={startPause}
                            disabled={timeLeft <= 0}
                            className={`flex items-center gap-3 px-10 py-4 rounded-full font-heading font-bold text-xl transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                running
                                    ? "bg-[#E07A5F] hover:bg-[#D46A4F] text-white"
                                    : "bg-ghibli-accent hover:bg-[#E5B93D] text-[#3E3418]"
                            }`}
                        >
                            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                            {running ? "Pause Focus" : timeLeft <= 0 ? "Session Done!" : "Start Focus"}
                        </button>

                        <button
                            onClick={reset}
                            className="p-4 rounded-full bg-ghibli-card border-2 border-ghibli-border text-ghibli-text/60 hover:text-ghibli-text hover:border-ghibli-text/30 shadow-sm transition-all hover:rotate-[-45deg]"
                            title="Reset Timer"
                        >
                            <RotateCcw size={24} />
                        </button>
                    </div>

                    {/* Preset pills */}
                    <div className="bg-ghibli-card/40 border-2 border-white/50 backdrop-blur-md rounded-3xl p-6 w-full shadow-sm">
                        <p className="text-center font-heading font-bold text-ghibli-text/50 uppercase tracking-widest text-xs mb-4">Focus Duration</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {PRESET_MINUTES.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setPreset(m)}
                                    className={`px-4 py-2 rounded-xl text-sm font-ui font-bold transition-all shadow-sm ${
                                        targetMinutes === m && !running
                                            ? "bg-[#7FB77E] text-white scale-105"
                                            : "bg-ghibli-card text-ghibli-text border border-ghibli-border hover:shadow-md hover:-translate-y-0.5"
                                    }`}
                                >
                                    {m}m
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Sidebar stats ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Today total */}
                    <div className="bg-[#A8DADC]/30 border-2 border-[#A8DADC]/50 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 opacity-20 transform group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                            <Sun size={120} className="text-ghibli-accent" />
                        </div>
                        <p className="font-heading font-bold text-[#2F3E46]/60 uppercase tracking-widest text-xs mb-1">Focused Today</p>
                        <h3 className="text-5xl font-quote font-black text-[#2F3E46] mb-4">
                            {formatMins(totalTodayMins)}
                        </h3>
                        {todaySessions.length > 0 && (
                            <div className="flex items-center gap-2 text-sm font-ui font-bold text-[#52796F]">
                                <Leaf size={16} />
                                {todaySessions.length} session{todaySessions.length !== 1 ? "s" : ""} completed
                            </div>
                        )}
                    </div>

                    {/* Session log */}
                    <div className="bg-ghibli-card border-2 border-ghibli-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "430px" }}>
                        <h4 className="font-heading font-bold text-xl text-ghibli-text mb-4 pb-3 border-b border-ghibli-border/50">
                            Today's Journey
                        </h4>
                        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                            {todaySessions.length === 0 ? (
                                <div className="text-center py-10 opacity-50 font-ui italic">
                                    <Wind size={32} className="mx-auto mb-3 text-[#A8DADC]" />
                                    No focus sessions yet.<br />The forest awaits.
                                </div>
                            ) : (
                                todaySessions.map(s => (
                                    <div key={s.id} className="flex items-center justify-between bg-ghibli-card border border-ghibli-border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow animate-pop">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#7FB77E]/20 flex items-center justify-center text-[#7FB77E]">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <span className="font-ui font-bold text-ghibli-text">{s.duration} min</span>
                                        </div>
                                        <span className="text-xs font-heading font-bold text-ghibli-text/40">{s.time}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TreeIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 21v-4" />
            <path d="m14.5 17-2.5-3" />
            <path d="M12 14v-4" />
            <path d="m9.5 17 2.5-3" />
            <path d="M10 10v-3" />
            <path d="M14 10v-3" />
            <path d="M12 7V3" />
            <path d="M6 14C4.3 14 3 12.7 3 11c0-1.7 1.3-3 3-3 0 0 0-2 2-2s2 2 2 2h4s0-2 2-2 2 2 2 2c1.7 0 3 1.3 3 3 0 1.7-1.3 3-3 3" />
        </svg>
    );
}
