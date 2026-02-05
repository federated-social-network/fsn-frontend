import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { searchUsers, initiateConnection, removeConnection } from "../api/api";
import SketchCard from "./SketchCard";
import { FiSearch, FiX, FiUserPlus, FiUserX, FiClock, FiAlertCircle } from "react-icons/fi";

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ConnectionStatus = "none" | "connected" | "pending" | "self";

interface SearchResult {
    id: string;
    username: string;
    email: string;
    status: ConnectionStatus;
}

export default function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // username of user currently being acted upon

    const [error, setError] = useState<string | null>(null);

    // Clear state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setResults([]);
            setError(null);
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await searchUsers(query.trim());
                if (Array.isArray(res.data)) {
                    setResults(res.data);
                } else {
                    console.error("Unexpected response format:", res.data);
                    setResults([]);
                    setError("Invalid response from server");
                }
            } catch (err: any) {
                console.error("Search failed", err);
                setResults([]);
                const msg = err.response?.data?.detail || "Failed to search users";
                setError(msg);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleConnect = async (user: SearchResult) => {
        setActionLoading(user.username);
        try {
            await initiateConnection(user.username);
            // Update local state to reflect change
            setResults(prev => prev.map(u =>
                u.username === user.username ? { ...u, status: "pending" } : u
            ));
        } catch (err: any) {
            if (err.response?.data?.detail === "Request already sent") {
                setResults(prev => prev.map(u =>
                    u.username === user.username ? { ...u, status: "pending" } : u
                ));
            } else if (err.response?.data?.detail === "You cannot connect to yourself") {
                setResults(prev => prev.map(u =>
                    u.username === user.username ? { ...u, status: "self" } : u
                ));
            } else {
                console.error("Connect failed", err);
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnfriend = async (user: SearchResult) => {
        if (!window.confirm(`Are you sure you want to disconnect from ${user.username}?`)) return;

        setActionLoading(user.username);
        try {
            await removeConnection(user.username);
            // Update local state
            setResults(prev => prev.map(u =>
                u.username === user.username ? { ...u, status: "none" } : u
            ));
        } catch (err) {
            console.error("Unfriend failed", err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-md z-10"
                    >
                        {/* Theme: Sketch/Pastel - Matching Dashboard */}
                        <SketchCard variant="paper" className="bg-[var(--paper-white)] p-0 overflow-hidden shadow-2xl border-2 border-black max-h-[80vh] flex flex-col">
                            {/* Header */}
                            <div className="bg-[var(--pastel-yellow)] px-4 py-3 border-b-2 border-black flex justify-between items-center shrink-0">
                                <h2 className="font-sketch text-xl flex items-center gap-2 text-black">
                                    <FiSearch className="text-xl" /> Find Friends
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full border border-black/20 hover:bg-black hover:text-white flex items-center justify-center transition-colors text-black"
                                >
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            <div className="p-5 space-y-5 flex flex-col min-h-0 bg-white/50">
                                {/* Search Bar */}
                                <div className="relative shrink-0">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                                        <FiSearch className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type a username..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-black rounded-lg font-hand text-xl focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400 text-black shadow-sm"
                                        autoFocus
                                    />
                                </div>

                                {/* Results List */}
                                <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[350px] -mx-2 px-2 custom-scrollbar">
                                    {loading ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                            <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                                            <span className="font-hand text-lg">Searching the sketchpad...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="h-full flex flex-col items-center justify-center text-[var(--pastel-pink)] gap-2">
                                            <FiAlertCircle className="text-3xl text-red-500" />
                                            <span className="font-hand text-lg text-red-600 text-center">{error}</span>
                                        </div>
                                    ) : results.length > 0 ? (
                                        <div className="space-y-3 pb-2">
                                            {results.map((user) => (
                                                <motion.div
                                                    key={user.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="w-full p-3 border-2 border-black/5 hover:border-black rounded-xl bg-white flex items-center gap-3 relative group transition-all hover:shadow-md"
                                                >
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-[var(--pastel-mint)] border border-black flex items-center justify-center font-sketch text-lg shrink-0 text-black shadow-sm">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            to={`/profile/${user.username}`}
                                                            onClick={onClose}
                                                            className="block"
                                                        >
                                                            <h3 className="font-bold font-hand text-xl truncate text-black leading-none mb-1 group-hover:underline decoration-2 decoration-[var(--pastel-blue)]">
                                                                {user.username}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-xs font-hand text-gray-500 truncate font-bold">
                                                            {user.email}
                                                        </p>
                                                    </div>

                                                    <div className="shrink-0">
                                                        {user.status === 'connected' ? (
                                                            <button
                                                                onClick={() => handleUnfriend(user)}
                                                                disabled={actionLoading === user.username}
                                                                title="Disconnect"
                                                                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-transparent hover:border-black hover:bg-[var(--pastel-pink)] transition-all outline-none text-gray-400 hover:text-black"
                                                            >
                                                                <FiUserX className="text-xl" />
                                                            </button>
                                                        ) : user.status === 'pending' ? (
                                                            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg border border-black/20 text-xs font-bold font-hand text-gray-600">
                                                                <FiClock /> Pending
                                                            </div>
                                                        ) : user.status === 'self' ? (
                                                            <span className="text-sm font-bold text-gray-400 font-sketch px-2">YOU</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleConnect(user)}
                                                                disabled={actionLoading === user.username}
                                                                title="Connect"
                                                                className="bg-[var(--ink-blue)] hover:bg-black text-white px-3 py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 text-sm font-bold font-hand border border-black"
                                                            >
                                                                <FiUserPlus className="text-lg" />
                                                                <span className="hidden sm:inline">Connect</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : query ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <FiAlertCircle className="text-3xl opacity-20" />
                                            <span className="font-hand text-xl opacity-50">No sketches found.</span>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                            <div className="w-20 h-20 rounded-full bg-white border-2 border-black/10 flex items-center justify-center mb-1">
                                                <span className="text-4xl">🔍</span>
                                            </div>
                                            <p className="font-hand text-center text-xl text-gray-500">Search for fellow<br />sketchers...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SketchCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
