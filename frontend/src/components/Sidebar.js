import { LayoutDashboard, CheckSquare, Clock, Target, Zap, BookOpen, Leaf } from "lucide-react";

export const NAV_ITEMS = [
    { label: "Dashboard", page: "dashboard", Icon: LayoutDashboard },
    { label: "Quests",    page: "tasks",     Icon: CheckSquare     },
    { label: "Focus",     page: "focus",     Icon: Clock           },
    { label: "Garden",    page: "habits",    Icon: Target          },
    { label: "Notes",     page: "notes",     Icon: Zap             },
    { label: "Journal",   page: "journal",   Icon: BookOpen        },
];

export default function Sidebar({ currentPage, navigate }) {
    return (
        <aside 
           className="w-64 p-8 relative z-10 flex-shrink-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.04)] border-r-2 border-[#4CAF50]"
           style={{ backgroundColor: '#4CAF50' }}
        >
            {/* Wood texture overlay effect on the sidebar */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.03] mix-blend-multiply pointer-events-none" />

            <div className="flex items-center gap-3 mb-12 drop-shadow-md relative z-10 animate-slide-in-right">
                <div className="bg-ghibli-card p-2 rounded-2xl shadow-sm rotate-[-3deg] hover:rotate-[3deg] transition-transform duration-300">
                    <Leaf className="text-[#8D6E63] animate-pulse-glow" size={28} />
                </div>
                <div className="flex flex-col group cursor-default">
                    <h1 className="text-2xl font-quote font-black tracking-tight text-[#2F3A3A] group-hover:text-ghibli-primary transition-colors">Momentum</h1>
                    <span className="text-[10px] font-heading font-bold text-[#2F3A3A]/70 uppercase tracking-widest mt-[-2px] group-hover:tracking-[0.2em] transition-all">Focus Garden</span>
                </div>
            </div>
            
            <nav className="space-y-3 flex-1 relative z-10">
                {NAV_ITEMS.map(({ label, page, Icon }) => {
                    const active = page === currentPage;
                    return (
                        <div
                            key={page}
                            onClick={() => navigate && navigate(page)}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 font-bold font-heading shadow-sm group cursor-pointer animate-fade-in-up ${
                                active
                                    ? "bg-ghibli-card text-[#7FA37C] shadow-[0_4px_12px_rgba(233,196,106,0.3)] scale-[1.03]"
                                    : "bg-transparent text-[#2F3A3A] hover:bg-white/40 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(233,196,106,0.2)] active:scale-95"
                            }`}
                            style={{ animationDelay: `${(NAV_ITEMS.findIndex(i => i.page === page)) * 100}ms` }}
                        >
                            <Icon size={20} className={active ? "text-ghibli-accent drop-shadow-sm animate-bounce-soft" : "opacity-80 group-hover:scale-110 group-hover:-rotate-3 transition-transform"} />
                            <span className="text-md tracking-wide group-hover:text-[#52796F] transition-colors">{label}</span>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
