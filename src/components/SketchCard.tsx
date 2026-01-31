import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SketchCardProps {
    children: ReactNode;
    className?: string;
    variant?: "paper" | "sticky" | "polaroid";
    rotate?: number; // Kept for API compatibility but ignored for visuals
    taped?: boolean;
    pinned?: boolean;
    pinColor?: string;
}

export default function SketchCard({
    children,
    className = "",
    variant = "paper",
    rotate = 0,
    taped = false,
    pinned = false,
    pinColor = "#e94242"
}: SketchCardProps) {

    // Base classes for different variants
    const variants = {
        paper: "bg-[var(--paper-white)] text-[var(--ink-primary)]",
        sticky: "bg-[#fff740] text-black shadow-md",
        polaroid: "bg-white p-4 pb-12 text-black shadow-lg border border-gray-200"
    };

    const baseClasses = `
    relative 
    transition-all duration-300 
    rounded-lg
    border-2 border-[var(--ink-primary)]
    ${variants[variant]}
    ${className}
  `;

    // Stickies are square-ish but straight now.
    // Polaroid uses default border from variants map.
    // Paper uses the border defined in baseClasses.

    // Auto-enable tape for sticky variant if not specified
    const showTape = taped || (variant === 'sticky' && !pinned);

    return (
        <motion.div
            className={`${baseClasses}`}
            initial={{ rotate: 0 }}
            whileHover={{ scale: 1.005 }}
            style={variant === 'sticky' ? { borderRadius: '4px' } : {}}
        >
            {/* Tape effect - Made straight and simpler */}
            {showTape && !pinned && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[rgba(255,255,255,0.4)] backdrop-blur-sm shadow-sm z-20 pointer-events-none border-l border-r border-white/50"></div>
            )}

            {/* Pin effect */}
            {pinned && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-sm">
                    {/* Use a simple SVG for the pin */}
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C13.1046 2 14 2.89543 14 4V8H15V10H13V18L12 22L11 18V10H9V8H10V4C10 2.89543 10.8954 2 12 2Z" fill={pinColor} stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="4" r="2" fill={`color-mix(in srgb, ${pinColor}, white 30%)`} />
                    </svg>
                </div>
            )}

            {children}
        </motion.div>
    );
}
