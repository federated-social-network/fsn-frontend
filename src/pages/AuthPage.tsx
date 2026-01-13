import { useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine initial view based on URL path
    const initialIsLogin = location.pathname === "/login" || location.pathname === "/";
    const [isLogin, setIsLogin] = useState(initialIsLogin);

    // Update state if URL changes (e.g. back button)
    useEffect(() => {
        if (location.pathname === "/login") setIsLogin(true);
        else if (location.pathname === "/register") setIsLogin(false);
    }, [location.pathname]);

    // Update URL when toggling state, but use replace to avoid history stack buildup if just toggling
    const toggleAuthMode = () => {
        const newMode = !isLogin;
        setIsLogin(newMode);
        navigate(newMode ? "/login" : "/register", { replace: true });
    };

    // --- Login State ---
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginErrorMsg, setLoginErrorMsg] = useState("");
    const [loginUserError, setLoginUserError] = useState<string | null>(null);
    const [loginPassError, setLoginPassError] = useState<string | null>(null);

    // --- Register State ---
    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regSuccessMsg, setRegSuccessMsg] = useState("");
    const [regErrorMsg, setRegErrorMsg] = useState("");
    const [regUserError, setRegUserError] = useState<string | null>(null);
    const [regEmailError, setRegEmailError] = useState<string | null>(null);
    const [regPassError, setRegPassError] = useState<string | null>(null);

    const instance = localStorage.getItem("INSTANCE_BASE_URL") || null;

    // --- Validation Helpers ---
    const validateUsername = (u: string) => (!u || !u.trim() ? "Username is required" : null);
    const validateEmail = (e: string) => {
        if (!e || !e.trim()) return "Email is required";
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !re.test(e) ? "Enter a valid email address" : null;
    };
    const validatePassword = (p: string) => {
        if (!p || p.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Password must include letters and numbers";
        return null;
    };

    // --- Login Handlers ---
    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoginErrorMsg("");

        const pwdErr = validatePassword(loginPassword);
        const uErr = validateUsername(loginUsername);

        if (uErr || pwdErr) {
            setLoginUserError(uErr);
            setLoginPassError(pwdErr);
            return;
        }

        try {
            const res = await loginUser(loginUsername, loginPassword);
            if (res?.status === 200) {
                localStorage.setItem("username", loginUsername);
                localStorage.setItem("password", loginPassword);
                if (res.data?.access_token) {
                    localStorage.setItem("access_token", res.data.access_token);
                    localStorage.setItem("AUTH_TOKEN", res.data.access_token);
                }
                navigate("/dashboard");
            } else {
                setLoginErrorMsg("Invalid login response");
            }
        } catch (err: any) {
            setLoginErrorMsg(err?.response?.data?.detail || "Invalid username or password");
        }
    };

    // --- Register Handlers ---
    const handleRegister = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setRegSuccessMsg("");
        setRegErrorMsg("");

        const uErr = validateUsername(regUsername);
        const emErr = validateEmail(regEmail);
        const pErr = validatePassword(regPassword);

        setRegUserError(uErr);
        setRegEmailError(emErr);
        setRegPassError(pErr);

        if (uErr || emErr || pErr) {
            setRegErrorMsg("Please fix the errors above");
            return;
        }

        try {
            const res = await registerUser(regUsername, regPassword, regEmail);
            if (res.data?.message) {
                setRegSuccessMsg(res.data.message);
                setTimeout(() => {
                    // Switch to login view automatically
                    setIsLogin(true);
                    navigate("/login", { replace: true });
                    // Pre-fill username for convenience
                    setLoginUsername(regUsername);
                    setRegSuccessMsg(""); // clear msg
                }, 1200);
            } else {
                setRegErrorMsg("Registration failed: unexpected response");
            }
        } catch (err: any) {
            const serverBody = err?.response?.data;
            const serverMsg = (serverBody && typeof serverBody === "object")
                ? JSON.stringify(serverBody)
                : serverBody || err?.message;
            setRegErrorMsg(serverMsg || "User already exists or server error");
        }
    };

    const loginFormValid = !validateUsername(loginUsername) && !validatePassword(loginPassword);
    const regFormValid = !validateUsername(regUsername) && !validateEmail(regEmail) && !validatePassword(regPassword);

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
            {/* Decorative SVG background */}
            <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
                    <defs>
                        <radialGradient id="gA" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#00f2ff" stopOpacity={0.7} />
                            <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#5b21b6" stopOpacity={0} />
                        </radialGradient>
                        <radialGradient id="gB" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ff79c6" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#ff4d6d" stopOpacity={0} />
                        </radialGradient>
                        <filter id="b1" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="36" />
                        </filter>
                    </defs>
                    <rect width="100%" height="100%" fill="#0f0c29" />
                    <style>{`
            .orb { transform-origin: center; animation: float 14s ease-in-out infinite; }
            .orb.slow { animation-duration: 20s; }
            .orb.fast { animation-duration: 10s; }
            .node { animation: pulse 4s ease-in-out infinite; }
            .line { stroke-dasharray: 6 6; animation: dash 8s linear infinite; }
            @keyframes float { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,-24px) scale(1.02); } 100% { transform: translate(0,0) scale(1); } }
            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; transform: scale(1.08); } 100% { opacity: 0.5; } }
            @keyframes dash { to { stroke-dashoffset: 1000; } }
          `}</style>
                    <circle className="orb slow" cx="10%" cy="18%" r="260" fill="url(#gA)" filter="url(#b1)" opacity="0.9" />
                    <circle className="orb" cx="88%" cy="12%" r="320" fill="url(#gB)" filter="url(#b1)" opacity="0.85" />
                    <circle className="orb fast" cx="50%" cy="88%" r="300" fill="#6d28d9" filter="url(#b1)" opacity="0.55" />
                    <circle className="orb" cx="80%" cy="80%" r="220" fill="#ec4899" filter="url(#b1)" opacity="0.45" />
                    <g className="nodes" fill="none" stroke="#c084fc" strokeWidth={1} opacity={0.9}>
                        <circle className="node" cx="30%" cy="40%" r="6" fill="#a78bfa" />
                        <circle className="node" cx="70%" cy="28%" r="8" fill="#f472b6" />
                        <circle className="node" cx="50%" cy="82%" r="5" fill="#a78bfa" />
                        <circle className="node" cx="22%" cy="70%" r="4" fill="#fb7185" />
                        <circle className="node" cx="85%" cy="55%" r="6" fill="#60a5fa" />
                        <line className="line" x1="30%" y1="40%" x2="70%" y2="28%" stroke="#a78bfa" />
                        <line className="line" x1="70%" y1="28%" x2="50%" y2="82%" stroke="#f472b6" />
                        <line className="line" x1="50%" y1="82%" x2="30%" y2="40%" stroke="#60a5fa" />
                    </g>
                </svg>
            </div>

            {/* Main Auth Container */}
            <div className="w-full max-w-md sm:max-w-lg relative z-10 px-4">
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[var(--bg-muted)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted-border)] p-8"
                        >
                            {instance && (
                                <div className="text-xs text-surface-subtle text-center mb-3">
                                    Signing in to: <span className="font-mono">{instance}</span>
                                </div>
                            )}
                            <header className="mb-6 text-center">
                                <div className="mx-auto w-12 h-12 rounded-xl bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-primary-500 font-bold">
                                    FS
                                </div>
                                <h1 className="text-2xl font-semibold mt-3">Welcome Back</h1>
                                <p className="text-sm text-surface-subtle">
                                    Sign in to continue
                                </p>
                            </header>

                            <form onSubmit={handleLogin}>
                                <label className="block text-sm mb-1">Username</label>
                                <input
                                    className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${loginUserError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
                                    value={loginUsername}
                                    onChange={(e) => { setLoginUsername(e.target.value); setLoginUserError(validateUsername(e.target.value)); setLoginErrorMsg(''); }}
                                />
                                {loginUserError && <p className="text-xs text-red-400 mb-2">{loginUserError}</p>}

                                <label className="block text-sm mb-1 mt-3">Password</label>
                                <input
                                    type="password"
                                    className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${loginPassError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
                                    value={loginPassword}
                                    onChange={(e) => { setLoginPassword(e.target.value); setLoginPassError(validatePassword(e.target.value)); setLoginErrorMsg(''); }}
                                />
                                {loginPassError && <p className="text-xs text-red-400 mb-2">{loginPassError}</p>}

                                {loginErrorMsg && <p className="text-sm text-red-400 my-2 text-center">{loginErrorMsg}</p>}

                                <button
                                    type="submit"
                                    disabled={!loginFormValid}
                                    className={`w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-white rounded-lg py-2 font-medium shadow-lg transform transition duration-200 ${!loginFormValid ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                >
                                    Sign in
                                </button>
                            </form>

                            <p className="text-sm text-surface-subtle mt-4 text-center">
                                New here?{" "}
                                <button onClick={toggleAuthMode} className="text-[var(--primary)] hover:underline font-medium focus:outline-none">
                                    Create an account
                                </button>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[var(--bg-muted)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted-border)] p-8"
                        >
                            <header className="mb-6 text-center">
                                <h1 className="text-2xl font-semibold">Create account</h1>
                                <p className="text-sm text-surface-subtle">
                                    Join your instance of Federated Social
                                </p>
                                {instance && (
                                    <p className="text-xs text-surface-subtle mt-2">
                                        Registering on: <span className="font-mono">{instance}</span>{" "}
                                        <button
                                            onClick={() => navigate("/")}
                                            className="underline ml-2 text-[var(--primary)]"
                                        >
                                            change
                                        </button>
                                    </p>
                                )}
                            </header>

                            <form onSubmit={handleRegister}>
                                <label className="block text-sm mb-1">Username</label>
                                <input
                                    className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${regUserError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
                                    placeholder="Choose a username"
                                    value={regUsername}
                                    onChange={(e) => { setRegUsername(e.target.value); setRegUserError(validateUsername(e.target.value)); }}
                                />
                                {regUserError && <p className="text-xs text-red-400 mb-2">{regUserError}</p>}

                                <label className="block text-sm mb-1 mt-3">Email</label>
                                <input
                                    type="email"
                                    className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${regEmailError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
                                    placeholder="your@email.com"
                                    value={regEmail}
                                    onChange={(e) => { setRegEmail(e.target.value); setRegEmailError(validateEmail(e.target.value)); }}
                                />
                                {regEmailError && <p className="text-xs text-red-400 mb-2">{regEmailError}</p>}

                                <label className="block text-sm mb-1 mt-3">Password</label>
                                <input
                                    type="password"
                                    className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${regPassError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
                                    placeholder="Choose a password"
                                    value={regPassword}
                                    onChange={(e) => { setRegPassword(e.target.value); setRegPassError(validatePassword(e.target.value)); }}
                                />
                                {regPassError && <p className="text-xs text-red-400 mb-2">{regPassError}</p>}

                                {regSuccessMsg && <p className="text-sm text-green-400 my-2 text-center">{regSuccessMsg}</p>}
                                {regErrorMsg && <p className="text-sm text-red-400 my-2 text-center">{regErrorMsg}</p>}

                                <button
                                    type="submit"
                                    disabled={!regFormValid}
                                    className={`w-full mt-6 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-600 text-white rounded-lg py-2 font-medium shadow-lg transform transition duration-200 ${!regFormValid ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                >
                                    Register
                                </button>
                            </form>

                            <p className="text-sm text-surface-subtle mt-4 text-center">
                                Already have an account?{" "}
                                <button onClick={toggleAuthMode} className="text-[var(--primary)] hover:underline font-medium focus:outline-none">
                                    Sign in
                                </button>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
