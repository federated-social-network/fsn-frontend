import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { searchUsers, initiateConnection, removeConnection } from "../api/api";
import { FiSearch, FiUserPlus, FiUserX, FiClock, FiAlertCircle } from "react-icons/fi";

type ConnectionStatus = "none" | "connected" | "pending" | "self";

interface SearchResult {
    id: string;
    username: string;
    email: string;
    status: ConnectionStatus;
}

export default function SearchMobilePage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleConnect = async (user: SearchResult) => {
        setActionLoading(user.username);
        try {
            await initiateConnection(user.username);
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
        <div className="min-h-screen bg-[var(--paper-white)] pb-20">
            {/* Header */}
            <div className="bg-[var(--pastel-yellow)] px-4 py-3 border-b-2 border-black sticky top-0 z-10">
                <h2 className="font-sketch text-lg flex items-center gap-2 text-black">
                    <FiSearch className="text-lg" /> Find Friends
                </h2>
            </div>

            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <FiSearch className="text-lg" />
                    </div>
                    <input
                        type="text"
                        placeholder="Type a username..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-white border-2 border-black rounded-lg font-hand text-lg focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400 text-black shadow-sm"
                        style={{ fontSize: '16px' }}
                        autoFocus
                    />
                </div>

                {/* Results */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                            <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                            <span className="font-hand text-lg">Searching the sketchpad...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[var(--pastel-pink)] gap-2">
                            <FiAlertCircle className="text-3xl text-red-500" />
                            <span className="font-hand text-lg text-red-600 text-center">{error}</span>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((user) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full p-3 border-2 border-black/5 hover:border-black active:border-black rounded-xl bg-white flex items-center gap-2 relative group transition-all hover:shadow-md"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-[var(--pastel-mint)] border border-black flex items-center justify-center font-sketch text-base shrink-0 text-black shadow-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/profile/${user.username}`}
                                        className="block"
                                    >
                                        <h3 className="font-bold font-hand text-base truncate text-black leading-none mb-1 group-hover:underline decoration-2 decoration-[var(--pastel-blue)]">
                                            {user.username}
                                        </h3>
                                    </Link>
                                    <p className="text-[10px] font-hand text-gray-500 truncate font-bold">
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
                        ))
                    ) : query ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                            <FiAlertCircle className="text-3xl opacity-20" />
                            <span className="font-hand text-xl opacity-50">No sketches found.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
                            <div className="w-16 h-16 rounded-full bg-white border-2 border-black/10 flex items-center justify-center mb-1">
                                <FiSearch className="text-3xl text-gray-300" />
                            </div>
                            <p className="font-hand text-center text-lg text-gray-500">Search for fellow<br />sketchers...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
