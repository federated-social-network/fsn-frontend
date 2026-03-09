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
    /** Called when the user confirms they want to skip (after double confirmation). */
    onConfirmSkip: () => void;
}

/** Funny dialogue lines for Step 1 — the initial nudge. */
const STEP1_DIALOGUES = [
    "I've been looking everywhere but I can't find your face… did you forget it at home? 🔍",
    "No profile pic? Are you a ghost? Should I be scared? 👻",
    "I tried to paint your portrait but… you're giving me nothing to work with fam 💀",
    "Smile! …oh wait, there's nobody here. The camera is confused and honestly, so am I 📸",
    "This mirror is supposed to show how awesome you look… but it's showing static. Help it out? 🪞",
];

/** Dank "are you sure?!" lines for Step 2 — the guilt trip. */
const STEP2_DIALOGUES = [
    "bro really said 'no photo' with a straight face... wait, how would we even know? WE CAN'T SEE YOUR FACE 😭",
    "you're about to be the only profile that looks like a missing persons poster. last chance fr fr 💀",
    "imagine someone scrolling past your profile and thinking their screen didn't load. that's gonna be you. 🫥",
    "okay so you want people to think you're an AI bot? because that's how you get people thinking you're an AI bot 🤖",
    "you sure? your profile is gonna hit different... and by different i mean empty. like a parking lot at 3am. 🅿️",
];

/**
 * A two-step playful modal that appears BEFORE registration when the user
 * hasn't uploaded a profile picture.
 *
 * Step 1: Detective mascot nudges user to upload.
 * Step 2: Dramatic "ARE YOU SURE?!" with a panicking mascot.
 */
