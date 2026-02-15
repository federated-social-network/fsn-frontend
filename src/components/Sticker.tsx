import React from "react";

/**
 * Supported sticker types.
 */
export type StickerType =
    | "pin-1" | "pin-2" | "pin-3"
    | "plane"
    | "camera"
    | "compass"
    | "stamp";

/**
 * Props for the Sticker component.
 */
interface StickerProps {
    /** The type of sticker to render. */
    type: StickerType;
    /** Additional CSS classes. */
    className?: string;
    /** Inline styles. */
    style?: React.CSSProperties;
}

/**
 * Renders a decorative SVG sticker.
 *
 * @param {StickerProps} props - The component props.
 * @returns {JSX.Element} The rendered Sticker SVG.
 */
export default function Sticker({ type, className = "", style }: StickerProps) {
    if (type.startsWith("pin")) {
        const colors = {
            "pin-1": { fill: "#FF6B6B", shadow: "#FF8C8C" }, // Red
            "pin-2": { fill: "#4CAF50", shadow: "#66BB6A" }, // Green
            "pin-3": { fill: "#4169E1", shadow: "#6495ED" }, // Blue
        };
        const color = colors[type as keyof typeof colors] || colors["pin-1"];

        return (
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className={`pointer-events-none ${className}`}
                style={style}
            >
                {/* Pin Head */}
                <circle cx="20" cy="20" r="12" fill={color.fill} stroke="#000" strokeWidth="2" />
                <circle cx="20" cy="20" r="8" fill={color.shadow} opacity="0.5" />
                {/* Needle hint */}
                <path d="M 20 32 L 20 40" stroke="#000" strokeWidth="2" opacity="0.5" />
            </svg>
        );
    }

    if (type === "plane") {
        return (
            <svg
                width="80"
                height="50"
                viewBox="0 0 100 60"
                className={`pointer-events-none ${className}`}
                style={style}
            >
                <g transform="rotate(-15 50 30)">
                    {/* Fuselage */}
                    <ellipse cx="50" cy="30" rx="35" ry="12" fill="#FF6B6B" stroke="#000" strokeWidth="2" opacity="0.9" />
                    {/* Wings */}
                    <polygon points="20,30 80,30 85,25 15,25" fill="#FF8C8C" stroke="#000" strokeWidth="1" opacity="0.8" />
                    {/* Tail */}
                    <polygon points="15,30 10,25 10,35" fill="#FF4444" stroke="#000" strokeWidth="1" opacity="0.8" />
                    {/* Window */}
                    <circle cx="50" cy="30" r="3" fill="#87CEEB" opacity="0.9" />
                </g>
            </svg>
        );
    }

    if (type === "camera") {
        return (
            <svg
                width="60"
                height="50"
                viewBox="0 0 100 80"
                className={`pointer-events-none ${className}`}
                style={style}
            >
                <g transform="rotate(5 50 40)">
                    {/* Camera body */}
                    <rect x="10" y="20" width="80" height="60" rx="4" fill="#333" stroke="#000" strokeWidth="2" opacity="0.85" />
                    {/* Lens */}
                    <circle cx="50" cy="50" r="20" fill="#87CEEB" stroke="#000" strokeWidth="2" opacity="0.8" />
                    <circle cx="50" cy="50" r="14" fill="#B0E0E6" opacity="0.6" />
                    {/* Flash */}
                    <rect x="25" y="25" width="10" height="10" fill="#FFD700" stroke="#000" strokeWidth="1" />
                </g>
            </svg>
        );
    }

    if (type === "compass") {
        return (
            <svg
                width="50"
                height="50"
                viewBox="0 0 60 60"
                className={`pointer-events-none ${className}`}
                style={style}
            >
                <circle cx="30" cy="30" r="25" fill="none" stroke="#000" strokeWidth="2" opacity="0.7" />
                <circle cx="30" cy="30" r="20" fill="#FFF8DC" stroke="#000" strokeWidth="1" opacity="0.8" />
                {/* Needle */}
                <line x1="30" y1="30" x2="30" y2="10" stroke="#FF6B6B" strokeWidth="2" transform="rotate(45 30 30)" />
                <line x1="30" y1="30" x2="30" y2="50" stroke="#000" strokeWidth="2" transform="rotate(45 30 30)" />
            </svg>
        );
    }

    // Default stamp
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" className={`pointer-events-none opacity-50 ${className}`} style={style}>
            <circle cx="20" cy="20" r="18" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4 2" />
            <text x="20" y="24" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fill="#000" fontWeight="bold">POST</text>
        </svg>
    )

}
