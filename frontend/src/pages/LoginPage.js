import { useState } from "react";
import { ArrowRight, Leaf, AlertCircle, Loader } from "lucide-react";
import { auth, setToken } from "../api";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage({ onLogin }) {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLogin, setIsLogin]   = useState(true);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    // ── Email / Password submit ───────────────────────────────────────
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

    // ── Google Sign-In success ────────────────────────────────────────
    const handleGoogleSuccess = async (credentialResponse) => {
        setError("");
        setLoading(true);
        try {
            const data = await auth.googleLogin(credentialResponse.credential);
            setToken(data.token);
            if (onLogin) onLogin(data);
        } catch (err) {
            setError(err.message || "Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google sign-in was cancelled or failed. Please try again.");
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-ui">
            {/* Left panel – image */}
            <div
                className="w-full md:w-1/3 h-64 md:h-screen bg-cover bg-center animate-pop"
                style={{ backgroundImage: "url('/totoro-rain.jpg')" }}
            />

            {/* Right panel – form */}
            <div
                className="w-full md:w-2/3 min-h-screen flex items-center justify-center p-8 transition-colors duration-500"
                style={{ backgroundColor: "#D0F0C0" }}
            >
                <div className="w-full max-w-sm flex flex-col items-center animate-fade-in-up">

                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-10 justify-center drop-shadow-sm hover:animate-wiggle cursor-default">
                        <div className="bg-white/80 p-3 rounded-2xl shadow-sm rotate-[-3deg] hover:rotate-[3deg] transition-all duration-300">
                            <Leaf className="text-[#8D6E63] animate-pulse-glow" size={40} />
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-quote font-black tracking-tight text-[#1F2937]">
                            Momentum
                        </h1>
                    </div>

                    {/* Tab switcher */}
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

                    {/* Error banner */}
                    {error && (
                        <div className="w-full mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl px-4 py-3 animate-pop">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Email / password form */}
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
                        <div className="flex-1 h-px bg-[#1F2937]" />
                        <span className="text-[#1F2937] text-sm font-bold uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[#1F2937]" />
                    </div>

                    {/* Google Sign-In – official button from @react-oauth/google */}
                    <div className="w-full flex justify-center">
                        {loading ? (
                            <div className="flex items-center gap-2 text-[#1F2937]/60 text-sm font-bold">
                                <Loader size={18} className="animate-spin" /> Signing in with Google…
                            </div>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                                auto_select={false}
                                shape="rectangular"
                                size="large"
                                width="360"
                                text={isLogin ? "signin_with" : "signup_with"}
                                logo_alignment="left"
                                theme="outline"
                            />
                        )}
                    </div>

                    <p className="mt-6 text-xs text-[#1F2937]/50 text-center leading-relaxed">
                        By signing in you agree to our Terms of Service.<br />
                        Your data is synced across all your devices.
                    </p>

                </div>
            </div>
        </div>
    );
}