export default function AvatarNudgeModal({ isOpen, onUpload, onConfirmSkip }: AvatarNudgeModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [dialogueIndex1] = useState(() => Math.floor(Math.random() * STEP1_DIALOGUES.length));
    const [dialogueIndex2] = useState(() => Math.floor(Math.random() * STEP2_DIALOGUES.length));
    const [displayedText, setDisplayedText] = useState("");
    const [showButtons, setShowButtons] = useState(false);

    const dialogue = step === 1 ? STEP1_DIALOGUES[dialogueIndex1] : STEP2_DIALOGUES[dialogueIndex2];

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setDisplayedText("");
            setShowButtons(false);
        }
    }, [isOpen]);

    // Typewriter effect — reruns on step change
    useEffect(() => {
        if (!isOpen) return;

        let i = 0;
        let interval: ReturnType<typeof setInterval>;
        setDisplayedText("");
        setShowButtons(false);

        const startDelay = setTimeout(() => {
            interval = setInterval(() => {
                i++;
                setDisplayedText(dialogue.slice(0, i));
                if (i >= dialogue.length) {
                    clearInterval(interval);
                    setTimeout(() => setShowButtons(true), 300);
                }
            }, 25);
        }, step === 1 ? 1200 : 800);

        return () => {
            clearTimeout(startDelay);
            clearInterval(interval!);
        };
    }, [isOpen, step, dialogue]);

    const handleUpload = useCallback(() => onUpload(), [onUpload]);

    const handleFirstSkip = useCallback(() => {
        setStep(2);
    }, []);

    const handleConfirmSkip = useCallback(() => onConfirmSkip(), [onConfirmSkip]);

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
                    />

                    {/* Modal Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            className="relative z-10 w-full max-w-md"
                            initial={{ scale: 0.6, y: 60, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: -30, opacity: 0 }}
                            transition={{ type: "spring", damping: 18, stiffness: 200 }}
                        >
                            <SketchCard variant="paper" className={`p-6 sm:p-8 ${step === 2 ? 'bg-red-50' : 'bg-white'}`}>
                                {/* Step indicator */}
                                {step === 2 && (
                                    <motion.div
                                        className="text-center mb-2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: [0, 1.3, 1] }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <span className="font-sketch text-red-500 text-lg tracking-wider">⚠️ HOLD UP ⚠️</span>
                                    </motion.div>
                                )}

                                {/* Mascot SVG */}
                                <div className="flex justify-center mb-4">
                                    {step === 1 ? <MascotDetective /> : <MascotPanicking />}
                                </div>

                                {/* Speech Bubble */}
                                <div className="relative mx-auto max-w-xs mb-6">
                                    {/* Bubble pointer */}
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[12px] border-l-transparent border-r-transparent ${step === 2 ? 'border-b-red-100' : 'border-b-sky-100'}`} />
                                    <div className={`${step === 2 ? 'bg-red-100 border-red-300' : 'bg-sky-50 border-black/80'} border-2 rounded-xl p-4 min-h-[72px]`}>
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
                                            {step === 1 ? (
                                                <>
                                                    <button
                                                        onClick={handleUpload}
                                                        className="px-5 py-2.5 bg-[var(--primary)] text-white font-sketch text-base tracking-wide hover:bg-black transition-colors rounded-lg border-2 border-transparent hover:border-black/20"
                                                    >
                                                        Fine, here's my face 🙄
                                                    </button>
                                                    <button
                                                        onClick={handleFirstSkip}
                                                        className="px-5 py-2.5 bg-gray-100 text-gray-700 font-sketch text-base tracking-wide hover:bg-gray-200 transition-colors rounded-lg border-2 border-gray-300 hover:border-gray-400"
                                                    >
                                                        Nah, I'm a ghost 👻
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <motion.button
                                                        onClick={handleUpload}
                                                        className="px-5 py-2.5 bg-green-600 text-white font-sketch text-base tracking-wide hover:bg-green-700 transition-colors rounded-lg border-2 border-green-700 hover:border-green-800"
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        OK OK I'll upload 😤
                                                    </motion.button>
                                                    <button
                                                        onClick={handleConfirmSkip}
                                                        className="px-5 py-2.5 bg-gray-100 text-gray-500 font-sketch text-sm tracking-wide hover:bg-gray-200 transition-colors rounded-lg border-2 border-dashed border-gray-300"
                                                    >
                                                        I said what I said 💀
                                                    </button>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer text */}
                                <p className="text-center text-xs text-gray-400 font-hand mt-4 mb-0">
                                    {step === 1
                                        ? "profile pic is totally optional btw ✌️"
                                        : "we'll still love you without one... probably 🥲"}
                                </p>
                            </SketchCard>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


// ─── Mascot Detective (Step 1) ──────────────────────────────────────────────

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

                <motion.g
                    filter="url(#crayon-nudge)"
                    animate={{ y: [0, -3, 0], rotate: [0, 1, -1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Detective Hat */}
                    <motion.g
                        animate={{ rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "100px 36px" }}
                    >
                        <ellipse cx="100" cy="52" rx="42" ry="8" fill="#6b4c2a" stroke="black" strokeWidth="2.5" />
                        <path d="M 70 52 Q 72 20 100 18 Q 128 20 130 52" fill="#8B6F47" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />
                        <rect x="72" y="44" width="56" height="8" rx="2" fill="#5a3e1b" stroke="black" strokeWidth="1.5" />
                    </motion.g>

                    {/* Head */}
                    <rect x="68" y="52" width="64" height="56" rx="10" fill="#a5b4fc" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />

                    {/* Eyes (looking around) */}
                    <g transform="translate(100, 74)">
                        <g transform="translate(-16, 0)">
                            <circle r="10" fill="white" stroke="black" strokeWidth="2" />
                            <motion.circle r="4" fill="black"
                                animate={{ x: [-4, 4, -2, 3, 0], y: [0, -2, 1, -1, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                        </g>
                        <g transform="translate(16, 0)">
                            <circle r="10" fill="white" stroke="black" strokeWidth="2" />
                            <motion.circle r="4" fill="black"
                                animate={{ x: [-4, 4, -2, 3, 0], y: [0, -2, 1, -1, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                            <motion.path d="M -10 -4 Q 0 -8 10 -4" stroke="black" strokeWidth="2" fill="none"
                                animate={{ y: [0, 2, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </g>
                    </g>

                    {/* Mouth */}
                    <motion.path
                        d="M 88 94 Q 100 90 112 94"
                        stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        animate={{ d: ["M 88 94 Q 100 90 112 94", "M 88 94 Q 100 96 112 94", "M 88 94 Q 100 90 112 94"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Body */}
                    <path d="M 86 108 L 86 120" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 114 108 L 114 120" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="76" y="120" width="48" height="32" rx="6" fill="#a5b4fc" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />

                    {/* Left arm */}
                    <motion.path d="M 76 128 Q 56 118 48 130" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        animate={{ d: ["M 76 128 Q 56 118 48 130", "M 76 128 Q 50 110 42 120", "M 76 128 Q 56 118 48 130"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Right arm + magnifying glass */}
                    <motion.g
                        animate={{ rotate: [0, 8, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "124px 128px" }}
                    >
                        <path d="M 124 128 Q 144 114 156 104" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <line x1="156" y1="104" x2="164" y2="96" stroke="#6b4c2a" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="170" cy="88" r="14" fill="rgba(200,230,255,0.4)" stroke="black" strokeWidth="2.5" />
                        <path d="M 163 82 Q 166 78 170 80" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
                        <motion.text x="170" y="93" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e40af"
                            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >?</motion.text>
                    </motion.g>

                    {/* Feet */}
                    <ellipse cx="88" cy="154" rx="10" ry="4" fill="#a5b4fc" stroke="black" strokeWidth="2" />
                    <ellipse cx="112" cy="154" rx="10" ry="4" fill="#a5b4fc" stroke="black" strokeWidth="2" />
                </motion.g>

                {/* Floating question marks */}
                <motion.text x="30" y="60" fontSize="18" fill="#6b7280" fontWeight="bold"
                    animate={{ y: [60, 45, 60], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                >?</motion.text>
                <motion.text x="175" y="50" fontSize="14" fill="#6b7280" fontWeight="bold"
                    animate={{ y: [50, 35, 50], opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                >?</motion.text>
            </svg>
        </motion.div>
    );
}


// ─── Mascot Panicking (Step 2) — different character, freaking out ──────────

function MascotPanicking() {
    return (
        <motion.div
            className="w-40 h-40 sm:w-48 sm:h-48 select-none pointer-events-none"
            initial={{ scale: 0.3, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 200 }}
        >
            <svg viewBox="0 0 200 200" width="100%" height="100%" className="overflow-visible">
                <defs>
                    <filter id="crayon-panic">
                        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                    </filter>
                </defs>

                {/* Whole mascot shakes */}
                <motion.g
                    filter="url(#crayon-panic)"
                    animate={{ x: [-2, 2, -2, 2, 0], rotate: [-2, 2, -2, 2, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
                >
                    {/* HEAD — round, no hat this time, different character */}
                    <circle cx="100" cy="62" r="34" fill="#fca5a5" stroke="black" strokeWidth="2.5" />

                    {/* Hair (messy/panicked) */}
                    <motion.g
                        animate={{ rotate: [-3, 3, -3] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                        style={{ transformOrigin: "100px 40px" }}
                    >
                        <path d="M 76 48 Q 80 24 90 36" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M 90 42 Q 95 20 100 34" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M 100 40 Q 108 18 110 36" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M 112 44 Q 120 26 124 48" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </motion.g>

                    {/* Eyes — WIDE open, panicked */}
                    <g transform="translate(100, 58)">
                        {/* Left eye — huge */}
                        <g transform="translate(-14, 0)">
                            <motion.circle r="12" fill="white" stroke="black" strokeWidth="2.5"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            />
                            <motion.circle r="6" fill="black"
                                animate={{ y: [-2, 2, -2], x: [-1, 1, -1] }}
                                transition={{ duration: 0.3, repeat: Infinity }}
                            />
                            {/* Pupil highlight */}
                            <circle cx="-2" cy="-3" r="2" fill="white" />
                        </g>
                        {/* Right eye — huge */}
                        <g transform="translate(14, 0)">
                            <motion.circle r="12" fill="white" stroke="black" strokeWidth="2.5"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                            />
                            <motion.circle r="6" fill="black"
                                animate={{ y: [-2, 2, -2], x: [-1, 1, -1] }}
                                transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
                            />
                            <circle cx="-2" cy="-3" r="2" fill="white" />
                        </g>
                    </g>

                    {/* Mouth — open wide in shock */}
                    <motion.ellipse
                        cx="100" cy="82" rx="10" ry="8"
                        fill="#1a1a1a" stroke="black" strokeWidth="2"
                        animate={{ ry: [6, 10, 6] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                    />

                    {/* Sweat drops */}
                    <motion.g
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <ellipse cx="68" cy="54" rx="3" ry="5" fill="#93c5fd" stroke="black" strokeWidth="1" />
                    </motion.g>
                    <motion.g
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    >
                        <ellipse cx="136" cy="50" rx="2.5" ry="4" fill="#93c5fd" stroke="black" strokeWidth="1" />
                    </motion.g>

                    {/* Body */}
                    <path d="M 86 96 L 86 108" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 114 96 L 114 108" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="76" y="108" width="48" height="32" rx="6" fill="#fca5a5" stroke="black" strokeWidth="2.5" strokeLinejoin="round" />

                    {/* Arms — raised up in panic */}
                    <motion.path
                        d="M 76 116 Q 50 90 44 70"
                        stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        animate={{ d: ["M 76 116 Q 50 90 44 70", "M 76 116 Q 48 86 40 66", "M 76 116 Q 50 90 44 70"] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                    />
                    {/* Left hand */}
                    <motion.circle cx="44" cy="68" r="6" fill="#fca5a5" stroke="black" strokeWidth="2"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                    />

                    <motion.path
                        d="M 124 116 Q 150 90 156 70"
                        stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        animate={{ d: ["M 124 116 Q 150 90 156 70", "M 124 116 Q 152 86 160 66", "M 124 116 Q 150 90 156 70"] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: 0.15 }}
                    />
                    {/* Right hand */}
                    <motion.circle cx="156" cy="68" r="6" fill="#fca5a5" stroke="black" strokeWidth="2"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: 0.15 }}
                    />

                    {/* Feet */}
                    <ellipse cx="88" cy="142" rx="10" ry="4" fill="#fca5a5" stroke="black" strokeWidth="2" />
                    <ellipse cx="112" cy="142" rx="10" ry="4" fill="#fca5a5" stroke="black" strokeWidth="2" />
                </motion.g>

                {/* Floating exclamation marks */}
                <motion.text x="24" y="44" fontSize="20" fill="#ef4444" fontWeight="bold"
                    animate={{ y: [44, 30, 44], opacity: [0.3, 1, 0.3], rotate: [-10, 10, -10] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >!</motion.text>
                <motion.text x="170" y="38" fontSize="16" fill="#ef4444" fontWeight="bold"
                    animate={{ y: [38, 26, 38], opacity: [0.2, 0.9, 0.2], rotate: [10, -10, 10] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: 0.3 }}
                >!</motion.text>
                <motion.text x="46" y="170" fontSize="14" fill="#f97316" fontWeight="bold"
                    animate={{ y: [170, 160, 170], opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: 0.6 }}
                >!?</motion.text>
            </svg>
        </motion.div>
    );
}
