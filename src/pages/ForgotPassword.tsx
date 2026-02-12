import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPassword, verifyOtp, resetPassword } from "../api/api";
import SketchCard from "../components/SketchCard";
import Mascot from "../components/Mascot";



const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!email || !email.trim()) {
            setErrorMsg("Email is required");
            return;
        }

        setIsLoading(true);
        try {
            await forgotPassword(email);
            setSuccessMsg("OTP sent to your email!");
            setTimeout(() => {
                setStep(2);
                setSuccessMsg("");
            }, 1500);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setErrorMsg(err?.response?.data?.detail || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!otp || !otp.trim()) {
            setErrorMsg("OTP is required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await verifyOtp(email, otp);
            // Assuming backend returns some token or just success. 
            // The user request said "backend will send reset_token"
            if (res.data?.reset_token) {
                setResetToken(res.data.reset_token);
                setSuccessMsg("OTP Verified!");
                setTimeout(() => {
                    setStep(3);
                    setSuccessMsg("");
                }, 1000);
            } else {
                // Fallback if structure is different but status is 200
                // But strictly following "backend will send reset_token"
                setErrorMsg("Invalid response from server (missing reset_token)");
            }
        } catch (err: any) {
            console.error("Verify OTP error:", err);
            setErrorMsg(err?.response?.data?.detail || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep3 = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!newPassword || newPassword.length < 8) {
            setErrorMsg("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords didn't match");
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(resetToken, newPassword);
            setSuccessMsg("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);
        } catch (err: any) {
            console.error("Reset password error:", err);
            setErrorMsg(err?.response?.data?.detail || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
            {/* Container for the Two Cards */}
            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-full">

                {/* Left Side: Mascot Card */}
                <div className="hidden md:block h-full">
                    <SketchCard variant="paper" className="h-full flex flex-col items-center justify-center p-8 bg-sky-50 transform -rotate-1">
                        <h2 className="text-4xl font-bold text-center mb-8 font-sketch tracking-wider">
                            {step === 1 ? "Forgot Password?" : step === 2 ? "Check Your Mail!" : "New Secret Code!"}
                        </h2>
                        <div className="w-full max-w-xs scale-110">
                            <Mascot isPasswordFocused={isPasswordFocused} showPassword={showPassword} />
                        </div>
                    </SketchCard>
                </div>

                {/* Right Side: Form Card */}
                <div className="w-full h-full">
                    <SketchCard variant="paper" className="h-full p-8 md:p-12 flex flex-col justify-center bg-white transform rotate-1 relative">

                        <Link to="/auth/login" className="absolute top-6 left-6 text-2xl text-[var(--ink-secondary)] hover:text-black hover:-translate-x-1 transition-all">
                            <FaArrowLeft />
                        </Link>

                        <div className="flex flex-col items-center mb-8 mt-4">
                            <h1 className="text-4xl font-bold font-sketch tracking-wider text-center mb-2">
                                {step === 1 ? "Recovery" : step === 2 ? "Verification" : "Reset"}
                            </h1>
                            <p className="text-center text-lg font-hand text-[var(--ink-secondary)]">
                                {step === 1 && "Don't worry, it happens to the best of us."}
                                {step === 2 && "Enter the code we sent to your email."}
                                {step === 3 && "Make sure it's secure this time!"}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="mb-6 font-hand text-red-600 text-center border-2 border-dashed border-red-400 p-3 bg-red-50 rounded transform rotate-1">
                                {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="mb-6 font-hand text-green-600 text-center border-2 border-dashed border-green-400 p-3 bg-green-50 rounded transform -rotate-1">
                                {successMsg}
                            </div>
                        )}

                        <div className="w-full max-w-sm mx-auto">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.form
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleStep1}
                                        className="space-y-5"
                                    >
                                        <div className="group">
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white border-2 border-black/80 p-3 text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md"
                                                autoFocus
                                            />
                                        </div>
                                        <button type="submit" disabled={isLoading}
                                            className="w-full py-3 bg-[var(--primary)] text-white text-2xl font-bold font-sketch tracking-widest hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg border-2 border-transparent hover:border-black/20 rounded-lg mt-2 relative overflow-hidden"
                                        >
                                            <span className="relative z-10">
                                                {isLoading ? "Sending..." : "Send OTP ->"}
                                            </span>
                                        </button>
                                    </motion.form>
                                )}

                                {step === 2 && (
                                    <motion.form
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleStep2}
                                        className="space-y-5"
                                    >
                                        <div className="group">
                                            <input
                                                type="text"
                                                placeholder="Enter OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full bg-white border-2 border-black/80 p-3 text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md text-center tracking-widest"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <button type="button" onClick={() => setStep(1)} className="text-sm font-hand font-bold text-[var(--ink-secondary)] hover:text-black hover:underline">
                                                Change Email
                                            </button>
                                            <button type="button" onClick={handleStep1} disabled={isLoading} className="text-sm font-hand font-bold text-[var(--ink-secondary)] hover:text-black hover:underline">
                                                Resend OTP
                                            </button>
                                        </div>
                                        <button type="submit" disabled={isLoading}
                                            className="w-full py-3 bg-[var(--primary)] text-white text-2xl font-bold font-sketch tracking-widest hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg border-2 border-transparent hover:border-black/20 rounded-lg mt-2 relative overflow-hidden"
                                        >
                                            <span className="relative z-10">
                                                {isLoading ? "Verifying..." : "Verify OTP ->"}
                                            </span>
                                        </button>
                                    </motion.form>
                                )}

                                {step === 3 && (
                                    <motion.form
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleStep3}
                                        className="space-y-5"
                                    >
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                onFocus={() => setIsPasswordFocused(true)}
                                                onBlur={() => setIsPasswordFocused(false)}
                                                className="w-full bg-white border-2 border-black/80 p-3 text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md"
                                                autoFocus
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-xl hover:scale-110 transition-transform text-black/60 hover:text-black">
                                                {showPassword ? (
                                                    <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                                                ) : (
                                                    <FaEye onClick={() => setShowPassword(!showPassword)} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white border-2 border-black/80 p-3 text-xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-hand text-black placeholder:text-gray-400 rounded-md"
                                            />
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-red-500 text-sm font-hand font-bold mt-1 animate-pulse">
                                                    Passwords didn't match!
                                                </p>
                                            )}
                                        </div>

                                        <button type="submit" disabled={isLoading || newPassword !== confirmPassword}
                                            className={`w-full py-3 bg-[var(--primary)] text-white text-2xl font-bold font-sketch tracking-widest hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg border-2 border-transparent hover:border-black/20 rounded-lg mt-2 relative overflow-hidden ${newPassword !== confirmPassword ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                        >
                                            <span className="relative z-10">
                                                {isLoading ? "Resetting..." : "Reset Password ->"}
                                            </span>
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                    </SketchCard>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
