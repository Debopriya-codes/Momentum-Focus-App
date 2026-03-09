import { useState, useEffect } from "react";
import { Leaf, Droplet, Edit2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { tasks as tasksApi, habits as habitsApi, focus as focusApi } from "../api";
import { useFocusTimer } from "../context/FocusTimerContext";


const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function getDaysInMonth(year, month) {
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return d.toISOString().slice(0, 10);
    });
}

function getMondayStr() {
    const now = new Date(todayStr());
    const day = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    return monday.toISOString().slice(0, 10);
}

function getWeekDates() {
    const monday = new Date(getMondayStr());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}


// ── Components ─────────────────────────────────────────────────────────────────
function computeStreak(habits) {
    let best = 0;
    habits.filter(h => h.frequency === "DAILY").forEach(h => {
        const log = h.checked || [];
        let streak = 0;
        for (let i = log.length - 1; i >= 0; i--) {
            if (log[i]) streak++;
            else break;
        }
        if (streak > best) best = streak;
    });
    return best;
}

// ── Components ─────────────────────────────────────────────────────────────────

// 1. Focus Timer: Vintage Brass Pocket Watch
function FocusBrassWatch({ totalMins, navigate }) {
    const limit = 120; 
    const pct = Math.min((totalMins / limit) * 100, 100);
    const rotation = (pct / 100) * 360; 

    return (
        <div className="flex flex-col items-center p-8 bg-ghibli-surface shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-2 border-ghibli-border rounded-2xl group animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-ghibli-primary text-sm uppercase tracking-widest font-heading font-bold w-full text-center mb-6">Focus Watch</h3>
            
            <div className="relative w-52 h-52 rounded-full flex items-center justify-center bg-ghibli-card shadow-[inset_0_4px_12px_rgba(0,0,0,0.08),_0_12px_24px_rgba(205,231,227,0.2)] border-[10px] border-[#8D6E63] transition-all duration-700 hover:scale-105 group-hover:shadow-[inset_0_4px_12px_rgba(0,0,0,0.08),_0_15px_30px_rgba(233,196,106,0.3)]">
                
                {/* Vintage sunlight fill glow behind the dial when there is time */}
                {totalMins > 0 && (
                   <div 
                      className="absolute inset-0 rounded-full transition-all duration-1000 ease-in"
                      style={{
                          background: `conic-gradient(rgba(233, 196, 106, 0.4) ${pct}%, transparent ${pct}%)`
                      }}
                   />
                )}

                {/* Dial marks */}
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)` }}>
                        <div className={`mx-auto w-1 ${i % 3 === 0 ? 'h-3 bg-ghibli-text' : 'h-2 bg-ghibli-text/40'} mt-1 rounded-full drop-shadow-sm`} />
                    </div>
                ))}
                
                {/* Glowing Needle */}
                <div className="absolute w-full h-full flex items-start justify-center transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10" style={{ transform: `rotate(${rotation}deg)` }}>
                    <div className="w-[3px] h-20 bg-[#8D6E63] mt-4 rounded-full shadow-[0_0_8px_rgba(141,110,99,0.5)]" />
                </div>

                {/* Center brass pivot */}
                <div className="w-4 h-4 rounded-full bg-[#8D6E63] shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-20 border border-white/50" />

                <div className="absolute bottom-10 w-full text-center z-10 group-hover:animate-pulse-glow">
                    <p className="text-2xl font-bold text-ghibli-text font-ui">{totalMins}</p>
                    <p className="text-[9px] text-ghibli-text/60 uppercase tracking-widest font-semibold">minutes</p>
                </div>
            </div>

            <button 
                onClick={() => navigate("focus")}
                className="mt-8 flex items-center gap-2 bg-ghibli-card border-2 border-ghibli-border text-ghibli-text px-6 py-2.5 rounded-full font-heading font-bold shadow-md hover:shadow-lg hover:border-ghibli-accent transition-all hover:-translate-y-1 active:scale-95 group-hover:animate-breathe"
            >
                Start Focus <Leaf size={16} className="text-ghibli-primary transition-transform group-hover:rotate-12" />
            </button>
        </div>
    );
}

// 2. Paper Sticky Note Tasks
function QuestBoard({ tasks }) {
    const today = todayStr();
    const todayTasks = tasks.filter(t => t.date === today);

    return (
        <div className="h-full bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] bg-ghibli-surface/80 border-2 border-ghibli-border rounded-3xl p-6 shadow-sm animate-fade-in-up [animation-delay:150ms] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-2xl font-heading font-bold text-ghibli-text mb-6">Today's Quests</h3>
            
            <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '240px' }}>
                {todayTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-ghibli-text/50 font-ui italic">
                        <Droplet className="mb-2 opacity-50 text-ghibli-primary animate-bounce-soft" size={24} />
                        No quests scheduled. <br/> Enjoy the gentle breeze.
                    </div>
                ) : (
                    todayTasks.map((t, idx) => (
                        <div 
                            key={t.id} 
                            className={`
                                relative p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-ui font-semibold text-ghibli-text transition-all duration-300
                                hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] 
                                ${t.completed ? 'bg-ghibli-border/30 opacity-60' : 'bg-[#FFF8E8]'}
                                ${idx % 2 === 0 ? '-rotate-[0.5deg]' : 'rotate-[1deg]'} hover:rotate-0
                                animate-pop
                            `}
                            style={{ animationDelay: `${idx * 100 + 300}ms` }}
                        >
                            {/* Pin */}
                            <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-red-400 shadow-sm" />
                            
                            <div className="flex items-start gap-3">
                                <span className="opacity-90">{t.completed ? "🌱" : "📜"}</span>
                                <span className={t.completed ? "line-through flex-1" : "flex-1"}>
                                    {t.title}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// 3. Botanical Habit Garden
function HabitGarden({ habits, streak }) {
    const getPlantIcon = (s) => s >= 7 ? "🌳" : s >= 3 ? "🌿" : "🌱";
    const dailyHabits = habits.filter(h => h.frequency === "daily");
    const weekDates = getWeekDates();

    return (
        <div className="h-full bg-ghibli-surface border-2 border-ghibli-border rounded-3xl p-6 shadow-sm flex flex-col animate-fade-in-up [animation-delay:300ms] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-end mb-6 border-b-2 border-ghibli-bg pb-4">
                <div>
                    <h3 className="text-xl font-heading font-bold text-ghibli-text">Habit Garden</h3>
                    <p className="text-sm font-ui text-ghibli-primary font-semibold flex items-center gap-1 mt-1">
                        Current growth: <span className="text-ghibli-accent font-bold drop-shadow-sm">{streak} days</span>
                    </p>
                </div>
                <div className="text-5xl animate-breathe origin-bottom drop-shadow-sm hover:animate-wiggle cursor-pointer">
                    {getPlantIcon(streak)}
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {dailyHabits.length === 0 && (
                    <div className="text-center text-ghibli-text/50 font-ui italic text-sm mt-4">
                        Plant a habit seed to start growing your garden.
                    </div>
                )}
                {dailyHabits.slice(0, 4).map((h, hIdx) => (
                    <div key={h.id} className="animate-pop" style={{ animationDelay: `${hIdx * 100 + 400}ms` }}>
                        <p className="text-xs font-heading font-bold text-ghibli-text/70 mb-1 truncate">{h.name}</p>
                        <div className="flex justify-between bg-ghibli-bg rounded-full px-3 py-1.5 border border-ghibli-border/50 group">
                            {weekDates.map((d, i) => {
                                const isChecked = h.checked && h.checked[i];
                                return (
                                    <span key={i} className={`text-sm ${isChecked ? 'opacity-100 hover:scale-125 transition-transform group-hover:animate-pulse-glow' : 'opacity-20 grayscale'} cursor-default`} title={WEEK_DAYS[i]}>
                                        {isChecked ? getPlantIcon(Math.min(7, i + 1)) : "🌱"}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 4. Activity Flow (Wind Graph)
function ActivityFlowGraph({ yearlyData }) {
    return (
        <div className="bg-ghibli-surface border-2 border-ghibli-border rounded-3xl p-6 shadow-sm w-full animate-fade-in-up [animation-delay:450ms] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-heading font-bold text-ghibli-text">Wind Flow Activity</h3>
                <span className="bg-ghibli-bg text-ghibli-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider hover:bg-white hover:text-ghibli-accent transition-colors cursor-default">
                    Analytics
                </span>
            </div>
            
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#7FB77E" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7FB77E" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="month" 
                            tick={{ fill: "#2F3E46", opacity: 0.6, fontSize: 11, fontFamily: 'Nunito', fontWeight: 700 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <YAxis 
                            tick={{ fill: "#2F3E46", opacity: 0.6, fontSize: 11, fontFamily: 'Nunito', fontWeight: 700 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: '#2F3E46', fontFamily: 'Nunito', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                            itemStyle={{ color: '#7FB77E' }}
                            cursor={{ stroke: '#7FA37C', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="focus"
                            stroke="#7FB77E"
                            strokeWidth={3}
                            fill="url(#windGrad)"
                            dot={{ fill: "var(--color-card)", stroke: "#7FB77E", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: "#F2C94C", stroke: "#2F3E46", strokeWidth: 2 }}
                            isAnimationActive={true}
                            animationDuration={2500}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function JournalCalendar({ tasks }) {
    const { sessions } = useFocusTimer();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = todayStr();
    const days = getDaysInMonth(year, month);
    const firstPad = (new Date(year, month, 1).getDay() + 6) % 7;

    return (
        <div className="bg-ghibli-card border-2 border-ghibli-border rounded-2xl p-6 shadow-sm h-full animate-fade-in-up [animation-delay:600ms] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h3 className="text-xl font-heading font-bold text-ghibli-text mb-6 pb-2 border-b border-ghibli-border/50 text-center">
                {now.toLocaleString("default", { month: "long" })}
            </h3>
            
            <div className="grid grid-cols-7 gap-2 mb-3">
                {WEEK_DAYS.map(d => (
                    <div key={d} className="text-center text-xs text-ghibli-text/40 uppercase tracking-widest font-bold">
                        {d.slice(0, 1)}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstPad }, (_, i) => <div key={`p${i}`} />)}
                {days.map((dateStr, dIdx) => {
                    const isToday = dateStr === today;
                    const hasTasks = tasks.some(t => t.date === dateStr);
                    const hasFocus = sessions.some(s => s.date === dateStr);
                    const day = parseInt(dateStr.slice(8), 10);
                    
                    return (
                        <div key={dateStr} className={`
                            aspect-square rounded-[12px] flex flex-col items-center justify-center transition-all duration-300 relative font-ui
                            animate-pop
                            ${isToday ? "bg-[#F3D99B] text-[#3E3418] shadow-sm transform scale-110 z-10 font-bold hover:scale-125" : 
                              "bg-[#FBF8F2] text-ghibli-text hover:bg-ghibli-card border border-ghibli-border shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md cursor-pointer"
                            }
                        `} style={{ animationDelay: `${(dIdx % 7) * 50 + 700}ms` }}>
                            <span className="text-sm">{day}</span>
                            
                            {(hasTasks || hasFocus) && !isToday && (
                                <span className={`absolute bottom-[-3px] right-[-3px] text-[11px] drop-shadow-sm group-hover:animate-bounce-soft`} title="You grew your garden today!">🍃</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

function Dashboard({ navigate }) {
    const [tasks, setTasks]       = useState([]);
    const [habits, setHabits]     = useState([]);
    const [yearlyData, setYearlyData] = useState(
        Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], focus: 0 }))
    );

    useEffect(() => {
        const load = async () => {
            try {
                const [t, h, y] = await Promise.all([
                    tasksApi.getAll(),
                    habitsApi.getAll(),
                    focusApi.yearly(),
                ]);
                setTasks(t);
                setHabits(h);
                setYearlyData(y);
            } catch (e) {
                console.error("Dashboard load error", e);
            }
        };
        load();
        const id = setInterval(load, 60000);
        return () => clearInterval(id);
    }, []);

    // Drop sessions from local state — we get todayMins from context
    const today = todayStr();
    // Read live focus total from the global timer context
    // so the dashboard watch always matches the running timer
    const { totalTodayMins } = useFocusTimer();
    const streak = computeStreak(habits);

    const isEvening = new Date().getHours() >= 17;
    const isMorning = new Date().getHours() < 12;
    const timeGreeting = isMorning ? "Good Morning" : isEvening ? "Good Evening" : "Good Afternoon";
    const timeIcon = isMorning ? "☀️" : isEvening ? "🌙" : "🍃";

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out] w-full p-4 md:p-10">
            
            {/* Storybook Header */}
            <header className="mb-8 pl-4">
                <h2 className="text-5xl font-quote font-black text-ghibli-text mb-3 flex items-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                {timeGreeting} 🌿<span className="text-4xl translate-y-[-4px] drop-shadow-none">{timeIcon}</span>
                </h2>
                <p className="text-ghibli-text/70 font-semibold text-lg ml-1 font-heading tracking-wide italic bg-ghibli-card/40 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/60 shadow-sm">
                    "Small steps grow forests."
                </p>
            </header>

            {/* Top Row: Focus Center + Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-4 h-[380px]">
                    <FocusBrassWatch totalMins={totalTodayMins} navigate={navigate} />
                </div>
                <div className="lg:col-span-4 h-[380px]">
                    <QuestBoard tasks={tasks} />
                </div>
                <div className="lg:col-span-4 h-[380px]">
                    <HabitGarden habits={habits} streak={streak} />
                </div>
            </div>

            {/* Bottom Row: Graph + Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-8">
                    <ActivityFlowGraph yearlyData={yearlyData} />
                </div>
                <div className="lg:col-span-4">
                    <JournalCalendar tasks={tasks} habits={habits} />
                </div>
            </div>

            {/* Glowing Firefly FAB */}
            <button 
                onClick={() => navigate("notes")}
                className="fixed bottom-10 right-10 z-50 w-14 h-14 bg-ghibli-accent rounded-full flex items-center justify-center text-[#3E3418] border-2 border-[#fff] shadow-[0_0_20px_rgba(242,201,76,0.5)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(242,201,76,0.8)] group animate-float"
            >
                <div className="absolute inset-0 bg-ghibli-card/20 rounded-full blur animate-breathe group-hover:bg-ghibli-card/40" />
                <Edit2 size={24} className="relative z-10" />
            </button>

        </div>
    );
}

export default Dashboard;