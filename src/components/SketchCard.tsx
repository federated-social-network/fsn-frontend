import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SketchCardProps {
    children: ReactNode;
    className?: string;
    variant?: "paper" | "sticky" | "polaroid";
    rotate?: number; // Slight rotation for the "tossed on desk" feel
    taped?: boolean; // explicitly add tape
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
    pinColor = "#e94242" // Default red pin
}: SketchCardProps) {

    // Base classes for different variants
    const variants = {
        paper: "bg-[var(--paper-white)] text-[var(--ink-primary)]",
        sticky: "bg-[#fff740] text-black shadow-lg", // Classic Yellow Sticky Note
        polaroid: "bg-white p-4 pb-12 text-black shadow-xl border-2 border-gray-200"
    };

    const baseClasses = `
    relative 
    transition-all duration-300 
    border-2 border-[var(--ink-primary)]
    ${variants[variant]}
    ${className}
  `;

    // Randomize border radius slightly for that Organic feel if not passed? 
    // Actually, let's use the CSS variable we defined or a specific class
    const sketchBorderClass = variant === "polaroid" ? "" : "border-sketch shadow-sketch";

    // Auto-enable tape for sticky variant if not specified
    const showTape = taped || (variant === 'sticky' && !pinned);

    return (
        <motion.div
            className={`${baseClasses} ${sketchBorderClass}`}
            initial={{ rotate: rotate - 1 + Math.random() * 2 }}
            whileHover={{ scale: 1.01, rotate: 0 }}
            style={variant === 'sticky' ? { borderRadius: '2px' } : {}} // Stickies are square
        >
            {/* Tape effect */}
            {showTape && !pinned && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-[rgba(255,255,255,0.4)] rotate-[-2deg] backdrop-blur-sm shadow-sm z-20 pointer-events-none"></div>
            )}

            {/* Pin effect */}
            {pinned && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
                    {/* Use a simple SVG for the pin */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' }}>
                        <path d="M12 2C13.1046 2 14 2.89543 14 4V8H15V10H13V18L12 22L11 18V10H9V8H10V4C10 2.89543 10.8954 2 12 2Z" fill={pinColor} stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="4" r="2" fill={`color-mix(in srgb, ${pinColor}, white 30%)`} /> {/* Highlight */}
                    </svg>
                </div>
            )}

            {children}
        </motion.div>
    );
}
