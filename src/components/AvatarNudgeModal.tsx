import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SketchCard from "./SketchCard";

/**
 * Props for the AvatarNudgeModal.
 */
interface AvatarNudgeModalProps {
    /** Whether the modal is visible. */
    isOpen: boolean;
    /** Called when the user wants to upload an avatar. */
    onUpload: () => void;
    /** Called when the user skips avatar upload. */
    onSkip: () => void;
}

/** Funny dialogue lines the mascot cycles through. */
const DIALOGUES = [
    "I've been looking everywhere but I can't find your face… did you forget it at home? 🔍",
    "No profile pic? Are you a ghost? Should I be scared? 👻",
    "I tried to paint your portrait but… you're giving me nothing to work with fam 💀",
    "Smile! …oh wait, there's nobody here. The camera is confused and honestly, so am I 📸",
    "This mirror is supposed to show how awesome you look… but it's showing static. Help it out? 🪞",
];

/**
 * A playful modal that appears after registration when the user hasn't uploaded
 * a profile picture. Features an animated mascot detective with funny dialogue.
 */
export default function AvatarNudgeModal({ isOpen, onUpload, onSkip }: AvatarNudgeModalProps) {
    const [dialogueIndex] = useState(() => Math.floor(Math.random() * DIALOGUES.length));
    const [displayedText, setDisplayedText] = useState("");
    const [showButtons, setShowButtons] = useState(false);

    const dialogue = DIALOGUES[dialogueIndex];

    // Typewriter effect
    useEffect(() => {
        if (!isOpen) {
            setDisplayedText("");
            setShowButtons(false);
            return;
        }

        let i = 0;
        setDisplayedText("");
        setShowButtons(false);

        // Delay start so entry animation plays first
        const startDelay = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayedText(dialogue.slice(0, i));
                if (i >= dialogue.length) {
                    clearInterval(interval);
                    setTimeout(() => setShowButtons(true), 300);
                }
            }, 28);
            return () => clearInterval(interval);
        }, 1200);

        return () => clearTimeout(startDelay);
    }, [isOpen, dialogue]);

    const handleUpload = useCallback(() => onUpload(), [onUpload]);
    const handleSkip = useCallback(() => onSkip(), [onSkip]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleSkip}
                    />

                    {/* Modal Card */}
                    <motion.div
                        className="relative z-10 w-full max-w-md"
                        initial={{ scale: 0.6, y: 60, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 40, opacity: 0 }}
                        transition={{ type: "spring", damping: 18, stiffness: 200 }}
                    >
                        <SketchCard variant="paper" className="p-6 sm:p-8 bg-white">
                            {/* Mascot SVG */}
                            <div className="flex justify-center mb-4">
                                <MascotDetective />
                            </div>

                            {/* Speech Bubble */}
                            <div className="relative mx-auto max-w-xs mb-6">
                                {/* Bubble pointer */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[12px] border-l-transparent border-r-transparent border-b-sky-100" />
                                <div className="bg-sky-50 border-2 border-black/80 rounded-xl p-4 min-h-[72px]">
                                    <p className="font-hand text-sm sm:text-base text-gray-800 leading-relaxed m-0">
                                        {displayedText}
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="inline-block w-0.5 h-4 bg-black ml-0.5 align-middle"
                                        />
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <AnimatePresence>
                                {showButtons && (
                                    <motion.div
                                        className="flex flex-col sm:flex-row gap-3 justify-center"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <button
                                            onClick={handleUpload}
                                            className="px-5 py-2.5 bg-[var(--primary)] text-white font-sketch text-base tracking-wide hover:bg-black transition-colors rounded-lg border-2 border-transparent hover:border-black/20"
                                        >
                                            Fine, here's my face 🙄
                                        </button>
                                        <button
                                            onClick={handleSkip}
                                            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-sketch text-base tracking-wide hover:bg-gray-200 transition-colors rounded-lg border-2 border-gray-300 hover:border-gray-400"
                                        >
                                            Nah, I'm a ghost 👻
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Tiny skip text */}
                            <p className="text-center text-xs text-gray-400 font-hand mt-4 mb-0">
                                profile pic is totally optional btw ✌️
                            </p>
                        </SketchCard>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


// ─── Mascot Detective Sub-Component ──────────────────────────────────────────

/**
 * An animated detective-themed mascot SVG that looks around searching for the
 * user's face.  Reuses the sketchy art style from the main Mascot component.
 */
function MascotDetective() {
    return (
        <motion.div
            className="w-40 h-40 sm:w-48 sm:h-48 select-none pointer-events-none"
            initial={{ y: 30, opacity: 0, rotate: -5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 160, delay: 0.15 }}
        >
            <svg viewBox="0 0 200 200" width="100%" height="100%" className="overflow-visible">
                <defs>
                    <filter id="crayon-nudge">
                        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                    </filter>
                </defs>

                {/* Main Body Group — bounces */}
                <motion.g
                    filter="url(#crayon-nudge)"
                    animate={{
                        y: [0, -3, 0],
                        rotate: [0, 1, -1, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* ── DETECTIVE HAT ── */}
                    <motion.g
                        animate={{ rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "100px 36px" }}
                    >
                        {/* Hat brim */}
                        <ellipse cx="100" cy="52" rx="42" ry="8" fill="#6b4c2a" stroke="black" strokeWidth="2.5" />
                        {/* Hat top */}
                        <path d="M 70 52 Q 72 20 100 18 Q 128 20 130 52" fill="#8B6F47" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />
                        {/* Hat band */}
                        <rect x="72" y="44" width="56" height="8" rx="2" fill="#5a3e1b" stroke="black" strokeWidth="1.5" />
                    </motion.g>

                    {/* ── HEAD ── */}
                    <rect x="68" y="52" width="64" height="56" rx="10" fill="#a5b4fc" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />

                    {/* ── EYES (looking around) ── */}
                    <g transform="translate(100, 74)">
                        {/* Left Eye */}
                        <g transform="translate(-16, 0)">
                            <circle r="10" fill="white" stroke="black" strokeWidth="2" />
                            <motion.circle
                                r="4" fill="black"
                                animate={{ x: [-4, 4, -2, 3, 0], y: [0, -2, 1, -1, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                        </g>
                        {/* Right Eye — squinting (detective look) */}
                        <g transform="translate(16, 0)">
                            <circle r="10" fill="white" stroke="black" strokeWidth="2" />
                            <motion.circle
                                r="4" fill="black"
                                animate={{ x: [-4, 4, -2, 3, 0], y: [0, -2, 1, -1, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                            {/* Squint eyelid on right eye */}
                            <motion.path
                                d="M -10 -4 Q 0 -8 10 -4"
                                stroke="black" strokeWidth="2" fill="none"
                                animate={{ y: [0, 2, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </g>
                    </g>

                    {/* ── MOUTH (curious "hmm") ── */}
                    <motion.path
                        d="M 88 94 Q 100 90 112 94"
                        stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        animate={{ d: ["M 88 94 Q 100 90 112 94", "M 88 94 Q 100 96 112 94", "M 88 94 Q 100 90 112 94"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* ── BODY ── */}
                    <path d="M 86 108 L 86 120" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 114 108 L 114 120" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="76" y="120" width="48" height="32" rx="6" fill="#a5b4fc" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />

                    {/* ── LEFT ARM (waving / searching) ── */}
                    <motion.path
                        d="M 76 128 Q 56 118 48 130"
                        stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        animate={{
                            d: [
                                "M 76 128 Q 56 118 48 130",
                                "M 76 128 Q 50 110 42 120",
                                "M 76 128 Q 56 118 48 130",
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* ── RIGHT ARM + MAGNIFYING GLASS ── */}
                    <motion.g
                        animate={{ rotate: [0, 8, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "124px 128px" }}
                    >
                        {/* Arm */}
                        <path d="M 124 128 Q 144 114 156 104" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        {/* Magnifying glass handle */}
                        <line x1="156" y1="104" x2="164" y2="96" stroke="#6b4c2a" strokeWidth="4" strokeLinecap="round" />
                        {/* Magnifying glass lens */}
                        <circle cx="170" cy="88" r="14" fill="rgba(200,230,255,0.4)" stroke="black" strokeWidth="2.5" />
                        {/* Glass shine */}
                        <path d="M 163 82 Q 166 78 170 80" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
                        {/* Question mark inside lens */}
                        <motion.text
                            x="170" y="93"
                            textAnchor="middle"
                            fontSize="14" fontWeight="bold" fill="#1e40af"
                            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            ?
                        </motion.text>
                    </motion.g>

                    {/* ── FEET ── */}
                    <ellipse cx="88" cy="154" rx="10" ry="4" fill="#a5b4fc" stroke="black" strokeWidth="2" />
                    <ellipse cx="112" cy="154" rx="10" ry="4" fill="#a5b4fc" stroke="black" strokeWidth="2" />
                </motion.g>

                {/* ── Floating question marks around mascot ── */}
                <motion.text
                    x="30" y="60" fontSize="18" fill="#6b7280" fontWeight="bold"
                    animate={{ y: [60, 45, 60], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
                >?</motion.text>
                <motion.text
                    x="175" y="50" fontSize="14" fill="#6b7280" fontWeight="bold"
                    animate={{ y: [50, 35, 50], opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                >?</motion.text>
                <motion.text
                    x="20" y="130" fontSize="12" fill="#9ca3af" fontWeight="bold"
                    animate={{ y: [130, 118, 130], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: 1.2 }}
                >?</motion.text>
            </svg>
        </motion.div>
    );
}
