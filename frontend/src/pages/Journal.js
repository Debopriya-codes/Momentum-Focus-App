import { useState, useCallback } from "react";
import { BookOpen, CalendarDays, Edit2, Info, ChevronLeft, ChevronRight, Check, Loader } from "lucide-react";
import { journal as api } from "../api";

const TABS = [
  { id: "gratitude",    label: "Gratitude",    icon: "💛", prompt: "What warmed your heart today?",    questions: ["1. Name three things you're grateful for right now.", "2. Who brought a smile to your face today?", "3. What small moment felt magical?"] },
  { id: "productivity", label: "Productivity", icon: "⚡", prompt: "How did your garden grow?",          questions: ["1. What was your most meaningful accomplishment?", "2. Which task felt heavy, and how did you carry it?", "3. What seeds will you plant tomorrow?"] },
  { id: "reflection",  label: "Reflection",   icon: "🌙", prompt: "Thoughts under the starlight.",      questions: ["1. How did your mind and body feel throughout the day?", "2. Did you stay true to your flow today?", "3. What is one gentle lesson you are taking with you?"] },
];

function todayStr() { return new Date().toISOString().slice(0, 10); }

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function HandwrittenInput({ question, value, onChange }) {
  return (
    <div className="mb-8">
      <p className="font-heading font-bold text-lg text-[#2F3E46] mb-3 leading-relaxed">{question}</p>
      <div className="relative font-ui text-xl">
        <div className="absolute inset-x-0 bottom-0 top-3 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(168,218,220,0.4) 32px)", backgroundAttachment: "local" }} />
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="..."
            className="w-full bg-transparent border-none text-ghibli-text placeholder-[#A3A8A6] resize-none focus:outline-none focus:ring-0 leading-[32px] overflow-hidden min-h-[96px] relative z-10"
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
        />
      </div>
    </div>
  );
}

export default function Journal() {
  const [currentDate, setCurrentDate] = useState(todayStr());
  const isToday = currentDate === todayStr();

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    if (isToday) return;
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full p-4 md:p-10 animate-[fadeIn_0.5s_ease-out]">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b-2 border-ghibli-border gap-4">
            <div className="flex items-center gap-4">
                <BookOpen className="text-[#D4A373] drop-shadow-sm" size={40} />
                <div>
                    <h2 className="text-4xl font-quote font-black text-[#2F3E46]">The Daily Chronicle</h2>
                    <p className="text-[#A3A8A6] font-ui font-semibold text-sm mt-1 italic">
                        "A journey of a thousand miles begins with a single step."
                    </p>
                </div>
            </div>
            <div className="flex items-center bg-ghibli-card border-2 border-ghibli-border rounded-2xl p-1 shadow-sm">
                <button onClick={handlePrevDay} className="p-2 text-[#7FB77E] hover:bg-ghibli-bg rounded-xl transition">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 px-4 font-heading font-bold text-[#2F3E46]">
                    <CalendarDays size={18} className="text-[#D4A373]" />
                    {isToday ? "Today" : formatDisplayDate(currentDate)}
                </div>
                <button disabled={isToday} onClick={handleNextDay} className={`p-2 rounded-xl transition ${isToday ? 'opacity-30' : 'text-[#7FB77E] hover:bg-ghibli-bg'}`}>
                    <ChevronRight size={20} />
                </button>
            </div>
        </header>

        {isToday
            ? <Writer key={currentDate} />
            : <Reader key={currentDate} date={currentDate} onReturn={() => setCurrentDate(todayStr())} />
        }
    </div>
  );
}

