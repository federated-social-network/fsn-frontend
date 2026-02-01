import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface MascotProps {
    isPasswordFocused: boolean;
    showPassword?: boolean;
}

// Shared Spring Config - softer for smoother feel
const springConfig = { damping: 25, stiffness: 120, mass: 0.8 };

export default function Mascot({ isPasswordFocused, showPassword = false }: MascotProps) {
    // Use MotionValues for eye tracking
    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);

    const eyeX = useSpring(targetX, springConfig);
    const eyeY = useSpring(targetY, springConfig);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;

            const maxMove = 12;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // Smooth clamping
            const factor = Math.min(distance / 25, maxMove) / (distance || 1);

            const moveX = dx * factor;
            const moveY = dy * factor;

            targetX.set(moveX);
            targetY.set(moveY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animation Variants - minimal and clean
    const createFloatVariant = (delay: number): Variants => ({
        animate: {
            y: [0, -6, 0],
            rotate: [0, 0.5, -0.5, 0],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
            }
        },
        scared: {
            y: 5,
            scale: 0.98,
            transition: { type: "spring", bounce: 0.4 }
        },
        hover: {
            scale: 1.02,
            y: -8,
            rotate: 0,
            transition: { type: "spring", stiffness: 300, damping: 15 }
        },
        tap: {
            scale: 0.97,
            y: 2,
            transition: { type: "spring", stiffness: 400, damping: 15 }
        }
    });

    return (
        <div ref={ref} className="w-full max-w-[500px] mx-auto aspect-[4/3] relative">
            <svg viewBox="0 0 400 300" width="100%" height="100%">

                {/* 1. Purple Block (Tallest, Back Left) */}
                <motion.g
                    transform="translate(130, 40)"
                    variants={createFloatVariant(0)}
                    animate={isPasswordFocused ? "scared" : "animate"}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <rect x="0" y="0" width="90" height="260" fill="#6200ea" rx="4" />
                    {/* Shadow/Depth Overlay */}
                    <rect x="0" y="0" width="90" height="260" fill="black" fillOpacity="0.1" rx="4" style={{ mixBlendMode: 'multiply' }} clipPath="inset(0 0 40% 40%)" />

                    <WhiteEye cx={45} cy={40} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={0} />
                    <WhiteEye cx={70} cy={40} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={0.2} />

                    <rect x="58" y="30" width="4" height="30" fill="black" rx="1" />
                </motion.g>

                {/* 2. Black Block (Middle Right) */}
                <motion.g
                    transform="translate(200, 130)"
                    variants={createFloatVariant(1.2)}
                    animate={isPasswordFocused ? "scared" : "animate"}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <rect x="0" y="0" width="70" height="170" fill="#1a1a1a" rx="4" />

                    <WhiteEye cx={35} cy={30} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={0.5} />
                    <WhiteEye cx={55} cy={30} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={0.7} />
                </motion.g>

                {/* 3. Orange Blob (Front Left) */}
                <motion.g
                    transform="translate(70, 200)"
                    variants={createFloatVariant(0.8)}
                    animate={isPasswordFocused ? "scared" : "animate"}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <path d="M 0 100 C 0 10 150 10 150 100" fill="#ff6d00" />
                    <rect x="0" y="100" width="150" height="20" fill="#ff6d00" />

                    <DotEye cx={45} cy={70} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={1} />
                    <DotEye cx={105} cy={70} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={1.2} />

                    {/* Simple geometric decoration instead of dynamic mouth */}
                    <path d="M 65 90 A 10 10 0 0 0 85 90 Z" fill="#1a1a1a" transform="rotate(10, 75, 90)" />
                </motion.g>

                {/* 4. Yellow Arch (Front Right) */}
                <motion.g
                    transform="translate(240, 180)"
                    variants={createFloatVariant(2.0)}
                    animate={isPasswordFocused ? "scared" : "animate"}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <path d="M 0 60 A 32 32 0 0 1 64 60 L 64 140 L 0 140 Z" fill="#ffd600" />
                    <rect x="0" y="60" width="64" height="80" fill="#ffd600" />

                    <DotEye cx={25} cy={45} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} showPassword={showPassword} delay={1.5} />

                    <rect x="35" y="60" width="40" height="4" fill="black" rx="1" />
                </motion.g>

            </svg>
        </div>
    );
}

// Sub-components
interface EyeProps {
    cx: number;
    cy: number;
    eyeX: MotionValue<number>;
    eyeY: MotionValue<number>;
    isPasswordFocused: boolean;
    showPassword: boolean;
    delay?: number;
}

const useBlink = (delay: number = 0) => {
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const blink = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200); // slightly longer blink
            const nextBlink = Math.random() * 5000 + 3000; // Less frequent
            timeout = setTimeout(blink, nextBlink);
        };
        const initial = setTimeout(blink, delay * 1000 + 1000);
        return () => {
            clearTimeout(timeout);
            clearTimeout(initial);
        };
    }, [delay]);
    return isBlinking;
};

const WhiteEye = ({ cx, cy, eyeX, eyeY, isPasswordFocused, showPassword, delay }: EyeProps) => {
    const x = useTransform(eyeX, (v) => v * 0.8);
    const y = useTransform(eyeY, (v) => v * 0.8);

    const isBlinking = useBlink(delay);
    const isClosed = (isPasswordFocused && !showPassword) || isBlinking;
    const isPeeking = isPasswordFocused && showPassword;

    return (
        <g>
            <circle cx={cx} cy={cy} r="6" fill="white" />
            <motion.circle
                cx={cx} cy={cy} r="2.5" fill="black"
                style={{ x, y }}
                initial={false}
                animate={isClosed ? { scaleY: 0.1, opacity: 0 } : (isPeeking ? { scale: 1.3, opacity: 1 } : { scale: 1, opacity: 1 })}
                transition={{ duration: 0.1 }}
            />
            <motion.path
                d={`M ${cx - 6} ${cy} Q ${cx} ${cy + 4} ${cx + 6} ${cy}`}
                stroke="black" strokeWidth="2" fill="none"
                initial={{ opacity: 0 }}
                animate={isClosed ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.1 }}
            />
        </g>
    );
};

const DotEye = ({ cx, cy, eyeX, eyeY, isPasswordFocused, showPassword, delay }: EyeProps) => {
    const x = useTransform(eyeX, (v) => v * 0.5);
    const y = useTransform(eyeY, (v) => v * 0.5);

    const isBlinking = useBlink(delay);
    const isClosed = (isPasswordFocused && !showPassword) || isBlinking;
    const isPeeking = isPasswordFocused && showPassword;

    return (
        <g>
            <motion.circle
                cx={cx} cy={cy} r="3.5" fill="black"
                style={{ x, y }}
                initial={false}
                animate={isClosed ? { scaleY: 0.1 } : (isPeeking ? { scale: 1.5, scaleY: 1 } : { scale: 1, scaleY: 1 })}
                transition={{ duration: 0.1 }}
            />
        </g>
    );
};
