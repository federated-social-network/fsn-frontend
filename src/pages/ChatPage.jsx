import { useState, useEffect, useRef, useCallback } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Read the API base URL from localStorage (set on the landing/login page). */
function getApiBase() {
    return localStorage.getItem("INSTANCE_BASE_URL") || "http://localhost:8000";
}

/** Derive ws:// or wss:// URL from the HTTP base, stripping /api/v* suffix. */
function getWsBase() {
    const base = getApiBase();
    return base.replace(/^http/, "ws").replace(/\/api\/v[0-9]+$/, "");
}

/** Read the JWT token from the auth_token cookie. */
function getAuthToken() {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function relativeTime(dateStr) {
    try {
        const diff = Date.now() - new Date(dateStr).getTime();
        if (diff < 60_000) return "just now";
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    } catch {
        return "";
    }
}

function msgTime(dateStr) {
    try {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Avatar({ name, url, size = 40, online }) {
    const letter = (name || "?")[0].toUpperCase();
    return (
        <div className="relative shrink-0">
            <div
                className="rounded-full flex items-center justify-center font-semibold text-white overflow-hidden"
                style={{
                    width: size,
                    height: size,
                    background: url ? "transparent" : "linear-gradient(135deg, #6366f1, #3b82f6)",
                    fontSize: size * 0.4,
                }}
            >
                {url ? (
                    <img src={url} alt={name} className="w-full h-full object-cover" />
                ) : (
                    letter
                )}
            </div>
            {typeof online === "boolean" && (
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${online ? "bg-green-400" : "bg-gray-500"
                        }`}
                />
            )}
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-700 rounded w-3/4" />
            </div>
        </div>
    );
}

function SkeletonMessages() {
    return (
        <div className="flex-1 flex flex-col gap-3 p-6 animate-pulse">
            <div className="flex justify-start">
                <div className="h-10 bg-gray-700 rounded-2xl w-48" />
            </div>
            <div className="flex justify-end">
                <div className="h-10 bg-blue-900/40 rounded-2xl w-56" />
            </div>
            <div className="flex justify-start">
                <div className="h-10 bg-gray-700 rounded-2xl w-40" />
            </div>
            <div className="flex justify-end">
                <div className="h-10 bg-blue-900/40 rounded-2xl w-52" />
            </div>
            <div className="flex justify-start">
                <div className="h-14 bg-gray-700 rounded-2xl w-64" />
            </div>
        </div>
    );
}

function EmptyChat() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none gap-5">
            {/* Illustration */}
            <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <svg
                        className="w-14 h-14 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-30" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-1">
                    Start a Conversation
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    Select a conversation from the sidebar or wait for someone to message
                    you.
                </p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ChatPage() {
    // ── Config inputs ───────────────────────────────────────────────────────
    const [currentUserId, setCurrentUserId] = useState(
        () => localStorage.getItem("username") || "user_abc"
    );
    const authToken = getAuthToken() || "";
    const [showSettings, setShowSettings] = useState(false);

    // ── Core state ──────────────────────────────────────────────────────────
    const [conversations, setConversations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null); // the conversation object
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [search, setSearch] = useState("");
    const [unread, setUnread] = useState({}); // { username: true }
    const [connectionsOpen, setConnectionsOpen] = useState(true);

    // ── Loading / connection state ──────────────────────────────────────────
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    // ── Refs ─────────────────────────────────────────────────────────────────
    const wsRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const reconnectTimer = useRef(null);
    const selectedConvRef = useRef(selectedConv);

    // keep ref in sync so WS callback can read latest selectedConv
    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    // ── Fetch current user from backend ─────────────────────────────────────
    useEffect(() => {
        if (!authToken) return;
        fetch(`${getApiBase()}/get_current_user`, {
            headers: { Authorization: `Bearer ${authToken}` },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.id) {
                    setCurrentUserId(data.id);
                } else if (data?.username) {
                    // Fallback to username if ID is somehow missing
                    setCurrentUserId(data.username);
                }
            })
            .catch((err) => console.error("Failed to fetch current user:", err));
    }, [authToken]);

    // ── Fetch conversations + connections ────────────────────────────────────
    const fetchConversations = useCallback(async () => {
        if (!authToken) {
            setLoadingConvos(false);
            return;
        }
        try {
            setLoadingConvos(true);
            const apiBase = getApiBase();
            const [convRes, connRes] = await Promise.all([
                fetch(`${apiBase}/conversations`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
                fetch(`${apiBase}/list_connections`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
            ]);
            setConversations(Array.isArray(convRes) ? convRes : []);
            // Normalise connections: backend may return array of objects or strings
            const raw = Array.isArray(connRes) ? connRes : connRes?.connections ?? [];
            const mapped = raw.map((c) =>
                typeof c === "string"
                    ? { user_id: c, username: c, avatar_url: null }
                    : { user_id: c.user_id || c.username, username: c.username ?? c, avatar_url: c.avatar_url ?? null, display_name: c.display_name ?? null }
            );
            setConnections(mapped);
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        } finally {
            setLoadingConvos(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // ── Fetch messages for selected conversation ────────────────────────────
    useEffect(() => {
        if (!selectedConv || !authToken) return;
        const peer = selectedConv.other_user || selectedConv.username;
        setLoadingMsgs(true);
        setMessages([]);

        fetch(`${getApiBase()}/messages/${encodeURIComponent(currentUserId)}/${encodeURIComponent(peer)}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setMessages(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Failed to load messages:", err))
            .finally(() => setLoadingMsgs(false));
    }, [selectedConv, currentUserId, authToken]);

    // ── Auto-scroll ─────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── WebSocket ───────────────────────────────────────────────────────────
    const connectWs = useCallback(() => {
        if (!currentUserId || !authToken) return;

        // close existing
        if (wsRef.current) {
            wsRef.current.onclose = null; // Prevent reconnect loop
            wsRef.current.close();
            wsRef.current = null;
        }

        const url = `${getWsBase()}/ws/chat/${encodeURIComponent(currentUserId)}`;
        let ws;
        try {
            ws = new WebSocket(url);
        } catch (e) {
            console.error("WebSocket creation failed:", e);
            return;
        }

        wsRef.current = ws;

        ws.onopen = () => {
            setWsConnected(true);
            setReconnecting(false);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const activeConv = selectedConvRef.current;
                const activePeer =
                    activeConv?.other_user || activeConv?.user_id || activeConv?.username || null;

                if (data.sender_id === activePeer) {
                    // message belongs to the open conversation → append
                    setMessages((prev) => [
                        ...prev,
                        {
                            sender_id: data.sender_id,
                            receiver_id: currentUserId,
                            content: data.content,
                            created_at: new Date().toISOString(),
                        },
                    ]);
                } else {
                    // message from a different user → mark unread
                    setUnread((prev) => ({ ...prev, [data.sender_id]: true }));
                }

                // Refresh conversation list to update last message previews
                fetchConversations();
            } catch {
                // ignore malformed frames
            }
        };

        ws.onerror = () => {
            console.error("WebSocket error");
        };

        ws.onclose = () => {
            setWsConnected(false);
            // auto-reconnect after 3 seconds
            setReconnecting(true);
            reconnectTimer.current = setTimeout(() => {
                connectWs();
            }, 3000);
        };
    }, [currentUserId, fetchConversations]);

    useEffect(() => {
        connectWs();
        return () => {
            clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect loop on unmount
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connectWs]);

    // ── Send message ────────────────────────────────────────────────────────
    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text || !selectedConv) return;

        const peer = selectedConv.other_user || selectedConv.user_id || selectedConv.username;

        // Optimistic append
        setMessages((prev) => [
            ...prev,
            {
                sender_id: currentUserId,
                receiver_id: peer,
                content: text,
                created_at: new Date().toISOString(),
            },
        ]);

        // Send via WebSocket
        const payload = JSON.stringify({ receiver_id: peer, content: text });
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(payload);
        }

        setInputText("");
        inputRef.current?.focus();
    }, [inputText, selectedConv, currentUserId]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Select a conversation ───────────────────────────────────────────────
    const selectConversation = useCallback(
        (conv) => {
            setSelectedConv(conv);
            const peer = conv.other_user || conv.user_id || conv.username;
            setUnread((prev) => {
                const next = { ...prev };
                delete next[peer];
                return next;
            });
        },
        []
    );

    // ── Filtered conversations ──────────────────────────────────────────────
    const filtered = conversations.filter((c) =>
        (c.username || "").toLowerCase().includes(search.toLowerCase())
    );

    // ── Connections not already in conversations ─────────────────────────────
    const existingPeers = new Set(conversations.map((c) => c.other_user || c.user_id || c.username));
    const newConnections = connections.filter(
        (c) => !existingPeers.has(c.user_id || c.username) &&
            (c.username || "").toLowerCase().includes(search.toLowerCase())
    );

    // ── Start a new conversation from a connection ───────────────────────────
    const startNewChat = useCallback(
        (conn) => {
            const fakeConv = {
                other_user: conn.user_id || conn.username,
                username: conn.username,
                avatar_url: conn.avatar_url,
                content: "",
                created_at: new Date().toISOString(),
            };
            selectConversation(fakeConv);
            setMobileShowChat(true);
        },
        [selectConversation]
    );

    // ── Mobile: show list or chat ───────────────────────────────────────────
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const openChat = useCallback(
        (conv) => {
            selectConversation(conv);
            setMobileShowChat(true);
        },
        [selectConversation]
    );

    const backToList = () => {
        setMobileShowChat(false);
        setSelectedConv(null);
    };

    // ═══════════════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════════════
    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
            {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
            <aside
                className={`${mobileShowChat ? "hidden" : "flex"
                    } md:flex flex-col w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 shrink-0`}
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Avatar name={currentUserId} size={40} online={wsConnected} />
                            <div>
                                <h2 className="text-sm font-semibold text-gray-100 truncate max-w-[140px]">
                                    {currentUserId}
                                </h2>
                                <span className="text-xs text-gray-500">
                                    {wsConnected ? "Connected" : "Offline"}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings((s) => !s)}
                            className="w-9 h-9 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-200"
                            title="Settings"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Settings panel — User ID override */}
                    {showSettings && (
                        <div className="mb-3 bg-gray-800/60 rounded-xl p-3 border border-gray-700/50">
                            <label className="text-xs text-gray-400 mb-1 block">User ID</label>
                            <input
                                type="text"
                                value={currentUserId}
                                onChange={(e) => setCurrentUserId(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="your_user_id"
                            />
                        </div>
                    )}

                    {/* Search bar */}
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search conversations…"
                            className="w-full bg-gray-800 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Conversation list + Connections */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>
                    {loadingConvos ? (
                        <>
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </>
                    ) : (
                        <>
                            {/* ── Recent Conversations ────────────────────── */}
                            {filtered.length > 0 && (
                                <div>
                                    <div className="px-4 pt-3 pb-1">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Chats</h3>
                                    </div>
                                    {filtered.map((conv) => {
                                        const peer = conv.other_user || conv.username;
                                        const isActive =
                                            selectedConv &&
                                            (selectedConv.other_user || selectedConv.username) === peer;
                                        const hasUnread = !!unread[peer];

                                        return (
                                            <button
                                                key={peer}
                                                onClick={() => openChat(conv)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 ${isActive
                                                    ? "bg-blue-500/10 border-l-2 border-blue-500"
                                                    : "border-l-2 border-transparent hover:bg-gray-800/60"
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <Avatar
                                                        name={conv.username}
                                                        url={conv.avatar_url}
                                                        size={48}
                                                    />
                                                    {hasUnread && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <span
                                                            className={`text-sm truncate ${hasUnread
                                                                ? "font-semibold text-gray-100"
                                                                : "font-medium text-gray-300"
                                                                }`}
                                                        >
                                                            {conv.username}
                                                        </span>
                                                        <span className="text-xs text-gray-600 shrink-0">
                                                            {relativeTime(conv.created_at)}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`text-xs truncate mt-0.5 ${hasUnread ? "text-gray-300" : "text-gray-500"
                                                            }`}
                                                    >
                                                        {conv.content}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── Your Connections ────────────────────────── */}
                            {connections.length > 0 && (
                                <div className="border-t border-gray-800">
                                    <button
                                        onClick={() => setConnectionsOpen((o) => !o)}
                                        className="w-full flex items-center justify-between px-4 pt-3 pb-1 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Connections</h3>
                                        <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${connectionsOpen ? "rotate-180" : ""
                                                }`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {connectionsOpen && (
                                        <div className="py-1">
                                            {(search ? newConnections : connections).length === 0 ? (
                                                <p className="px-4 py-3 text-xs text-gray-600 italic text-center">
                                                    {search ? "No matching connections" : "All connections have conversations"}
                                                </p>
                                            ) : (
                                                (search ? newConnections : connections).map((conn) => {
                                                    const peerId = conn.user_id || conn.username;
                                                    const isActive =
                                                        selectedConv &&
                                                        (selectedConv.other_user || selectedConv.user_id || selectedConv.username) === peerId;
                                                    const alreadyChatted = existingPeers.has(peerId);

                                                    return (
                                                        <div
                                                            key={peerId}
                                                            className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-150 ${isActive
                                                                ? "bg-blue-500/10"
                                                                : "hover:bg-gray-800/40"
                                                                }`}
                                                        >
                                                            <Avatar
                                                                name={conn.username}
                                                                url={conn.avatar_url}
                                                                size={40}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-300 truncate">
                                                                    {conn.display_name || conn.username}
                                                                </p>
                                                                {conn.display_name && (
                                                                    <p className="text-xs text-gray-600 truncate">@{conn.username}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => alreadyChatted
                                                                    ? openChat(conversations.find((c) => (c.other_user || c.username) === peerId))
                                                                    : startNewChat(conn)
                                                                }
                                                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${alreadyChatted
                                                                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                                                                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10 active:scale-95"
                                                                    }`}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                </svg>
                                                                {alreadyChatted ? "Open" : "Chat"}
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Empty state when both lists are empty */}
                            {filtered.length === 0 && connections.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                                    <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm text-gray-500">
                                        {search ? "No matching results" : "No conversations or connections yet"}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
            <main
                className={`${!mobileShowChat ? "hidden" : "flex"
                    } md:flex flex-col flex-1 bg-gray-950 overflow-hidden`}
            >
                {selectedConv ? (
                    <>
                        {/* Reconnecting banner */}
                        {reconnecting && (
                            <div className="bg-yellow-600/20 border-b border-yellow-600/30 px-4 py-1.5 flex items-center gap-2 shrink-0">
                                <svg className="animate-spin w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-xs text-yellow-400">Reconnecting…</span>
                            </div>
                        )}

                        {/* Chat header */}
                        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
                            {/* Back button (mobile) */}
                            <button
                                onClick={backToList}
                                className="md:hidden w-9 h-9 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <Avatar
                                name={selectedConv.username}
                                url={selectedConv.avatar_url}
                                size={42}
                                online={wsConnected}
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-100 truncate">
                                    {selectedConv.username}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-green-400" : "bg-gray-500"
                                            }`}
                                    />
                                    <span className="text-xs text-gray-500">
                                        {wsConnected ? "Online" : "Offline"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>
                            {loadingMsgs ? (
                                <SkeletonMessages />
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-600">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm">Say hello! 👋</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isSent = msg.sender_id === currentUserId;
                                    const showAvatar =
                                        !isSent &&
                                        (i === 0 || messages[i - 1]?.sender_id === currentUserId);

                                    return (
                                        <div
                                            key={i}
                                            className={`flex ${isSent ? "justify-end" : "justify-start"} ${showAvatar && !isSent ? "mt-3" : "mt-0.5"
                                                }`}
                                        >
                                            {/* Peer avatar for grouped messages */}
                                            {!isSent && (
                                                <div className="w-8 mr-2 mt-auto mb-1 shrink-0">
                                                    {showAvatar ? (
                                                        <Avatar
                                                            name={selectedConv.username}
                                                            url={selectedConv.avatar_url}
                                                            size={28}
                                                        />
                                                    ) : null}
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 text-sm leading-relaxed ${isSent
                                                    ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                                                    : "bg-gray-800 text-gray-200 rounded-2xl rounded-bl-md"
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                <p
                                                    className={`text-[10px] mt-1 ${isSent ? "text-blue-200/60 text-right" : "text-gray-500 text-left"
                                                        }`}
                                                >
                                                    {msgTime(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input bar */}
                        <div className="shrink-0 px-4 py-3 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
                            <div className="flex items-end gap-3">
                                <textarea
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message…"
                                    rows={1}
                                    className="flex-1 resize-none overflow-hidden bg-gray-800 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors leading-relaxed"
                                    style={{ maxHeight: "120px" }}
                                    onInput={(e) => {
                                        const el = e.currentTarget;
                                        el.style.height = "auto";
                                        el.style.height = el.scrollHeight + "px";
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${inputText.trim()
                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95"
                                        : "bg-gray-800 text-gray-600 cursor-not-allowed"
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyChat />
                )}
            </main>
        </div>
    );
}
