import { useState } from "react";
import { ArrowRight, Leaf, AlertCircle, Loader } from "lucide-react";
import { auth, setToken } from "../api";

export default function LoginPage({ onLogin }) {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLogin, setIsLogin]   = useState(true);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            let data;
            if (isLogin) {
                data = await auth.login(email, password);
            } else {
                data = await auth.register(username, email, password);
            }
            setToken(data.token);
            if (onLogin) onLogin(data);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-ui">
            {/* 1 Part - Image (1/3 width) */}
            <div
                className="w-full md:w-1/3 h-64 md:h-screen bg-cover bg-center animate-pop"
                style={{ backgroundImage: "url('/totoro-rain.jpg')" }}
            >
            </div>

            {/* 2 Part - Light Green Background (2/3 width) */}
            <div
                className="w-full md:w-2/3 min-h-screen flex items-center justify-center p-8 transition-colors duration-500"
                style={{ backgroundColor: "#D0F0C0" }}
            >
                <div className="w-full max-w-sm flex flex-col items-center animate-fade-in-up">

                    {/* Title */}
                    <div className="flex items-center gap-4 mb-10 justify-center drop-shadow-sm hover:animate-wiggle cursor-default">
                        <div className="bg-white/80 p-3 rounded-2xl shadow-sm rotate-[-3deg] hover:rotate-[3deg] transition-all duration-300">
                            <Leaf className="text-[#8D6E63] animate-pulse-glow" size={40} />
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-quote font-black tracking-tight text-[#1F2937]">
                            Momentum
                        </h1>
                    </div>

                    {/* Options: Create an account & Sign in */}
                    <div className="w-full flex justify-center gap-8 mb-8 text-lg font-bold text-[#1F2937]">
                        <button
                            className={`pb-1 border-b-2 transition-all duration-300 ${!isLogin ? 'border-[#1F2937] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                            onClick={() => { setIsLogin(false); setError(""); }}
                        >
                            Create an account
                        </button>
                        <button
                            className={`pb-1 border-b-2 transition-all duration-300 ${isLogin ? 'border-[#1F2937] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                            onClick={() => { setIsLogin(true); setError(""); }}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="w-full mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl px-4 py-3 animate-pop">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        {!isLogin && (
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white border-[1px] border-[#FDE047] rounded-xl px-4 py-2.5 text-[#1F2937] placeholder:text-[#1F2937]/40 focus:outline-none focus:ring-2 focus:ring-[#FDE047] shadow-sm transition-all focus:-translate-y-1 hover:shadow-md animate-fade-in-up"
                                placeholder="Username"
                            />
                        )}
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border-[1px] border-[#FDE047] rounded-xl px-4 py-2.5 text-[#1F2937] placeholder:text-[#1F2937]/40 focus:outline-none focus:ring-2 focus:ring-[#FDE047] shadow-sm transition-all focus:-translate-y-1 hover:shadow-md"
                            placeholder="Email Address"
                        />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border-[1px] border-[#FDE047] rounded-xl px-4 py-2.5 text-[#1F2937] placeholder:text-[#1F2937]/40 focus:outline-none focus:ring-2 focus:ring-[#FDE047] shadow-sm transition-all focus:-translate-y-1 hover:shadow-md"
                            placeholder="Password"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-[#1F2937] hover:bg-[#374151] text-white rounded-xl px-6 py-2.5 font-bold text-lg shadow-md hover:shadow-[0_8px_20px_rgba(31,41,55,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <><Loader size={20} className="animate-spin" /> Please wait...</>
                                : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></>
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-4 my-8 opacity-60">
                        <div className="flex-1 h-px bg-[#1F2937]"></div>
                        <span className="text-[#1F2937] text-sm font-bold uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[#1F2937]"></div>
                    </div>

                    {/* Login with Google (placeholder) */}
                    <button
                        type="button"
                        className="w-full bg-white border border-gray-200 hover:border-[#1F2937] hover:bg-gray-50 text-[#1F2937] rounded-xl px-6 py-2.5 font-bold text-base shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group opacity-60 cursor-not-allowed"
                        title="Google login not yet configured"
                    >
                        <div>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        Login with Google
                    </button>

                </div>
            </div>
        </div>
    );
}
