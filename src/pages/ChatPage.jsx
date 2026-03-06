import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FiSmile, FiMic } from "react-icons/fi";
import EmojiPicker from 'emoji-picker-react';

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

function parseDateUtc(dateStr) {
    if (!dateStr) return new Date();
    if (typeof dateStr !== "string") return new Date(dateStr);
    if (dateStr.endsWith("Z") || dateStr.includes("+") || (dateStr.includes("-") && dateStr.length > 20)) {
        return new Date(dateStr);
    }
    let cleanStr = dateStr.replace(" ", "T");
    if (!cleanStr.endsWith("Z")) cleanStr += "Z";
    return new Date(cleanStr);
}

function relativeTime(dateStr) {
    try {
        const diff = Date.now() - parseDateUtc(dateStr).getTime();
        if (diff < 60_000) return "just now";
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
        return parseDateUtc(dateStr).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    } catch {
        return "";
    }
}

function msgTime(dateStr) {
    try {
        return parseDateUtc(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
}

function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function getDateSeparator(dateStr) {
    const date = parseDateUtc(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
    });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Avatar({ name, url, size = 40, online }) {
    return (
        <div className="relative shrink-0 flex items-center justify-center">
            <div
                className="rounded-full flex items-center justify-center overflow-hidden bg-stone-100 border border-stone-200 shadow-sm"
                style={{ width: size, height: size }}
            >
                {url ? (
                    <img src={url} alt={name || "User"} className="w-full h-full object-cover" />
                ) : (
                    <svg
                        className="w-3/5 h-3/5 text-stone-300 mt-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                )}
            </div>
            {typeof online === "boolean" && (
                <span
                    className={`absolute bottom-0 right-0 w-[28%] h-[28%] min-w-[10px] min-h-[10px] rounded-full border-2 border-white ${online ? "bg-emerald-400" : "bg-stone-300"
                        }`}
                />
            )}
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-stone-200" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-stone-200 rounded w-1/2" />
                <div className="h-3 bg-stone-200 rounded w-3/4" />
            </div>
        </div>
    );
}

function SkeletonMessages() {
    return (
        <div className="flex-1 flex flex-col gap-3 p-6 animate-pulse">
            <div className="flex justify-start">
                <div className="h-10 bg-stone-200 rounded-2xl w-48" />
            </div>
            <div className="flex justify-end">
                <div className="h-10 bg-stone-100 rounded-2xl w-56" />
            </div>
            <div className="flex justify-start">
                <div className="h-10 bg-stone-200 rounded-2xl w-40" />
            </div>
            <div className="flex justify-end">
                <div className="h-10 bg-stone-100 rounded-2xl w-52" />
            </div>
            <div className="flex justify-start">
                <div className="h-14 bg-stone-200 rounded-2xl w-64" />
            </div>
        </div>
    );
}

function EmptyChat() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none gap-5">
            {/* Illustration */}
            <div className="relative">
                <div className="w-28 h-28 rounded-full bg-[#fafaf9] border border-stone-200 shadow-sm flex items-center justify-center">
                    <svg
                        className="w-14 h-14 text-stone-300"
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
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-stone-300 rounded-full animate-ping opacity-20" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-stone-800 mb-1">
                    Start a Conversation
                </h3>
                <p className="text-sm text-stone-500 max-w-xs">
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

    // ── Sidebar Resizing State ──────────────────────────────────────────────
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 280) newWidth = 280; // min width
            if (newWidth > 500) newWidth = 500; // max width
            setSidebarWidth(newWidth);
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    // ── Core state ──────────────────────────────────────────────────────────
    const [conversations, setConversations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null); // the conversation object
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [search, setSearch] = useState("");
    const [unread, setUnread] = useState({}); // { username: true }
    const [connectionsOpen, setConnectionsOpen] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
            .then((data) => {
                // Ensure `created_at` exists (API sometimes uses `timestamp`)
                const normalized = Array.isArray(data) ? data.map(msg => ({
                    ...msg,
                    created_at: msg.created_at || msg.timestamp || new Date().toISOString()
                })) : [];
                setMessages(normalized);
            })
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
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    }, [inputText, selectedConv, currentUserId]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setInputText((prev) => prev + emojiObject.emoji);
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

    // Handle MobileNavbar and Body Padding visibility
    useEffect(() => {
        if (mobileShowChat) {
            window.dispatchEvent(new Event("chat:open"));
            document.body.classList.add("chat-open");
        } else {
            window.dispatchEvent(new Event("chat:close"));
            document.body.classList.remove("chat-open");
        }

        // Always ensure navbar is visible and padding restored when leaving the chat page entirely
        return () => {
            window.dispatchEvent(new Event("chat:close"));
            document.body.classList.remove("chat-open");
        };
    }, [mobileShowChat]);

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
        <div className="flex h-screen bg-stone-50 text-stone-900 overflow-hidden font-sans">
            {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
            <aside
                className={`${mobileShowChat ? "hidden" : "flex"
                    } md:flex flex-col bg-white border-r-2 border-stone-800 shrink-0 relative transition-[width] duration-0 shadow-[4px_0_0_0_rgba(0,0,0,0.05)]`}
                style={{
                    width: typeof window !== "undefined" && window.innerWidth < 768 ? "100%" : sidebarWidth,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M1 1l1 0M5 5l1 0M10 10l1 0M15 15l1 0M18 18l1 0' stroke='%23000' stroke-opacity='0.02'/%3E%3C/svg%3E")`
                }}
            >
                {/* Drag Handle */}
                <div
                    className="absolute top-0 -right-1 w-2.5 h-full cursor-col-resize hover:bg-stone-200/60 transition-colors z-50 flex items-center justify-center group hidden md:flex"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                    }}
                >
                    <div className="w-0.5 h-8 bg-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {/* Back to dashboard */}
                            <a
                                href="/dashboard"
                                className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors text-stone-500 hover:text-stone-700 shrink-0"
                                title="Back to Dashboard"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </a>
                            <div>
                                <h2 className="text-xl font-bold text-stone-900 truncate max-w-[140px]">
                                    Messages
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
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
                            className="w-full bg-stone-100/80 border border-transparent rounded-xl pl-10 pr-4 py-2 text-sm text-stone-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-stone-400 focus:ring-1 focus:ring-stone-400/50 transition-all"
                        />
                    </div>
                </div>

                {/* Conversation list + Connections */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
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
                                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Recent Chats</h3>
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
                                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 border-none outline-none focus:outline-none ${isActive
                                                    ? "bg-stone-100"
                                                    : "bg-transparent hover:bg-stone-50/80"
                                                    }`}
                                                style={{ boxShadow: "none" }}
                                            >
                                                <div className="relative">
                                                    <Avatar
                                                        name={conv.display_name || conv.username}
                                                        url={conv.avatar_url}
                                                        size={44}
                                                    />
                                                    {hasUnread && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#0891b2] rounded-full border-2 border-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <span
                                                            className={`text-sm truncate ${hasUnread
                                                                ? "font-semibold text-stone-900"
                                                                : "font-medium text-stone-700"
                                                                }`}
                                                        >
                                                            {conv.display_name || conv.username}
                                                        </span>
                                                        <span className="text-[11px] text-stone-400 shrink-0">
                                                            {relativeTime(conv.created_at)}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={`text-xs truncate mt-0.5 ${hasUnread ? "text-stone-600" : "text-stone-400"
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
                                <div className="border-t border-stone-200">
                                    <button
                                        onClick={() => setConnectionsOpen((o) => !o)}
                                        className="w-full flex items-center justify-between px-4 pt-4 pb-2 hover:bg-stone-50/80 transition-colors border-none outline-none focus:outline-none"
                                        style={{ boxShadow: "none" }}
                                    >
                                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Your Connections</h3>
                                        <svg
                                            className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${connectionsOpen ? "rotate-180" : ""
                                                }`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {connectionsOpen && (
                                        <div className="py-1">
                                            {(search ? newConnections : connections).length === 0 ? (
                                                <p className="px-4 py-3 text-xs text-stone-400 italic text-center">
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
                                                        <button
                                                            key={peerId}
                                                            onClick={() => alreadyChatted
                                                                ? openChat(conversations.find((c) => (c.other_user || c.username) === peerId))
                                                                : startNewChat(conn)
                                                            }
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 border-none outline-none focus:outline-none text-left ${isActive
                                                                ? "bg-stone-50"
                                                                : "hover:bg-stone-50"
                                                                }`}
                                                            style={{ boxShadow: "none" }}
                                                        >
                                                            <Avatar
                                                                name={conn.username}
                                                                url={conn.avatar_url}
                                                                size={40}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-stone-700 truncate">
                                                                    {conn.display_name || conn.username}
                                                                </p>
                                                                {conn.display_name && (
                                                                    <p className="text-xs text-stone-400 truncate">@{conn.username}</p>
                                                                )}
                                                            </div>
                                                        </button>
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
                                    <svg className="w-12 h-12 text-stone-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm text-stone-400">
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
                className="flex flex-col flex-1 bg-stone-50 overflow-hidden w-full"
            >
                {selectedConv ? (
                    <>
                        {/* Reconnecting banner */}
                        {reconnecting && (
                            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1.5 flex items-center gap-2 shrink-0">
                                <svg className="animate-spin w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-xs text-yellow-600">Reconnecting…</span>
                            </div>
                        )}

                        {/* Chat header */}
                        <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-[#0891b2]/20 bg-[#0891b2]/50 shadow-sm sticky top-0 z-10 w-full">
                            {/* Back button (mobile) */}
                            <button
                                onClick={() => setMobileShowChat(false)}
                                className="md:hidden w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-stone-900 -ml-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <a
                                href={`/profile/${selectedConv.username}`}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
                            >
                                <Avatar
                                    name={selectedConv.display_name || selectedConv.username}
                                    url={selectedConv.avatar_url}
                                    size={36}
                                    online={wsConnected}
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-stone-900 truncate">
                                        {selectedConv.display_name || selectedConv.username}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-stone-900" : "bg-stone-500"
                                                }`}
                                        />
                                        <span className="text-xs text-stone-800 font-medium">
                                            {wsConnected ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* Messages — WhatsApp-style subtle pattern background */}
                        <div
                            className="flex-1 overflow-y-auto overflow-x-hidden relative"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#d1d5db transparent",
                                backgroundColor: "#efeae2",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' opacity='0.04'%3E%3Cpath d='M 20 20 L 25 10 L 30 20 L 40 25 L 30 30 L 25 40 L 20 30 L 10 25 Z' transform='scale(0.5) translate(20, 20) rotate(15)'/%3E%3Cpath d='M15 80l10 0m-5-5l0 10'/%3E%3Cpath d='M 40 50 Q 45 45, 50 50 T 60 50'/%3E%3Cpath d='M70 90l10-10m0 10l-10-10'/%3E%3Ccircle cx='80' cy='20' r='4'/%3E%3Ccircle cx='75' cy='75' r='1' fill='%23000000'/%3E%3Ccircle cx='10' cy='50' r='1' fill='%23000000'/%3E%3Ccircle cx='90' cy='50' r='1' fill='%23000000'/%3E%3Ccircle cx='50' cy='10' r='1' fill='%23000000'/%3E%3Ccircle cx='45' cy='90' r='1' fill='%23000000'/%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        >
                            {loadingMsgs ? (
                                <SkeletonMessages />
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 text-stone-400">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm">Say hello! 👋</p>
                                </div>
                            ) : (
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: -60, right: 0 }}
                                    dragDirectionLock
                                    dragElastic={0.1}
                                    className="w-full min-h-full py-4 space-y-1 relative"
                                >
                                    {messages.map((msg, i) => {
                                        const isSent = msg.sender_id === currentUserId;

                                        const prevMsg = messages[i - 1];
                                        const isNewDay = !prevMsg || !isSameDay(parseDateUtc(msg.created_at), parseDateUtc(prevMsg.created_at));

                                        // 1 hour gap check
                                        const isHourGap = !prevMsg || (parseDateUtc(msg.created_at).getTime() - parseDateUtc(prevMsg.created_at).getTime() > 60 * 60 * 1000);
                                        const showTimeSep = isNewDay || isHourGap;

                                        return (
                                            <div key={i} className="group relative w-full">
                                                {isNewDay && (
                                                    <div className="flex justify-center my-6">
                                                        <span className="text-xs font-medium text-stone-500 bg-white border border-stone-200 px-4 py-1.5 rounded-full shadow-sm">
                                                            {getDateSeparator(msg.created_at)}
                                                        </span>
                                                    </div>
                                                )}
                                                {!isNewDay && isHourGap && (
                                                    <div className="flex justify-center my-4">
                                                        <span className="text-[11px] font-medium text-stone-400 bg-transparent px-3 py-1">
                                                            {msgTime(msg.created_at)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex w-full px-4 relative mt-1 ${isSent ? "justify-end" : "justify-start"}`}
                                                >
                                                    {!isSent && (
                                                        <div className="flex-shrink-0 mr-2 self-end mb-0.5">
                                                            <Avatar
                                                                name={selectedConv.display_name || selectedConv.username}
                                                                url={selectedConv.avatar_url}
                                                                size={24}
                                                            />
                                                        </div>
                                                    )}
                                                    <motion.div
                                                        drag="x"
                                                        dragConstraints={{ left: -50, right: 0 }}
                                                        dragDirectionLock
                                                        dragElastic={0.1}
                                                        className={`max-w-[100%] sm:max-w-[70%] px-4 py-2 text-[14px] leading-snug shadow-sm relative z-10 ${isSent
                                                            ? "bg-[#0891b2]/50 text-stone-900 rounded-[20px] rounded-br-[4px]"
                                                            : "bg-[#f4f4f5] text-stone-800 rounded-[20px] rounded-bl-[4px] border border-stone-200"
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    </motion.div>

                                                    {/* Hidden timestamp column (revealed on swipe or hover) */}
                                                    <div className="absolute right-[-45px] top-1/2 -translate-y-1/2 text-[11px] font-medium text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity w-[45px] text-center select-none pointer-events-none z-0">
                                                        {msgTime(msg.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-4" />
                                </motion.div>
                            )}
                        </div>

                        {/* Input bar */}
                        <div className="shrink-0 px-3 py-2 border-t border-stone-200 bg-white/90 backdrop-blur-sm relative z-20">
                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-2 shadow-xl rounded-xl overflow-hidden z-50">
                                    <EmojiPicker height={350} searchDisabled theme="light" onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                            <div className="flex items-end gap-2">
                                <div className="flex-1 shrink flex items-end bg-stone-100 border border-stone-200 rounded-3xl transition-colors focus-within:border-blue-400 focus-within:bg-white overflow-hidden min-h-[40px]">
                                    <button
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                        className="chat-icon-btn flex-none flex items-center justify-center pl-3.5 pr-1.5 py-3 text-stone-500 transition-colors self-end mb-0"
                                        style={{ WebkitTapHighlightColor: "transparent" }}
                                    >
                                        <FiSmile className="w-[18px] h-[18px]" />
                                    </button>
                                    <textarea
                                        ref={inputRef}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setShowEmojiPicker(false)}
                                        placeholder="Type a message…"
                                        rows={1}
                                        className="flex-1 w-full resize-none bg-transparent py-2.5 pr-4 pl-1 text-sm text-stone-900 placeholder-gray-500 focus:outline-none leading-snug"
                                        style={{ maxHeight: "100px" }}
                                        onInput={(e) => {
                                            const el = e.currentTarget;
                                            el.style.height = "auto";
                                            el.style.height = el.scrollHeight + "px";
                                        }}
                                    />
                                </div>

                                <div className="w-[40px] flex justify-center">
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputText.trim()}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 shadow-sm mb-0 ${inputText.trim()
                                            ? "bg-[#0891b2]/80 hover:bg-[#0891b2] text-white active:scale-95"
                                            : "bg-[#0891b2]/30 text-white/50 cursor-not-allowed"
                                            }`}
                                    >
                                        <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyChat />
                )
                }
            </main >
        </div >
    );
}
