import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser } from "../api/api";
import Mascot from "../components/Mascot";
import "./Login.css";

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode based on URL
    const isRegisterMode = location.pathname === "/register";

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
                        navigate("/login");
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
        navigate(isRegisterMode ? "/login" : "/register");
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 font-['Fredericka_the_Great'] bg-white text-black overflow-hidden">

            {/* Full Screen Grid Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Container for the Two Cards */}
            <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-full md:h-[700px]">

                {/* Left Side: Mascot Card */}
                <div className="hidden md:flex flex-col items-center justify-center bg-white h-full relative"
                    style={{
                        border: '3px solid black',
                        borderRadius: '2% 98% 2% 97% / 97% 2% 96% 3%', // Unique sketch shape
                        boxShadow: '12px 12px 0px rgba(0,0,0,0.8)'
                    }}
                >
                    <h2 className="text-4xl font-bold text-center mb-8 font-['Cabin_Sketch'] tracking-wider">
                        {isRegisterMode ? "Join the Crew!" : "Welcome Back!"}
                    </h2>
                    <div className="w-full max-w-xs scale-125">
                        <Mascot isPasswordFocused={isPasswordFocused} />
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="w-full h-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegisterMode ? "register" : "login"}
                            initial={{ opacity: 0, x: isRegisterMode ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isRegisterMode ? -20 : 20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white p-8 md:p-12 h-full flex flex-col justify-center"
                            style={{
                                border: '3px solid black',
                                borderRadius: '97% 3% 98% 2% / 3% 97% 2% 98%', // Matching but distinct sketch shape
                                boxShadow: '12px 12px 0px rgba(0,0,0,0.8)'
                            }}
                        >
                            <div className="flex flex-col items-center mb-6">
                                <h1 className="text-5xl font-bold font-['Cabin_Sketch'] tracking-wider text-center mb-2">
                                    {isRegisterMode ? "Sign Up" : "Log In"}
                                </h1>
                                <p className="text-center text-xl text-gray-700">
                                    {isRegisterMode ? "Create your new identity." : "Enter your secret credentials."}
                                </p>
                            </div>

                            {errorMsg && <p className="text-red-600 text-center mb-4 font-bold border-2 border-red-500 p-2 transform rotate-1">{errorMsg}</p>}
                            {successMsg && <p className="text-green-600 text-center mb-4 font-bold border-2 border-green-500 p-2 transform -rotate-1">{successMsg}</p>}

                            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white border-2 border-black p-4 text-xl outline-none focus:ring-4 focus:ring-black/10 transition-all font-['Fredericka_the_Great'] text-black placeholder:text-gray-500"
                                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                    />
                                </div>

                                {isRegisterMode && (
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white border-2 border-black p-4 text-xl outline-none focus:ring-4 focus:ring-black/10 transition-all font-['Fredericka_the_Great'] text-black placeholder:text-gray-500"
                                            style={{ borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px' }}
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        className="w-full bg-white border-2 border-black p-4 text-xl outline-none focus:ring-4 focus:ring-black/10 transition-all font-['Fredericka_the_Great'] text-black placeholder:text-gray-500"
                                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-xl hover:scale-110 transition-transform text-black">
                                        {showPassword ? (
                                            <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                                        ) : (
                                            <FaEye onClick={() => setShowPassword(!showPassword)} />
                                        )}
                                    </div>
                                </div>

                                {!isRegisterMode && (
                                    <div className="flex justify-between items-center text-sm font-bold px-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 border-2 border-black rounded-sm cursor-pointer accent-black" />
                                            <span className="group-hover:underline">Remember me</span>
                                        </label>
                                        <Link to="#" className="hover:underline">Forgot?</Link>
                                    </div>
                                )}

                                <button type="submit" disabled={isLoading}
                                    className="w-full py-4 bg-black text-white text-2xl font-bold font-['Cabin_Sketch'] tracking-widest hover:bg-gray-800 transition-transform hover:scale-[1.02] active:scale-95 shadow-xl mt-4"
                                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                >
                                    {isLoading
                                        ? (isRegisterMode ? "Scribbling..." : "Checking...")
                                        : (isRegisterMode ? "Sign Up ->" : "Log In ->")
                                    }
                                </button>
                            </form>

                            <div className="mt-8 text-center pt-6">
                                <p className="text-lg">
                                    {isRegisterMode ? "Got an account?" : "Need an account?"}
                                    <a href="#" onClick={toggleMode} className="ml-2 font-bold underline decoration-2 underline-offset-4 hover:text-gray-600">
                                        {isRegisterMode ? "Log In Here" : "Sign Up Here"}
                                    </a>
                                </p>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
