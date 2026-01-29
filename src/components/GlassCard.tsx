import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export default function GlassCard({ children, className = "", hoverEffect = false, onClick }: GlassCardProps) {
    // Hybrid Style: Professional Glass + Sketchy Border/Shadow
    const baseClasses = "bg-[var(--bg-muted)]/80 backdrop-blur-md border-2 border-black rounded-xl relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]";
    const hoverClasses = hoverEffect ? "hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[var(--bg-muted)] transition-all duration-300" : "";

    // If hover effect is enabled, use motion.div for smoother interaction, otherwise simple div
    if (hoverEffect || onClick) {
        return (
            <motion.div
                className={`${baseClasses} ${hoverClasses} ${className}`}
                onClick={onClick}
                whileTap={{ scale: 0.98, boxShadow: "2px 2px 0px rgba(0,0,0,1)", x: 2, y: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Subtle gradient overlay for 'premium' feel */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10">{children}</div>
            </motion.div>
        );
    }

    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
