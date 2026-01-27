import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser } from "../api/api";
import Mascot from "../components/Mascot";
import Logo from "../assets/react.svg"; // Placeholder
import "./Login.css"; // Reuse existing styles

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
        // Optional: clear inputs or keep them? Usually clear.
        // setUsername(""); setEmail(""); setPassword(""); 
        // Keeping inputs might be friendly if accidental switch.
    }, [isRegisterMode]);

    // Validation Helpers
    const validateUsername = (u: string) => (!u || !u.trim() ? "Username is required" : null);
    const validateEmail = (e: string) => {
        if (!e || !e.trim()) return "Email is required";
        // Simple regex
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
                    // Auto-login or redirect to login? 
                    // Let's redirect to login for clarity or just log them in if API returns token (rare for register usually)
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
        <div className="login-main">
            <div className="login-left">
                <Mascot isPasswordFocused={isPasswordFocused} />
            </div>
            <div className="login-right">
                <div className="login-right-container">
                    <div className="login-logo">
                        <img src={Logo} alt="Logo" />
                    </div>

                    {/* Animate the form container when switching modes */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegisterMode ? "register" : "login"}
                            initial={{ opacity: 0, x: isRegisterMode ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isRegisterMode ? -20 : 20 }}
                            transition={{ duration: 0.3 }}
                            className="login-center"
                        >
                            <h2>{isRegisterMode ? "Create Account" : "Welcome back!"}</h2>
                            <p>{isRegisterMode ? "Join our community today" : "Please enter your details"}</p>

                            {errorMsg && <p className="error-msg">{errorMsg}</p>}
                            {successMsg && <p className="error-msg" style={{ color: "green" }}>{successMsg}</p>}

                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                {isRegisterMode && (
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                )}

                                <div className="pass-input-div">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                    />
                                    {showPassword ? (
                                        <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                                    ) : (
                                        <FaEye onClick={() => setShowPassword(!showPassword)} />
                                    )}
                                </div>

                                {!isRegisterMode && (
                                    <div className="login-center-options">
                                        <div className="remember-div">
                                            <input type="checkbox" id="remember-checkbox" />
                                            <label htmlFor="remember-checkbox">
                                                Remember for 30 days
                                            </label>
                                        </div>
                                        <Link to="#" className="forgot-pass-link">
                                            Forgot password?
                                        </Link>
                                    </div>
                                )}

                                <div className="login-center-buttons">
                                    <button type="submit" disabled={isLoading}>
                                        {isLoading
                                            ? (isRegisterMode ? "Registering..." : "Logging In...")
                                            : (isRegisterMode ? "Sign Up" : "Log In")
                                        }
                                    </button>
                                    {!isRegisterMode && (
                                        <button type="button">
                                            Log In with Google
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <p className="login-bottom-p">
                        {isRegisterMode ? "Already have an account?" : "Don't have an account?"}
                        <a href="#" onClick={toggleMode}>
                            {isRegisterMode ? " Log In" : " Sign Up"}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
