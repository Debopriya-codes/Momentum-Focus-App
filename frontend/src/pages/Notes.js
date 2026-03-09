import { useState, useEffect, useRef } from "react";
import { StickyNote, Plus, Search, Pin, PinOff, Trash2, X, Check, Palette, Edit2 } from "lucide-react";

// The 3 Ghibli sticky note colors requested
const NOTE_COLORS = [
    { label: "Yellow", bg: "bg-[#FDF3C7]", border: "border-[#E8D992]", tape: "bg-yellow-100/60" },
    { label: "Mint",   bg: "bg-[#D6EADF]", border: "border-[#A2C7AD]", tape: "bg-green-100/60" },
    { label: "Peach",  bg: "bg-[#FADCD9]", border: "border-[#E6B3AF]", tape: "bg-red-100/60" },
];

function getNow() {
    return new Date().toISOString();
}

const EMPTY_MODAL = { title: "", body: "", colorIdx: 0 };

export default function Notes() {
    // ── state ──────────────────────────────────────────────────────────────
    const [notes, setNotes] = useState(() => {
        try { return JSON.parse(localStorage.getItem("momentum_notes")) || []; }
        catch { return []; }
    });
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);   // null | "new" | noteId
    const [draft, setDraft] = useState(EMPTY_MODAL);
    const [palette, setPalette] = useState(false);
    const titleRef = useRef(null);

    // ── persist ────────────────────────────────────────────────────────────
    useEffect(() => {
        localStorage.setItem("momentum_notes", JSON.stringify(notes));
    }, [notes]);

    // ── focus title on open ────────────────────────────────────────────────
    useEffect(() => {
        if (modal !== null && titleRef.current) {
            setTimeout(() => titleRef.current?.focus(), 80);
        }
    }, [modal]);

    // ── helpers ────────────────────────────────────────────────────────────
    const openNew = () => {
        setDraft(EMPTY_MODAL);
        setPalette(false);
        setModal("new");
    };

    const openEdit = (note) => {
        setDraft({ title: note.title, body: note.body, colorIdx: note.colorIdx });
        setPalette(false);
        setModal(note.id);
    };

    const closeModal = () => { setModal(null); setPalette(false); };

    const saveNote = () => {
        if (!draft.title.trim() && !draft.body.trim()) { closeModal(); return; }

        if (modal === "new") {
            const newNote = {
                id: Date.now(),
                title: draft.title.trim(),
                body: draft.body.trim(),
                colorIdx: Math.min(draft.colorIdx || 0, NOTE_COLORS.length - 1),
                pinned: false,
                updatedAt: getNow(),
                createdAt: getNow(),
            };
            setNotes(prev => [newNote, ...prev]);
        } else {
            setNotes(prev =>
                prev.map(n =>
                    n.id === modal
                        ? { ...n, title: draft.title.trim(), body: draft.body.trim(), colorIdx: draft.colorIdx, updatedAt: getNow() }
                        : n
                )
            );
        }
        closeModal();
    };

    const deleteNote = (id, e) => {
        e?.stopPropagation();
        setNotes(prev => prev.filter(n => n.id !== id));
        if (modal === id) closeModal();
    };

    const togglePin = (id, e) => {
        e?.stopPropagation();
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    // ── derived ────────────────────────────────────────────────────────────
    const q = search.toLowerCase();
    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
    const pinned = filtered.filter(n => n.pinned);
    const unpinned = filtered.filter(n => !n.pinned);

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto space-y-10 w-full p-4 md:p-10 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pl-4 border-b-2 border-ghibli-border/50 pb-6 gap-6">
                <div>
                    <h2 className="text-5xl font-quote font-black text-ghibli-text flex items-center gap-4 drop-shadow-sm">
                        Sticky Notes <StickyNote className="text-[#F2C94C] translate-y-[-2px] drop-shadow-sm" size={38} />
                    </h2>
                    <p className="text-ghibli-text/60 font-ui font-semibold text-sm mt-3 italic">
                        "Ideas flutter like leaves in the wind."
                    </p>
                </div>
                
                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ghibli-text/40" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find a note..."
                            className="w-full bg-ghibli-card border-2 border-ghibli-border rounded-2xl pl-10 pr-4 py-3 text-sm font-ui font-bold focus:outline-none focus:border-[#F2C94C] shadow-sm transition-colors"
                        />
                    </div>
                    <button
                        onClick={openNew}
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#F2C94C] hover:bg-[#E5B93D] text-[#3E3418] rounded-full shadow-[0_4px_12px_rgba(242,201,76,0.3)] transition-all hover:scale-110 hover:rotate-12"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </header>

            {/* Empty state */}
            {notes.length === 0 && (
                <div className="bg-[#FAF8F1] border-2 border-dashed border-[#D4C3A3] rounded-3xl p-16 text-center shadow-sm relative overflow-hidden max-w-2xl mx-auto mt-12">
                    <div className="absolute top-4 right-8 w-16 h-8 bg-yellow-100/50 rotate-[-5deg] shadow-sm" />
                    <StickyNote size={64} className="text-[#D4C3A3] opacity-40 mx-auto mb-4" />
                    <p className="text-xl font-heading font-bold text-ghibli-text/60 mb-2">The corkboard is empty.</p>
                    <p className="font-ui text-ghibli-text/40">Pin your fleeting thoughts here.</p>
                </div>
            )}

            {/* Pinned section */}
            {pinned.length > 0 && (
                <div className="mb-10">
                    <h3 className="flex items-center gap-2 text-xl font-heading font-bold text-ghibli-primary mb-6 pl-2">
                        <Pin size={20} className="fill-[#7FB77E]" /> Pinned Notes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pinned.map(n => <NoteCard key={n.id} note={n} />)}
                    </div>
                </div>
            )}

            {/* Unpinned section */}
            {unpinned.length > 0 && (
                <div>
                    {pinned.length > 0 && <h3 className="text-xl font-heading font-bold text-ghibli-text/60 mb-6 pl-2">Other Notes</h3>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {unpinned.map(n => <NoteCard key={n.id} note={n} />)}
                    </div>
                </div>
            )}

            {/* ── Modal (Edit/New) ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ghibli-bg/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
                    <div className={`
                        w-full max-w-2xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] 
                        ${NOTE_COLORS[draft.colorIdx]?.bg} border-2 ${NOTE_COLORS[draft.colorIdx]?.border}
                        rounded-br-3xl rounded-tl-xl rounded-tr-sm rounded-bl-sm p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1),_inset_0_-4px_20px_rgba(0,0,0,0.03)]
                        relative transform transition-all animate-[slideUp_0.3s_ease-out]
                    `}>
                        {/* Tape effect on modal */}
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-32 h-8 bg-ghibli-card/40 shadow-sm border border-white/50 rotate-[-1deg]" />

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            {/* Color Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => setPalette(!palette)}
                                    className="p-2 border-2 border-ghibli-border/50 text-ghibli-text/50 bg-ghibli-card/50 rounded-full hover:bg-ghibli-card hover:text-ghibli-text transition shadow-sm"
                                    title="Change note color"
                                >
                                    <Palette size={18} />
                                </button>
                                {palette && (
                                    <div className="absolute top-12 left-0 flex gap-2 bg-ghibli-card p-3 rounded-2xl shadow-xl border border-ghibli-border z-20">
                                        {NOTE_COLORS.map((c, i) => (
                                            <div
                                                key={c.label}
                                                onClick={() => { setDraft({ ...draft, colorIdx: i }); setPalette(false); }}
                                                className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${c.bg} ${c.border} ${draft.colorIdx === i ? 'ring-2 ring-ghibli-text ring-offset-2' : ''}`}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {modal !== "new" && (
                                    <button
                                        onClick={(e) => deleteNote(modal, e)}
                                        className="p-2 text-[#E07A5F] bg-ghibli-card/50 hover:bg-ghibli-card rounded-full transition shadow-sm border border-ghibli-border/50"
                                        title="Delete note"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-ghibli-text/50 bg-ghibli-card/50 hover:bg-ghibli-card rounded-full transition shadow-sm border border-ghibli-border/50"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <input
                            ref={titleRef}
                            value={draft.title}
                            onChange={e => setDraft({ ...draft, title: e.target.value })}
                            placeholder="Note Title..."
                            className="w-full bg-transparent text-3xl font-heading font-bold text-ghibli-text placeholder-ghibli-text/30 border-none focus:outline-none focus:ring-0 mb-4 px-2"
                        />

                         <div className="relative font-ui text-lg border-t border-ghibli-border/30 pt-4 px-2">
                            {/* Paper lines background */}
                            <div className="absolute inset-x-0 bottom-0 top-6 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(47,62,70,0.1) 28px)", backgroundAttachment: "local" }} />
                            
                            <textarea
                                value={draft.body}
                                onChange={e => setDraft({ ...draft, body: e.target.value })}
                                placeholder="Start writing your thoughts here..."
                                className="w-full bg-transparent text-ghibli-text placeholder-ghibli-text/30 border-none focus:outline-none focus:ring-0 min-h-[50vh] resize-none relative z-10 leading-[28px]"
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={saveNote}
                                className="flex items-center gap-2 bg-[#2F3E46] hover:bg-[#1E2B22] text-white px-6 py-3 rounded-xl transition font-heading font-bold shadow-md hover:-translate-y-0.5"
                            >
                                <Check size={18} /> Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function NoteCard({ note }) {
        const c = NOTE_COLORS[note.colorIdx] || NOTE_COLORS[0];
        // Pseudo-random tilt based on ID
        const tilt = note.id % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[1deg]';
        const tapePos = note.id % 3 === 0 ? 'left-[10%]' : note.id % 3 === 1 ? 'left-1/2 -translate-x-1/2' : 'right-[10%]';

        return (
            <div
                onClick={() => openEdit(note)}
                className={`
                    relative group cursor-pointer 
                    bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] 
                    ${c.bg} border border-[#0000000a] shadow-[1px_3px_10px_rgba(0,0,0,0.06)]
                    rounded-br-[2rem] rounded-tl-sm rounded-tr-sm rounded-bl-sm
                    hover:shadow-[4px_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 transform ${tilt} hover:rotate-0 hover:-translate-y-1
                    flex flex-col min-h-[220px] p-6
                `}
            >
                {/* Wobbly Top Edge (Torn paper effect illusion via inner shadow) */}
                <div className="absolute inset-0 shadow-[inset_0_4px_4px_rgba(255,255,255,0.4)] rounded-[inherit] pointer-events-none" />

                {/* Semi-transparent tape */}
                <div className={`absolute top-[-10px] ${tapePos} w-16 h-6 border bg-ghibli-card/40 border-white/60 shadow-sm backdrop-blur-sm z-10 ${note.id % 2 === 0 ? 'rotate-[3deg]' : 'rotate-[-2deg]'}`} />

                <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                    <h3 className="font-heading font-bold text-xl text-[#2F3E46] line-clamp-2 leading-tight">
                        {note.title || (note.body ? note.body.split('\n')[0] : "Untitled")}
                    </h3>

                    {/* Action buttons (Pin / Delete) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 bg-ghibli-card/50 backdrop-blur-md rounded-lg p-1 border border-ghibli-border/50">
                        <button
                            onClick={(e) => togglePin(note.id, e)}
                            className="p-1 hover:bg-ghibli-card text-[#2F3E46]/60 hover:text-[#2F3E46] transition rounded"
                            title={note.pinned ? "Unpin" : "Pin"}
                        >
                            {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                        <button
                            onClick={(e) => deleteNote(note.id, e)}
                            className="p-1 hover:bg-ghibli-card text-[#E07A5F]/80 hover:text-[#E07A5F] transition rounded"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative z-10 mb-4 h-full overflow-hidden">
                    <p className="text-[#2F3E46]/80 text-[15px] font-ui leading-relaxed whitespace-pre-wrap line-clamp-6">
                        {note.body || <span className="italic opacity-50">Empty note</span>}
                    </p>
                    {/* Fade out bottom of text */}
                    <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[${c.bg.replace('bg-[', '').replace(']', '')}] to-transparent pointer-events-none`} />
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#0000000f] relative z-10">
                    <span className="text-xs font-ui font-semibold text-[#2F3E46]/40 uppercase tracking-wider">
                        {new Date(note.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-xs font-ui font-bold text-[#2F3E46]/30">Edit <Edit2 size={10} className="inline ml-1" /></span>
                </div>
            </div>
        );
    }
}