function Writer() {
    const today = todayStr();
    const [activeTab, setActiveTab] = useState("gratitude");
    const [drafts, setDrafts] = useState({ gratitude: ["", "", ""], productivity: ["", "", ""], reflection: ["", "", ""] });
    const [saved, setSaved]   = useState(false);
    const [loading, setLoading] = useState(false);

    // Load existing entry on mount
    const loadExisting = useCallback(async () => {
        try {
            const entry = await api.getByDate(today);
            if (entry) {
                setDrafts({
                    gratitude:    entry.gratitude    || ["", "", ""],
                    productivity: entry.productivity || ["", "", ""],
                    reflection:   entry.reflection   || ["", "", ""],
                });
            }
        } catch (e) {
            // 404 means no entry yet — that's fine
        }
    }, [today]);

    useState(() => { loadExisting(); }, []);

    const tab = TABS.find(t => t.id === activeTab);

    const updateAnswer = (idx, val) => {
        setDrafts(d => ({ ...d, [activeTab]: d[activeTab].map((a, i) => i === idx ? val : a) }));
        setSaved(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.save({
                date:         today,
                gratitude:    drafts.gratitude,
                productivity: drafts.productivity,
                reflection:   drafts.reflection,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-ghibli-card border-2 border-ghibli-border rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] relative">
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-48 h-10 bg-ghibli-card/50 shadow-sm border border-white/60 rotate-[1deg] z-20 backdrop-blur-md" />

            <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-ghibli-border pb-4 sticky top-0 z-10 pt-4 bg-ghibli-card/80 backdrop-blur-md">
                {TABS.map(t => {
                    const active   = activeTab === t.id;
                    const isFilled = drafts[t.id].some(a => a.trim() !== "");
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-heading font-bold text-lg transition-all duration-300 ${
                                active ? 'bg-ghibli-card shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[#2F3E46] scale-105 border border-ghibli-border' : 'text-[#A3A8A6] hover:bg-ghibli-card/50'
                            }`}
                        >
                            <span className="text-xl">{t.icon}</span> {t.label}
                            {isFilled && !active && <Check size={14} className="text-[#7FB77E] ml-1" />}
                        </button>
                    );
                })}
            </div>

            <div className="px-2 md:px-8 py-4 relative">
                <span className="absolute top-0 right-0 text-[150px] opacity-[0.03] select-none pointer-events-none block translate-y-[-20%]">{tab.icon}</span>
                <div className="mb-10 text-center relative z-10">
                    <h3 className="font-quote font-black text-4xl text-[#D4A373] italic">{tab.prompt}</h3>
                </div>
                <div className="space-y-4">
                    {tab.questions.map((q, i) => (
                        <HandwrittenInput key={i} question={q} value={drafts[tab.id][i]} onChange={val => updateAnswer(i, val)} />
                    ))}
                </div>
                <div className="mt-12 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-heading font-bold text-lg shadow-md transition-all hover:-translate-y-1 disabled:opacity-70 ${
                            saved ? 'bg-[#7FB77E] text-white' : 'bg-[#E07A5F] text-white hover:bg-[#D46A4F]'
                        }`}
                    >
                        {loading ? <><Loader size={20} className="animate-spin" /> Saving...</>
                         : saved  ? <><Check size={20} /> Saved to Journal</>
                         :          <><Edit2 size={20} /> Ink Entry</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Reader({ date, onReturn }) {
    const [entry, setEntry] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useState(() => {
        api.getByDate(date)
            .then(data => setEntry(data))
            .catch(() => setNotFound(true));
    }, [date]);

    if (notFound || (entry && !entry.savedAt)) {
        return (
            <div className="mt-20 flex flex-col items-center justify-center p-12 bg-ghibli-bg border-2 border-dashed border-ghibli-border rounded-3xl text-center">
                <Info size={48} className="text-[#D4A373] opacity-40 mb-4" />
                <p className="font-heading font-bold text-2xl text-[#2F3E46]/60 mb-2">Blank Page</p>
                <p className="font-ui text-[#2F3E46]/40 mb-6">No journal entry was written on this day.</p>
                <button onClick={onReturn} className="px-6 py-2 bg-ghibli-card border-2 border-ghibli-border rounded-xl font-heading font-bold text-[#2F3E46] shadow-sm hover:shadow-md transition">
                    Return to Today
                </button>
            </div>
        );
    }

    if (!entry) return (
        <div className="flex items-center justify-center py-20 text-ghibli-primary">
            <Loader size={36} className="animate-spin" />
        </div>
    );

    return (
        <div className="bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-ghibli-card border-2 border-ghibli-border rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] opacity-90 transition-opacity hover:opacity-100">
            <div className="text-center border-b-2 border-dashed border-ghibli-border pb-6 mb-8">
                <span className="inline-block bg-[#FDF3C7] text-[#D4A373] text-sm font-heading tracking-widest uppercase font-black px-4 py-1 rounded-full border border-[#E8D992] mb-4 shadow-sm">
                    {formatDisplayDate(date)}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-12 px-2 md:px-8">
                {TABS.map(tab => {
                    const answers = entry[tab.id] || [];
                    if (!answers.some(a => a && a.trim())) return null;
                    return (
                        <div key={tab.id}>
                            <h4 className="flex items-center gap-3 font-quote font-black text-3xl text-[#2F3E46] mb-6">
                                <span className="text-2xl">{tab.icon}</span> {tab.label}
                            </h4>
                            <div className="space-y-8 pl-10 border-l-[3px] border-[#A8DADC]/40">
                                {tab.questions.map((q, i) => {
                                    if (!answers[i] || !answers[i].trim()) return null;
                                    return (
                                        <div key={i}>
                                            <p className="font-heading font-bold text-sm text-[#A3A8A6] mb-2 uppercase tracking-wide">{q.replace(/^\d+\.\s*/, '')}</p>
                                            <p className="font-ui text-xl text-[#2F3E46] leading-relaxed italic border-b border-ghibli-border pb-4">{answers[i]}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
