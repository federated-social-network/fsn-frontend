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
    icon?: string; // Emoji or simple text icon
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "bg-black",
    icon = "⚠️"
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
                        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative z-10 w-full max-w-sm"
                    >
                        <SketchCard variant="paper" className="p-6 bg-white shadow-2xl border-2 border-black">
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-2">{icon}</div>
                                <h3 className="font-sketch text-2xl font-bold mb-2 leading-tight">{title}</h3>
                                <p className="font-hand text-lg text-gray-600 leading-snug">{message}</p>
                            </div>

                            <div className="flex gap-3 justify-center mt-6">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 font-bold font-hand rounded-full border-2 border-transparent hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`px-6 py-2 font-bold font-sketch text-white rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black hover:-translate-y-0.5 active:translate-y-0 transition-transform ${confirmColor}`}
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
