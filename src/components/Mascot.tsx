import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

interface MascotProps {
    isPasswordFocused: boolean;
}

// Shared Spring Config
const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };

export default function Mascot({ isPasswordFocused }: MascotProps) {
    // Use MotionValues instead of State for high-performance animation
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

            const maxMove = 8;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const factor = Math.min(distance / 20, maxMove) / (distance || 1);

            const moveX = dx * factor;
            const moveY = dy * factor;

            targetX.set(moveX);
            targetY.set(moveY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={ref} style={{ width: '100%', maxWidth: '500px', margin: '0 auto', aspectRatio: '4/3', position: 'relative' }}>
            <svg viewBox="0 0 400 300" width="100%" height="100%">

                {/* 1. Purple Block (Tallest, Back Left) */}
                <g transform="translate(130, 40)">
                    <rect x="0" y="0" width="90" height="260" fill="#6200ea" />
                    <WhiteEye cx={45} cy={40} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />
                    <WhiteEye cx={70} cy={40} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />
                    <rect x="58" y="30" width="4" height="30" fill="black" />
                </g>

                {/* 2. Black Block (Middle Right) */}
                <g transform="translate(200, 130)">
                    <rect x="0" y="0" width="70" height="170" fill="#1a1a1a" />
                    <WhiteEye cx={35} cy={30} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />
                    <WhiteEye cx={55} cy={30} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />
                </g>

                {/* 3. Orange Blob (Front Left) */}
                <g transform="translate(70, 200)">
                    <path d="M 0 100 C 0 10 150 10 150 100" fill="#ff6d00" />
                    <rect x="0" y="100" width="150" height="20" fill="#ff6d00" />

                    <DotEye cx={45} cy={70} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />
                    <DotEye cx={105} cy={70} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />

                    <path d="M 65 90 A 10 10 0 0 0 85 90 Z" fill="#1a1a1a" transform="rotate(10, 75, 90)" />
                </g>

                {/* 4. Yellow Arch (Front Right) */}
                <g transform="translate(240, 180)">
                    <path d="M 0 60 A 32 32 0 0 1 64 60 L 64 140 L 0 140 Z" fill="#ffd600" />
                    <rect x="0" y="60" width="64" height="80" fill="#ffd600" />

                    <DotEye cx={25} cy={45} eyeX={eyeX} eyeY={eyeY} isPasswordFocused={isPasswordFocused} />
                    <rect x="35" y="60" width="40" height="4" fill="black" />
                </g>

            </svg>
        </div>
    );
}

// Sub-components moved outside to prevent re-creation on render
interface EyeProps {
    cx: number;
    cy: number;
    eyeX: MotionValue<number>;
    eyeY: MotionValue<number>;
    isPasswordFocused: boolean;
}

const WhiteEye = ({ cx, cy, eyeX, eyeY, isPasswordFocused }: EyeProps) => {
    const x = useTransform(eyeX, (v) => v * 0.8);
    const y = useTransform(eyeY, (v) => v * 0.8);

    return (
        <g>
            <circle cx={cx} cy={cy} r="6" fill="white" />
            <motion.circle
                cx={cx} cy={cy} r="2.5" fill="black"
                style={{ x, y }}
                initial={false}
                animate={isPasswordFocused ? { scale: 0.1, opacity: 0 } : { scale: 1, opacity: 1 }}
            />
            <motion.path
                d={`M ${cx - 6} ${cy} Q ${cx} ${cy + 4} ${cx + 6} ${cy}`}
                stroke="black" strokeWidth="2" fill="none"
                initial={{ opacity: 0 }}
                animate={isPasswordFocused ? { opacity: 1 } : { opacity: 0 }}
            />
        </g>
    );
};

const DotEye = ({ cx, cy, eyeX, eyeY, isPasswordFocused }: EyeProps) => {
    const x = useTransform(eyeX, (v) => v * 0.5);
    const y = useTransform(eyeY, (v) => v * 0.5);

    return (
        <g>
            <motion.circle
                cx={cx} cy={cy} r="3.5" fill="black"
                style={{ x, y }}
                initial={false}
                animate={isPasswordFocused ? { scaleY: 0.1 } : { scaleY: 1 }}
            />
        </g>
    );
};
