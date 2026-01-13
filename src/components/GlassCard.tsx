import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export default function GlassCard({ children, className = "", hoverEffect = false, onClick }: GlassCardProps) {
    const baseClasses = "bg-[var(--bg-muted)]/80 backdrop-blur-md border border-[var(--muted-border)] rounded-xl relative overflow-hidden shadow-sm";
    const hoverClasses = hoverEffect ? "hover:shadow-md hover:bg-[var(--bg-muted)] transition-all duration-300" : "";

    // If hover effect is enabled, use motion.div for smoother interaction, otherwise simple div
    if (hoverEffect || onClick) {
        return (
            <motion.div
                className={`${baseClasses} ${hoverClasses} ${className}`}
                onClick={onClick}
                whileHover={hoverEffect ? { y: -2 } : undefined}
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
