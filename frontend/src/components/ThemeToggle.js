import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => localStorage.getItem("momentum_theme") || "dark");

    useEffect(() => {
        if (theme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
        localStorage.setItem("momentum_theme", theme);
    }, [theme]);

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="fixed top-8 right-8 z-[999] p-3 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110"
            style={{
                background: theme === "light" ? "linear-gradient(135deg, #ffffff, #f1f5f9)" : "linear-gradient(135deg, #1e293b, #0f172a)",
                border: "1px solid " + (theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"),
            }}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
            <div className="relative w-6 h-6 flex items-center justify-center">
                <Sun 
                    size={22} 
                    strokeWidth={2.5}
                    className={`absolute text-amber-500 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`} 
                />
                <Moon 
                    size={22} 
                    strokeWidth={2.5}
                    className={`absolute text-indigo-300 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
                    }`} 
                />
            </div>
            
            {/* Subtle glow effect behind icon */}
            <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
                theme === "light" ? "bg-amber-400/20" : "bg-indigo-500/20"
            } opacity-0 group-hover:opacity-100`}></div>
        </button>
    );
}
