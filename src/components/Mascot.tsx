import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MascotProps {
    isPasswordFocused: boolean;
    showPassword?: boolean;
}




export default function Mascot({ isPasswordFocused, showPassword = false }: MascotProps) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Faster eye movement configuration
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };

    const eyeX = useSpring(mouseX, springConfig);
    const eyeY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Limit movement range for eyes
            const limit = 15; // Increased limit slightly
            let dx = e.clientX - centerX;
            let dy = e.clientY - centerY;

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) { // Avoid divide by zero

                const finalLimit = limit * (Math.min(dist, 300) / 300); // Scale based on distance

                mouseX.set(dx * (finalLimit / (dist || 1)));
                mouseY.set(dy * (finalLimit / (dist || 1)));
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={ref} className="w-full max-w-[400px] mx-auto aspect-square relative select-none pointer-events-none">
            <svg viewBox="0 0 400 400" width="100%" height="100%" className="overflow-visible">
                {/* 
                   Sketch Filter: Creates the wobbly hand-drawn line effect.
                   We apply this to the groups.
                */}
                <defs>
                    <filter id="crayon">
                        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
                    </filter>
                </defs>

                {/* 
                    Robot Character Group 
                    Apply filter url(#crayon) for the wax crayon look
                */}
                <motion.g
                    filter="url(#crayon)"
                    initial={{ y: 0 }}
                    animate={{
                        y: [0, -5, 0],
                        rotate: [0, 1, -1, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* ANTENNA */}
                    <g transform="translate(200, 120)">
                        <motion.path
                            d="M 0 0 Q -10 -20 0 -40"
                            stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <circle cx="0" cy="-45" r="8" fill="#ef4444" stroke="black" strokeWidth="4" />
                    </g>

                    {/* HEAD */}
                    <rect x="120" y="120" width="160" height="140" rx="20" fill="#a5b4fc" stroke="black" strokeWidth="5" strokeLinejoin="round" />

                    {/* FACE AREA */}
                    {/* Eyes Container */}
                    <g transform="translate(200, 180)">

                        {/* Left Eye */}
                        <g transform="translate(-40, 0)">
                            <circle r="25" fill="white" stroke="black" strokeWidth="4" />
                            <Pupil eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} />
                            {/* Eyelid (Checking/Hiding) */}
                            <Eyelid isPasswordFocused={isPasswordFocused} showPassword={showPassword} />
                        </g>

                        {/* Right Eye */}
                        <g transform="translate(40, 0)">
                            <circle r="25" fill="white" stroke="black" strokeWidth="4" />
                            <Pupil eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} />
                            <Eyelid isPasswordFocused={isPasswordFocused} showPassword={showPassword} />
                        </g>

                    </g>

                    {/* MOUTH */}
                    <Mouth isPasswordFocused={isPasswordFocused} showPassword={showPassword} />


                    {/* BODY / NECK */}
                    <path d="M 170 260 L 170 300" stroke="black" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 230 260 L 230 300" stroke="black" strokeWidth="5" strokeLinecap="round" />
                    <rect x="140" y="300" width="120" height="80" rx="10" fill="#a5b4fc" stroke="black" strokeWidth="5" strokeLinejoin="round" />

                    {/* ARMS (Hands covering eyes when password focused?) */}
                    <Hands isPasswordFocused={isPasswordFocused} showPassword={showPassword} />

                </motion.g>
            </svg>
        </div>
    );
}

// --- Sub Components ---

const Mouth = ({ isPasswordFocused, showPassword }: any) => {
    // Idle animation for mouth to make it feel alive
    const [isBreathing, setIsBreathing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsBreathing(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Let's use simple variants for states
    const variants = {
        idle: { d: "M 170 230 Q 200 245 230 230" },
        idleBreath: { d: "M 170 230 Q 200 242 230 230" }, // Slightly flatter/different
        happy: { d: "M 170 230 Q 200 255 230 230" }, // Bigger smile
        flat: { d: "M 175 235 Q 200 235 225 235" },   // Straight/Nervous
        o: { d: "M 185 230 Q 200 220 215 230 Q 200 250 185 230" } // O shape (surprised)
    };

    let state = isBreathing ? "idleBreath" : "idle";
    if (isPasswordFocused && !showPassword) state = "flat";
    else if (isPasswordFocused && showPassword) state = "happy";

    return (
        <motion.path
            stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9"
            variants={variants}
            animate={state}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
    );
};

const Pupil = ({ eyeX, eyeY, isPasswordFocused, showPassword }: any) => {
    const x = useTransform(eyeX, (v: number) => v * 0.8); // Increased movement multiplier
    const y = useTransform(eyeY, (v: number) => v * 0.8);

    return (
        <motion.circle
            r="8"
            fill="black"
            style={{ x, y }}
            animate={
                isPasswordFocused && !showPassword
                    ? { scale: 0.5, opacity: 0.5 } // Dilate/fade when hiding
                    : { scale: 1, opacity: 1 }
            }
        />
    );
};

const Eyelid = ({ isPasswordFocused, showPassword }: any) => {
    // When password focused (and not shown), eyes close/squint
    // Represented by a path that clips or covers
    // For simplicity in "sketch" style, we draw a line or fill

    return (
        <>
            {/* Squint / Hide Expression */}
            <motion.path
                d="M -25 -5 Q 0 -15 25 -5"
                stroke="black" strokeWidth="4" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                    (isPasswordFocused && !showPassword)
                        ? { pathLength: 1, opacity: 1, y: 10 } // Eyes closed tight
                        : { pathLength: 0, opacity: 0 }
                }
            />

            {/* "Peeking" Expression (Show Password) */}
            <motion.circle
                r="30" fill="none" stroke="black" strokeWidth="3" strokeDasharray="4 4"
                initial={{ scale: 1, opacity: 0 }}
                animate={
                    (isPasswordFocused && showPassword)
                        ? { opacity: 1, rotate: 180 }
                        : { opacity: 0 }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
        </>
    );
};

const Hands = ({ isPasswordFocused, showPassword }: any) => {
    // Hands come up to cover eyes when password is focused (and hidden)
    // Arms start from body (y=300) and move up to face (y=180)

    // Left Arm
    const leftArmVariants = {
        rest: { d: "M 140 310 Q 100 340 100 300" }, // Down by side
        covering: { d: "M 140 310 Q 100 200 160 180" } // Up covering left eye
    };

    // Right Arm
    const rightArmVariants = {
        rest: { d: "M 260 310 Q 300 340 300 300" }, // Down by side
        covering: { d: "M 260 310 Q 300 200 240 180" } // Up covering right eye
    };

    const state = (isPasswordFocused && !showPassword) ? "covering" : "rest";

    return (
        <g stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
                variants={leftArmVariants}
                animate={state}
                transition={{ type: "spring", stiffness: 60 }}
            />
            {state === "covering" && (
                <motion.circle cx="160" cy="180" r="15" fill="#a5b4fc" stroke="black" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            )}


            <motion.path
                variants={rightArmVariants}
                animate={state}
                transition={{ type: "spring", stiffness: 60 }}
            />
            {state === "covering" && (
                <motion.circle cx="240" cy="180" r="15" fill="#a5b4fc" stroke="black" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            )}
        </g>
    );
};
