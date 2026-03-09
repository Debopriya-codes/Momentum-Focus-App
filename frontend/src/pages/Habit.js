import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Sprout, TreePine, Leaf, Flower2, Loader } from "lucide-react";
import { habits as api } from "../api";

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4"];

function todayIdx()    { return (new Date().getDay() + 6) % 7; }
function currentWeek() { return Math.min(3, Math.floor((new Date().getDate() - 1) / 7)); }

export default function Habit() {
    const [habitList, setHabitList] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [view, setView]           = useState("DAILY");

    const [formVisible, setFormVisible] = useState(false);
    const [habitName, setHabitName]     = useState("");
    const [habitFreq, setHabitFreq]     = useState("DAILY");

    const load = useCallback(async () => {
        try {
            const data = await api.getAll();
            setHabitList(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const addHabit = async () => {
        if (!habitName.trim()) return;
        try {
            const created = await api.create({ name: habitName.trim(), frequency: habitFreq });
            setHabitList(prev => [...prev, created]);
            setHabitName("");
            setFormVisible(false);
        } catch (e) { console.error(e); }
    };

    const toggleHabit = async (id, index) => {
        try {
            const updated = await api.toggle(id, index);
            setHabitList(prev => prev.map(h => h.id === id ? updated : h));
        } catch (e) { console.error(e); }
    };

    const deleteHabit = async (id) => {
        try {
            await api.remove(id);
            setHabitList(prev => prev.filter(h => h.id !== id));
        } catch (e) { console.error(e); }
    };

    const filtered = habitList.filter(h => h.frequency === view);
    const tIdx = todayIdx();
    const wIdx = currentWeek();

    const getPlantStage = (total) => {
        if (total >= 6) return "🌳";
        if (total >= 3) return "🌿";
        if (total >= 1) return "🌱";
        return "🌰";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 w-full p-4 md:p-10 animate-[fadeIn_0.5s_ease-out]">
            
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pl-4 border-b-2 border-ghibli-border/50 pb-6 gap-6">
                <div>
                    <h2 className="text-5xl font-quote font-black text-ghibli-text flex items-center gap-4 drop-shadow-sm">
                        Habit Garden <span className="text-4xl translate-y-[-2px]">🧑‍🌾</span>
                    </h2>
                    <p className="text-ghibli-text/60 font-ui font-semibold text-sm mt-3 italic">
                        "Plant your seeds today, rest in the shade tomorrow."
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex bg-ghibli-surface rounded-full shadow-sm p-1 border-2 border-ghibli-border/50">
                        {["DAILY", "WEEKLY"].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-5 py-2 rounded-full font-heading font-bold text-sm transition-all duration-300 capitalize ${
                                    view === v ? "bg-ghibli-accent text-[#3E3418] shadow-sm transform scale-105" : "text-ghibli-text/60 hover:text-ghibli-text hover:bg-black/5"
                                }`}
                            >
                                {v.toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setFormVisible(!formVisible)}
                        className="w-12 h-12 flex items-center justify-center bg-[#7FB77E] hover:bg-[#6CA36B] text-white rounded-full shadow-[0_4px_12px_rgba(127,183,126,0.3)] transition-all hover:scale-110 hover:-rotate-12"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </header>

            {formVisible && (
                <div className="bg-[#FAF8F1] border-2 border-[#D4C3A3]/40 rounded-3xl p-8 shadow-sm mb-8 relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-[-20px] right-[-20px] opacity-10 blur-sm mix-blend-multiply pointer-events-none">
                        <Flower2 size={150} />
                    </div>
                    <h3 className="font-heading font-bold text-ghibli-text text-xl mb-4 relative z-10 flex items-center gap-2">
                        Plant a new habit seed <Sprout className="text-[#7FB77E]" size={20} />
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end relative z-10">
                        <input
                            autoFocus
                            value={habitName}
                            onChange={e => setHabitName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addHabit()}
                            placeholder="E.g., Read 10 pages..."
                            className="flex-1 w-full bg-ghibli-card border-2 border-[#D4C3A3] rounded-2xl px-5 py-3.5 text-ghibli-text font-ui font-bold focus:outline-none focus:border-[#7FB77E] transition-colors"
                        />
                        <select
                            value={habitFreq}
                            onChange={e => setHabitFreq(e.target.value)}
                            className="w-full md:w-auto appearance-none min-w-[150px] bg-ghibli-card border-2 border-[#D4C3A3] rounded-2xl px-5 py-3.5 text-ghibli-text font-ui font-bold focus:outline-none focus:border-[#7FB77E] transition-colors cursor-pointer"
                        >
                            <option value="DAILY">Daily Crop</option>
                            <option value="WEEKLY">Weekly Crop</option>
                        </select>
                        <button onClick={addHabit} className="bg-[#2F3E46] text-white font-bold font-heading px-8 py-3.5 rounded-2xl shadow-md hover:bg-[#1E2B22] transition-colors hover:shadow-lg w-full md:w-auto">
                            Plant Seed
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20 text-ghibli-primary">
                    <Loader size={36} className="animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {filtered.length === 0 ? (
                        <div className="bg-ghibli-surface border-2 border-dashed border-ghibli-border rounded-3xl p-16 text-center shadow-sm">
                            <TreePine className="opacity-20 text-[#7FB77E] mx-auto mb-4" size={64} />
                            <h3 className="font-heading font-bold text-2xl text-ghibli-text/60 mb-2">Barren Soil</h3>
                            <p className="font-ui text-ghibli-text/40">Your {view.toLowerCase()} garden is empty.<br />Plant some seeds!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((habit, hIdx) => {
                                const labels    = view === "DAILY" ? DAYS : WEEKS;
                                const limitIdx  = view === "DAILY" ? tIdx : wIdx;
                                const log       = habit.checked || [];
                                let totalDone   = 0;

                                return (
                                    <div key={habit.id} className="bg-ghibli-surface border-2 border-ghibli-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group animate-pop hover:-translate-y-1" style={{ animationDelay: `${hIdx * 100}ms` }}>
                                        <div className="flex justify-between items-start mb-6 border-b border-ghibli-border/50 pb-4">
                                            <h4 className="font-heading font-bold text-xl text-ghibli-text pr-4 leading-tight">{habit.name}</h4>
                                            <button
                                                onClick={() => deleteHabit(habit.id)}
                                                className="opacity-0 group-hover:opacity-100 text-[#E07A5F] hover:bg-[#E07A5F]/10 p-2 rounded-full transition-all flex-shrink-0"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center bg-ghibli-bg p-4 rounded-2xl border border-ghibli-border shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                            {labels.map((lbl, i) => {
                                                const isChecked = log[i];
                                                let icon = "🪨";
                                                if (isChecked) {
                                                    totalDone++;
                                                    icon = getPlantStage(totalDone);
                                                } else if (i <= limitIdx) {
                                                    icon = "🍂";
                                                }
                                                return (
                                                    <div key={i} className="flex flex-col items-center gap-2">
                                                        <span className={`text-[10px] font-heading font-bold uppercase tracking-widest ${i === limitIdx ? 'text-[#7FB77E] border-b border-[#7FB77E]' : 'text-[#A3A8A6]'}`}>
                                                            {lbl.slice(0, 3)}
                                                        </span>
                                                        <button
                                                            disabled={i > limitIdx}
                                                            onClick={() => toggleHabit(habit.id, i)}
                                                            className={`text-2xl transition-all duration-300 outline-none
                                                                ${i > limitIdx ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-125 origin-bottom drop-shadow-sm'}
                                                                ${isChecked && i === limitIdx ? 'animate-breathe' : ''}
                                                            `}
                                                            title={i > limitIdx ? "Future" : isChecked ? "Unmark" : "Mark done"}
                                                        >
                                                            {icon}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-5 text-center flex items-center justify-center gap-2">
                                            <Leaf size={14} className={totalDone > 0 ? "text-[#7FB77E]" : "text-[#A3A8A6]"} />
                                            <span className="font-ui font-semibold text-sm text-ghibli-text/60">
                                                {totalDone === 0 ? "Needs watering..." : `${totalDone} drops of growth`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
