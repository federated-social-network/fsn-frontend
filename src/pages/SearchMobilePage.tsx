import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { searchUsers, initiateConnection, removeConnection, getRandomUsers, getPendingConnections, acceptConnection } from "../api/api";
import { FiSearch, FiUserPlus, FiUserX, FiClock, FiAlertCircle, FiCheck } from "react-icons/fi";

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

    // Discover Users state
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Pending Invites state
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());
    const [loadingInvites, setLoadingInvites] = useState(true);

    // Fetch suggested users and pending invites on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersRes, invitesRes] = await Promise.all([
                    getRandomUsers(),
                    getPendingConnections()
                ]);

                const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);
                const mappedUsers = usersData.map((u: any) => ({
                    username: u.username || u,
                    instance: u.instance || 'local',
                    avatar_url: u.avatar_url || null
                }));
                setSuggestedUsers(mappedUsers);
                setPendingInvites(Array.isArray(invitesRes.data) ? invitesRes.data : []);
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoadingUsers(false);
                setLoadingInvites(false);
            }
        };
        loadData();
    }, []);

    // Search debounce
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

    const handleDiscoverConnect = async (e: React.MouseEvent, targetUsername: string) => {
        e.preventDefault();
        e.stopPropagation();

        setSentRequests(prev => {
            const next = new Set(prev);
            next.add(targetUsername);
            return next;
        });

        try {
            await initiateConnection(targetUsername);
        } catch (err) {
            console.error("Failed to connect", err);
            setSentRequests(prev => {
                const next = new Set(prev);
                next.delete(targetUsername);
                return next;
            });
        }
    };

    const handleAccept = async (connectionId: string) => {
        setAcceptingIds(prev => new Set(prev).add(connectionId));
        try {
            await acceptConnection(connectionId);
            setPendingInvites(prev => prev.filter(i => i.connection_id !== connectionId));
        } catch (err) {
            console.error("Failed to accept", err);
        } finally {
            setAcceptingIds(prev => {
                const next = new Set(prev);
                next.delete(connectionId);
                return next;
            });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--paper-white)] pb-20">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[var(--pastel-yellow)] sticky top-0 z-10">
                <button
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full hover:bg-black/5 active:bg-black/10 flex items-center justify-center text-gray-800 transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <h1 className="text-base font-bold text-black absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 font-sketch">
                    <FiSearch className="text-lg" /> Search
                </h1>

                <div className="w-10 h-10" />
            </div>

            <div className="p-4 space-y-5">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <FiSearch className="text-lg" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pr-3 py-3 bg-white border-2 border-black rounded-lg font-hand text-lg focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400 text-black shadow-sm"
                        style={{ fontSize: '16px', paddingLeft: '44px' }}
                        autoFocus
                    />
                </div>

                {/* Search Results — only shown when there's a query */}
                {query.trim() && (
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                                <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                                <span className="font-hand text-lg">Searching...</span>
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
                                    <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#7c3aed,#0891b2)] p-[2px] shadow-sm shrink-0">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-sketch text-base text-black overflow-hidden">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
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
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                                <FiAlertCircle className="text-3xl opacity-20" />
                                <span className="font-hand text-xl opacity-50">No users found.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Default view when no search query */}
                {!query.trim() && (
                    <>
                        {/* Pending Invites Section */}
                        <div className="rounded-xl border-2 border-black overflow-hidden bg-[var(--pastel-pink)]">
                            <div className="px-4 pt-4 pb-3 border-b-2 border-black/10">
                                <h3 className="font-sketch text-lg text-gray-900">Pending Invites</h3>
                            </div>
                            <div className="p-3 space-y-2">
                                {loadingInvites ? (
                                    <div className="text-center font-hand opacity-50 py-3">Checking...</div>
                                ) : pendingInvites.length > 0 ? (
                                    pendingInvites.map((invite: any) => (
                                        <div key={invite.connection_id} className="bg-white/80 p-3 rounded-lg border border-black/10 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#7c3aed,#0891b2)] p-[2px] shrink-0">
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-sketch text-base text-black">
                                                        {(invite.from_username || "?")[0].toUpperCase()}
                                                    </div>
                                                </div>
                                                <span className="font-hand text-sm font-bold truncate text-gray-800">
                                                    {invite.from_username || "Unknown"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleAccept(invite.connection_id)}
                                                disabled={acceptingIds.has(invite.connection_id)}
                                                className={`px-3 py-1.5 rounded-md font-bold text-sm transition-all flex items-center gap-1 shrink-0 ${acceptingIds.has(invite.connection_id)
                                                    ? 'bg-green-200 text-green-600 cursor-wait shadow-none'
                                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none'
                                                    }`}
                                            >
                                                {acceptingIds.has(invite.connection_id) ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <><FiCheck /> Accept</>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 font-hand opacity-60 italic text-sm">
                                        No pending invites.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Discover Users Section */}
                        <div className="rounded-xl border-2 border-black overflow-hidden bg-[var(--pastel-blue)]">
                            <div className="px-4 pt-4 pb-3 border-b-2 border-black/10">
                                <h3 className="font-sketch text-lg text-gray-900">Discover People</h3>
                            </div>
                            <div className="p-3 space-y-2">
                                {loadingUsers ? (
                                    <div className="text-center font-hand opacity-50 py-3">Looking around...</div>
                                ) : suggestedUsers.length > 0 ? (
                                    suggestedUsers.map((u: any) => (
                                        <Link key={u.username} to={`/profile/${u.username}`} className="block border-none">
                                            <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg hover:bg-white transition-colors border border-black/5 shadow-sm">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-[var(--pastel-yellow)] border border-black flex items-center justify-center font-sketch text-base shrink-0 overflow-hidden">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.username[0].toUpperCase()
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="overflow-hidden flex-1 min-w-0">
                                                    <div className="font-bold font-hand truncate text-sm leading-tight text-gray-800">
                                                        {u.username}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 truncate mt-0.5 font-hand">
                                                        {u.instance || 'local'}
                                                    </div>
                                                </div>

                                                {/* Connect Button */}
                                                <div className="shrink-0">
                                                    {sentRequests.has(u.username) ? (
                                                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-300 flex items-center gap-1 font-hand">
                                                            <FiCheck className="text-xs" /> Sent
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => handleDiscoverConnect(e, u.username)}
                                                            className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-800 text-white hover:bg-blue-900 active:scale-95 transition-all border-none font-hand shadow-sm"
                                                        >
                                                            Connect+
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-4 font-hand opacity-60 italic text-sm">
                                        No users found right now.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
