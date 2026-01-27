import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { loginUser } from "../api/api";
import Mascot from "../components/Mascot";
import Logo from "../assets/react.svg"; // Placeholder for logo
import "./Login.css";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const navigate = useNavigate();

    // Validation Helpers
    const validateUsername = (u: string) => (!u || !u.trim() ? "Username is required" : null);
    const validatePassword = (p: string) => {
        if (!p || p.length < 8) return "Password must be at least 8 characters";
        return null;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        const uErr = validateUsername(username);
        const pErr = validatePassword(password);

        if (uErr || pErr) {
            setErrorMsg(uErr || pErr || "Invalid input");
            return;
        }

        setIsLoading(true);
        try {
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
        } catch (err: any) {
            console.error("Login error:", err);
            setErrorMsg(err?.response?.data?.detail || "Invalid username or password");
        } finally {
            setIsLoading(false);
        }
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
                    <div className="login-center">
                        <h2>Welcome back!</h2>
                        <p>Please enter your details</p>
                        {errorMsg && <p className="error-msg">{errorMsg}</p>}
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
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
                            <div className="login-center-buttons">
                                <button type="submit" disabled={isLoading}>
                                    {isLoading ? "Logging In..." : "Log In"}
                                </button>
                                <button type="button">
                                    Log In with Google
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="login-bottom-p">
                        Don't have an account? <Link to="/register">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
