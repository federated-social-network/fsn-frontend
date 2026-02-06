import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser } from "../api/api";
import { getInstanceName } from "../config/instances";
import SketchCard from "../components/SketchCard";
import Mascot from "../components/Mascot";


const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode based on URL
    const isRegisterMode = location.pathname === "/auth/register";

    // State
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Reset state on mode change
    useEffect(() => {
        setErrorMsg("");
        setSuccessMsg("");
    }, [isRegisterMode]);

    // Validation Helpers
    const validateUsername = (u: string) => (!u || !u.trim() ? "Username is required" : null);
    const validateEmail = (e: string) => {
        if (!e || !e.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Invalid email address";
        return null;
    };
    const validatePassword = (p: string) => {
        if (!p || p.length < 8) return "Password must be at least 8 characters";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const uErr = validateUsername(username);
        const pErr = validatePassword(password);
        const eErr = isRegisterMode ? validateEmail(email) : null;

        if (uErr || pErr || eErr) {
            setErrorMsg(uErr || eErr || pErr || "Invalid input");
            return;
        }

        setIsLoading(true);
        try {
            if (isRegisterMode) {
                // Register Flow
                const res = await registerUser(username, password, email);
                if (res.data?.message || res.status === 200) {
                    setSuccessMsg("Registration successful! Logging in...");
                    setTimeout(() => {
                        navigate("/auth/login");
                    }, 1500);
                } else {
                    setErrorMsg("Registration failed");
                }
            } else {
                // Login Flow
                const res = await loginUser(username, password);
                if (res?.status === 200) {
                    const data = res.data || res;
                    localStorage.setItem("username", username);
                    if (data?.access_token) {
                        localStorage.setItem("access_token", data.access_token);
                        localStorage.setItem("AUTH_TOKEN", data.access_token);
                    }
                    navigate("/dashboard");
                } else {
                    setErrorMsg("Invalid login response");
                }
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "An error occurred";
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(isRegisterMode ? "/auth/login" : "/auth/register");
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">

            {/* Container for the Two Cards */}
            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-stretch h-full">

                {/* Left Side: Mascot Card - Hidden on mobile */}
                <div className="hidden md:block h-full">
                    <SketchCard variant="paper" className="h-full flex flex-col items-center justify-center p-8 bg-sky-50 transform -rotate-1">
                        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8 font-sketch tracking-wider">
                            {isRegisterMode ? "Join the Crew!" : "Welcome Back!"}
                        </h2>
                        <div className="w-full max-w-xs scale-110">
                            <Mascot isPasswordFocused={isPasswordFocused} showPassword={showPassword} />
                        </div>
                    </SketchCard>
                </div>

                {/* Right Side: Form Card */}
                <div className="w-full h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegisterMode ? "register" : "login"}
                            initial={{ opacity: 0, x: isRegisterMode ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isRegisterMode ? -20 : 20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <SketchCard variant="paper" className="h-full p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white transform md:rotate-1">
                                <div className="flex flex-col items-center mb-6 sm:mb-8">
                                    {/* Mobile Welcome Message */}
                                    <div className="md:hidden text-center mb-4">
                                        <span className="text-4xl">{isRegisterMode ? "✨" : "👋"}</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sketch tracking-wider text-center mb-2">
                                        {isRegisterMode ? "Sign Up" : "Log In"}
                                    </h1>
                                    <p className="text-center text-base sm:text-lg md:text-xl font-hand text-[var(--ink-secondary)]">
                                        {isRegisterMode ? "Start your sketched journey." : "Enter your secret credentials."}
                                    </p>
                                </div>

                                {errorMsg && (
                                    <div className="mb-4 sm:mb-6 font-hand text-red-600 text-center border-2 border-dashed border-red-400 p-3 bg-red-50 rounded text-sm sm:text-base">
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Instance Badge */}
                                <div className="mb-4 sm:mb-6 flex justify-center">
                                    <div className={`px-3 sm:px-4 py-1.5 rounded-full border-2 border-black font-hand font-bold text-xs sm:text-sm flex items-center gap-2 bg-gradient-to-r from-pink-100 via-yellow-100 to-cyan-100 shadow-sm animate-pulse`}>

                                        <span>Joining <span className="font-sketch text-base sm:text-lg text-[var(--ink-blue)]">{getInstanceName(localStorage.getItem("INSTANCE_BASE_URL")) || "Instance A"}</span></span>

                                    </div>
                                </div>

                                {successMsg && (
                                    <div className="mb-4 sm:mb-6 font-hand text-green-600 text-center border-2 border-dashed border-green-400 p-3 bg-green-50 rounded text-sm sm:text-base">
                                        {successMsg}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full max-w-sm mx-auto">
                                    <div className="group">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-white border-2 border-black/80 p-3 sm:p-3.5 text-lg sm:text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md"
                                        />
                                    </div>

                                    {isRegisterMode && (
                                        <div className="group">
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white border-2 border-black/80 p-3 sm:p-3.5 text-lg sm:text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md"
                                            />
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setIsPasswordFocused(true)}
                                            onBlur={() => setIsPasswordFocused(false)}
                                            className="w-full bg-white border-2 border-black/80 p-3 sm:p-3.5 text-lg sm:text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md pr-12"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-xl hover:scale-110 transition-transform text-black/60 hover:text-black p-1">
                                            {showPassword ? (
                                                <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                                            ) : (
                                                <FaEye onClick={() => setShowPassword(!showPassword)} />
                                            )}
                                        </div>
                                    </div>

                                    {!isRegisterMode && (
                                        <div className="flex justify-between items-center text-sm font-hand font-bold px-1">
                                            <Link to="/forgot-password" className="text-[var(--ink-secondary)] hover:underline hover:text-black">Password ghosted you?</Link>
                                        </div>
                                    )}

                                    <button type="submit" disabled={isLoading}
                                        className="w-full py-3 sm:py-3.5 bg-[var(--primary)] text-white text-xl sm:text-2xl font-bold font-sketch tracking-widest hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg border-2 border-transparent hover:border-black/20 rounded-lg mt-2 relative overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {isLoading
                                                ? (isRegisterMode ? "Scribbling..." : "Checking...")
                                                : (
                                                    <>
                                                        <span>{isRegisterMode ? "Sign Up" : "Log In"}</span>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current stroke-[3]">
                                                            <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0" transform="translate(2 2)" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }} />
                                                            {/* Custom C-shape and Arrow */}
                                                            <path d="M 9 20 A 9 9 0 1 0 9 4" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M 2 12 L 14 12 M 10 8 L 14 12 L 10 16" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </>
                                                )
                                            }
                                        </span>
                                    </button>
                                </form>

                                <div className="mt-6 sm:mt-8 text-center pt-4 sm:pt-6 border-t-2 border-dashed border-gray-200">
                                    <p className="text-base sm:text-lg font-hand text-[var(--ink-secondary)]">
                                        {isRegisterMode ? "Got an account?" : "Need an account?"}
                                        <a href="#" onClick={toggleMode} className="ml-2 font-bold underline decoration-2 underline-offset-4 hover:text-black text-black">
                                            {isRegisterMode ? "Log In Here" : "Sign Up Here"}
                                        </a>
                                    </p>
                                </div>

                            </SketchCard>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
};

export default AuthPage;

