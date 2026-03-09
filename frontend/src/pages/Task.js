import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, ChevronDown, Loader } from "lucide-react";
import { tasks as api } from "../api";

export default function Task() {
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [formVisible, setFormVisible] = useState(false);

    const todayStr = new Date().toISOString().slice(0, 10);
    const [taskName, setTaskName]         = useState("");
    const [taskDate, setTaskDate]         = useState(todayStr);
    const [taskPriority, setTaskPriority] = useState("LOW");

    const [editingId, setEditingId]       = useState(null);
    const [editName, setEditName]         = useState("");
    const [editDate, setEditDate]         = useState("");
    const [editPriority, setEditPriority] = useState("LOW");

    const load = useCallback(async () => {
        try {
            const data = await api.getAll();
            setTaskList(data);
        } catch (e) {
            console.error("Failed to load tasks", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const addTask = async () => {
        if (!taskName.trim()) return;
        try {
            const created = await api.create({ title: taskName.trim(), priority: taskPriority, date: taskDate });
            setTaskList(prev => [created, ...prev]);
            setTaskName("");
            setFormVisible(false);
        } catch (e) { console.error(e); }
    };

    const toggleComplete = async (t) => {
        try {
            const updated = await api.update(t.id, { completed: !t.completed });
            setTaskList(prev => prev.map(x => x.id === t.id ? updated : x));
        } catch (e) { console.error(e); }
    };

    const deleteTask = async (id) => {
        try {
            await api.remove(id);
            setTaskList(prev => prev.filter(t => t.id !== id));
        } catch (e) { console.error(e); }
    };

    const startEditing = (t) => {
        setEditingId(t.id);
        setEditName(t.title);
        setEditDate(t.date || "");
        setEditPriority(t.priority || "LOW");
    };

    const saveEdit = async (id) => {
        try {
            const updated = await api.update(id, { title: editName, date: editDate || null, priority: editPriority });
            setTaskList(prev => prev.map(t => t.id === id ? updated : t));
            setEditingId(null);
        } catch (e) { console.error(e); }
    };

    const dailyTasks    = taskList.filter(t => t.date === todayStr);
    const upcomingTasks = taskList.filter(t => t.date > todayStr).sort((a, b) => a.date.localeCompare(b.date));
    const backlogTasks  = taskList.filter(t => t.date < todayStr && !t.completed);

    const PriorityColor = {
        HIGH:   "bg-[#E07A5F]/20 text-[#E07A5F]",
        MEDIUM: "bg-[#F2C94C]/30 text-[#D4A373]",
        LOW:    "bg-ghibli-primary/20 text-ghibli-primary",
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 w-full p-4 md:p-10 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Header */}
            <header className="flex items-center justify-between mb-8 pl-4 border-b-2 border-ghibli-border/50 pb-6">
                <div>
                    <h2 className="text-4xl font-quote font-black text-ghibli-text flex items-center gap-3 drop-shadow-sm">
                        Quests <span className="text-3xl text-ghibli-primary">🗺️</span>
                    </h2>
                    <p className="text-ghibli-text/60 font-ui font-semibold text-sm mt-2">
                        "It is not the arriving, but the journey."
                    </p>
                </div>
                <button
                    onClick={() => setFormVisible(!formVisible)}
                    className="flex items-center gap-2 bg-[#7FB77E] hover:bg-[#6CA36B] text-white px-6 py-2.5 rounded-full font-heading font-bold shadow-[0_4px_12px_rgba(127,183,126,0.3)] transition-all hover:-translate-y-1"
                >
                    <Plus size={18} /> Add Quest
                </button>
            </header>

            {/* Form */}
            {formVisible && (
                <div className="bg-ghibli-surface border-2 border-ghibli-border rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 transform transition-all animate-fade-in-up">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-heading font-bold text-ghibli-primary uppercase tracking-widest mb-1">Quest Name</label>
                            <input
                                autoFocus
                                value={taskName}
                                onChange={e => setTaskName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTask()}
                                placeholder="Gather herbs in the forest..."
                                className="w-full bg-ghibli-bg border-2 border-ghibli-border rounded-xl px-4 py-3 text-ghibli-text font-ui font-bold focus:outline-none focus:border-ghibli-accent transition-colors"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-heading font-bold text-ghibli-primary uppercase tracking-widest mb-1">Date</label>
                            <input
                                type="date"
                                value={taskDate}
                                onChange={e => setTaskDate(e.target.value)}
                                className="w-full bg-ghibli-bg border-2 border-ghibli-border rounded-xl px-4 py-3 text-ghibli-text font-ui font-bold focus:outline-none focus:border-ghibli-accent transition-colors cursor-pointer"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-heading font-bold text-ghibli-primary uppercase tracking-widest mb-1">Priority</label>
                            <div className="relative">
                                <select
                                    value={taskPriority}
                                    onChange={e => setTaskPriority(e.target.value)}
                                    className="w-full appearance-none bg-ghibli-bg border-2 border-ghibli-border rounded-xl pl-4 pr-10 py-3 text-ghibli-text font-ui font-bold focus:outline-none focus:border-ghibli-accent transition-colors cursor-pointer"
                                >
                                    <option value="LOW">Low Priority</option>
                                    <option value="MEDIUM">Medium Priority</option>
                                    <option value="HIGH">High Priority</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-ghibli-text/50 pointer-events-none" />
                            </div>
                        </div>
                        <button onClick={addTask} className="bg-[#7FB77E] hover:bg-[#6CA36B] text-white font-bold font-heading px-6 py-3 rounded-xl shadow-md transition-colors hover:-translate-y-0.5 w-full md:w-auto">
                            Add
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20 text-ghibli-primary">
                    <Loader size={36} className="animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <QuestColumn title="Today's Quests"  tasks={dailyTasks} />
                    <QuestColumn title="Upcoming"        tasks={upcomingTasks} />
                    <QuestColumn title="Uncharted"       tasks={backlogTasks} isBacklog={true} />
                </div>
            )}
        </div>
    );

    function QuestColumn({ title, tasks: colTasks, isBacklog }) {
        return (
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-heading font-bold text-ghibli-text border-b-2 border-ghibli-border/60 pb-2 flex items-center justify-between">
                    {title}
                    <span className="bg-ghibli-surface text-ghibli-primary text-xs px-2 py-1 rounded-lg border border-ghibli-border font-ui">
                        {colTasks.length}
                    </span>
                </h3>
                {colTasks.length === 0 ? (
                    <div className="bg-ghibli-surface/50 border-2 border-dashed border-ghibli-border rounded-2xl p-6 text-center text-ghibli-text/40 font-ui italic">
                        No quests mapped.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {colTasks.map((t, idx) => (
                            <div
                                key={t.id}
                                className={`
                                    bg-ghibli-card p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-ghibli-border transition-all duration-300 relative group
                                    hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-ghibli-accent/40 animate-pop
                                    ${t.completed ? 'opacity-50 grayscale' : ''}
                                    ${isBacklog ? 'bg-[#FAF8F1]' : ''}
                                `}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                {/* Tape */}
                                <div className={`absolute top-[-8px] left-1/2 -translate-x-1/2 w-12 h-4 bg-ghibli-card/60 backdrop-blur-md shadow-sm opacity-80 z-10 ${idx % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[2deg]'}`} />

                                {editingId === t.id ? (
                                    <div className="space-y-3 mt-2">
                                        <input
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full bg-ghibli-bg border border-ghibli-border rounded-lg px-3 py-2 text-sm font-ui focus:outline-none"
                                        />
                                        <div className="flex gap-2 text-xs">
                                            <input
                                                type="date"
                                                value={editDate}
                                                onChange={e => setEditDate(e.target.value)}
                                                className="bg-ghibli-bg border border-ghibli-border rounded-lg px-2 py-1 flex-1 font-ui focus:outline-none"
                                            />
                                            <select
                                                value={editPriority}
                                                onChange={e => setEditPriority(e.target.value)}
                                                className="bg-ghibli-bg border border-ghibli-border rounded-lg px-2 py-1 font-ui focus:outline-none"
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Med</option>
                                                <option value="HIGH">High</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => saveEdit(t.id)} className="flex-1 bg-ghibli-primary text-white py-1.5 rounded-lg text-xs font-bold hover:opacity-90">Save</button>
                                            <button onClick={() => setEditingId(null)} className="flex-1 bg-ghibli-border text-ghibli-text py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-300">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3 mt-1">
                                            <button
                                                onClick={() => toggleComplete(t)}
                                                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors border-2 ${t.completed ? 'bg-[#7FB77E] border-[#7FB77E] text-white' : 'border-ghibli-border hover:border-[#7FB77E]'}`}
                                            >
                                                {t.completed && <Check size={12} strokeWidth={3} />}
                                            </button>
                                            <div className="flex-1">
                                                <p className={`font-ui font-black text-[15px] leading-tight break-all ${t.completed ? 'line-through text-ghibli-text/60' : 'text-[#2F3E46]'}`}>
                                                    {t.title}
                                                </p>
                                                {!t.completed && (
                                                    <div className="flex gap-2 items-center mt-3">
                                                        <span className={`text-[10px] uppercase font-heading font-black tracking-widest px-2 py-0.5 rounded-md ${PriorityColor[t.priority] || PriorityColor.LOW}`}>
                                                            {t.priority}
                                                        </span>
                                                        {t.date && (
                                                            <span className="text-xs font-ui font-semibold text-ghibli-text/40">
                                                                {new Date(t.date + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button onClick={() => startEditing(t)} className="p-1.5 bg-ghibli-card rounded-lg shadow-sm border border-ghibli-border text-ghibli-primary hover:bg-ghibli-primary hover:text-white transition">
                                                <Pencil size={12} />
                                            </button>
                                            <button onClick={() => deleteTask(t.id)} className="p-1.5 bg-ghibli-card rounded-lg shadow-sm border border-ghibli-border text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}
