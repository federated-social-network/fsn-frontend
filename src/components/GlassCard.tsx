import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
    variant?: 'glass' | 'note';
}

export default function GlassCard({ children, className = "", hoverEffect = false, onClick, variant = 'glass' }: GlassCardProps) {
    // Hybrid Style: Professional Glass + Sketchy Border/Shadow
    // Note Variant: Clean White for professional look
    const bgClass = variant === 'note' ? "bg-white" : "bg-[var(--bg-muted)]/80 backdrop-blur-md";

    const baseClasses = `${bgClass} border-2 border-black rounded-xl relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]`;
    const hoverClasses = hoverEffect ? "hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-300" : "";

    // If hover effect is enabled, use motion.div for smoother interaction, otherwise simple div
    if (hoverEffect || onClick) {
        return (
            <motion.div
                className={`${baseClasses} ${hoverClasses} ${className}`}
                onClick={onClick}
                whileTap={{ scale: 0.98, boxShadow: "2px 2px 0px rgba(0,0,0,1)", x: 2, y: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Subtle gradient overlay for 'premium' feel - only for glass variant */
                    variant === 'glass' && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                }
                <div className="relative z-10">{children}</div>
            </motion.div>
        );
    }

    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`}>
            {variant === 'glass' && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
