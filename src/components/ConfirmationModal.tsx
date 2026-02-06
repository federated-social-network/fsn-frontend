import { motion, AnimatePresence } from "framer-motion";
import SketchCard from "./SketchCard";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string; // e.g. "bg-red-500" or "bg-black"
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "bg-black"
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
                        className="relative z-10 w-full max-w-sm"
                    >
                        <SketchCard variant="sticky" className="max-w-md w-full p-4 sm:p-6 text-center border-2 border-red-500 shadow-xl bg-[#fffec8] mx-2">
                            <h3 className="font-sketch text-2xl sm:text-3xl font-bold text-red-600 mb-3 sm:mb-4">{title}</h3>
                            <div className="font-hand text-lg sm:text-xl mb-6 sm:mb-8 text-[var(--ink-secondary)]">
                                {message}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 font-heading">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 sm:py-2 bg-white border-2 border-[var(--ink-secondary)] text-[var(--ink-secondary)] rounded shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-px active:translate-y-px transition-all text-sm sm:text-base order-2 sm:order-1"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`px-6 py-2.5 sm:py-2 border-2 border-black text-white rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px active:translate-y-px transition-all text-sm sm:text-base order-1 sm:order-2 ${confirmColor}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </SketchCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
