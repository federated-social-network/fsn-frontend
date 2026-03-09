import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FiSmile, FiMic, FiPhone, FiVideo, FiVideoOff, FiMicOff, FiPhoneOff } from "react-icons/fi";
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
    const apiBase = getApiBase();
    const fullUrl = url && url.startsWith('/') ? `${apiBase}${url}` : url;

    return (
        <div className="relative shrink-0 flex items-center justify-center">
            <div
                className="rounded-full flex items-center justify-center overflow-hidden bg-stone-100 border border-stone-200 shadow-sm"
                style={{ width: size, height: size }}
            >
                {fullUrl ? (
                    <img src={fullUrl} alt={name || "User"} className="w-full h-full object-cover" />
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
    const [unread, setUnread] = useState({}); // { username: count }
    const [connectionsOpen, setConnectionsOpen] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // ── Call state ──────────────────────────────────────────────────────────
    const [callState, setCallState] = useState("idle"); // idle, calling, receiving, connected
    const [callType, setCallType] = useState(null); // video, voice
    const [callerId, setCallerId] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Call Resizing State (Desktop only)
    const [callWidth, setCallWidth] = useState(() => Number(localStorage.getItem("callWidth")) || 320);
    const [callHeight, setCallHeight] = useState(() => Number(localStorage.getItem("callHeight")) || 448);
    const [isResizingCall, setIsResizingCall] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizingCall) return;

            // Calculate delta relative to start (Top-Left resize)
            const deltaX = resizeStart.x - e.clientX;
            const deltaY = resizeStart.y - e.clientY;

            const newWidth = resizeStart.w + deltaX;
            const newHeight = resizeStart.h + deltaY;

            if (newWidth >= 280 && newWidth <= 800) {
                setCallWidth(newWidth);
                localStorage.setItem("callWidth", newWidth);
            }
            if (newHeight >= 350 && newHeight <= 900) {
                setCallHeight(newHeight);
                localStorage.setItem("callHeight", newHeight);
            }
        };
        const handleMouseUp = () => setIsResizingCall(false);

        if (isResizingCall) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizingCall, resizeStart]);

    // Remote identity during call
    const [remoteDisplayName, setRemoteDisplayName] = useState(null);
    const [remoteAvatarUrl, setRemoteAvatarUrl] = useState(null);

    // Video refs for the UI
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // PeerConnection ref
    const peerConnectionRef = useRef(null);

    // ── Loading / connection state ──────────────────────────────────────────
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    // ── Helper ──────────────────────────────────────────────────────────────
    const getDisplayName = useCallback((id) => {
        if (!id) return "";
        if (selectedConv && (selectedConv.username === id || selectedConv.user_id === id)) {
            return selectedConv.display_name || selectedConv.username || id;
        }
        const conv = conversations.find(c => c.username === id || c.user_id === id);
        if (conv) return conv.display_name || conv.username || id;
        const conn = connections.find(c => c.username === id || c.id === id);
        if (conn) return conn.display_name || conn.username || id;
        return id;
    }, [selectedConv, conversations, connections]);

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
    const fetchConversations = useCallback(async (background = false) => {
        if (!authToken) {
            setLoadingConvos(false);
            return;
        }
        try {
            if (!background) setLoadingConvos(true);
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
            if (!background) setLoadingConvos(false);
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

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: "read_receipt",
                        sender_id: peer
                    }));
                }
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

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                const activeConv = selectedConvRef.current;
                const activePeer =
                    activeConv?.other_user || activeConv?.user_id || activeConv?.username || null;

                if (data.type === "webrtc_offer") {
                    setCallType(data.callType);
                    setCallerId(data.sender_id);
                    if (data.sender_info) {
                        setRemoteDisplayName(data.sender_info.display_name);
                        setRemoteAvatarUrl(data.sender_info.avatar_url);
                    }
                    setCallState("receiving");
                    // Store the offer temporarily, we'll setRemoteDescription when user accepts
                    window.pendingOffer = data.sdp;
                    return;
                }

                if (data.type === "webrtc_answer") {
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                            setCallState("connected");
                        } catch (e) {
                            console.error("Error setting remote description", e);
                        }
                    }
                    return;
                }

                if (data.type === "webrtc_ice_candidate") {
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) {
                            console.error("Error adding ice candidate", e);
                        }
                    }
                    return;
                }

                if (data.type === "webrtc_end_call" || data.type === "webrtc_decline") {
                    cleanupCall();
                    return;
                }

                if (data.type === "webrtc_error") {
                    alert(data.message || "Call failed");
                    cleanupCall();
                    return;
                }

                if (data.type === "read_receipt") {
                    if (data.reader_id === activePeer) {
                        setMessages((prev) => prev.map(m =>
                            m.sender_id === currentUserId ? { ...m, is_read: true } : m
                        ));
                    }
                    return;
                }

                if (data.sender_id === activePeer) {
                    // message belongs to the open conversation → append
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: data.id,
                            sender_id: data.sender_id,
                            receiver_id: currentUserId,
                            content: data.content,
                            created_at: data.created_at || new Date().toISOString(),
                            is_read: data.is_read || false,
                        },
                    ]);

                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: "read_receipt",
                            sender_id: data.sender_id
                        }));
                    }
                } else {
                    // message from a different user → increment unread count
                    setUnread((prev) => ({
                        ...prev,
                        [data.sender_id]: (prev[data.sender_id] || 0) + 1
                    }));
                }

                // Refresh conversation list to update last message previews silently
                fetchConversations(true);
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

    // ── WebRTC Call Logic ───────────────────────────────────────────────────

    const cleanupCall = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        setLocalStream(null);
        setRemoteStream(null);
        setCallState("idle");
        setCallType(null);
        setCallerId(null);
        setRemoteDisplayName(null);
        setRemoteAvatarUrl(null);
        setIsMuted(false);
        setIsVideoOff(false);
        window.pendingOffer = null;
    }, [localStream]);

    // Ensure video elements get their streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    const setupPeerConnection = useCallback((peer) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: "webrtc_ice_candidate",
                    receiver_id: peer,
                    candidate: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peerConnectionRef.current = pc;
        return pc;
    }, []);

    const startCall = useCallback(async (type) => {
        if (!selectedConv) return;
        const peer = selectedConv.other_user || selectedConv.user_id || selectedConv.username;

        try {
            let stream;
            let actualType = type;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: type === "video",
                    audio: true
                });
            } catch (mediaErr) {
                if (type === "video" && (mediaErr.name === "NotReadableError" || mediaErr.name === "TrackStartError")) {
                    console.warn("Camera unavailable, falling back to voice.", mediaErr);
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    actualType = "voice";
                    alert("Camera is unavailable (it might be in use by another tab or app). Switching to Voice Call.");
                } else {
                    throw mediaErr;
                }
            }

            setLocalStream(stream);
            setCallType(actualType);
            setCallerId(peer);
            setRemoteDisplayName(selectedConv.display_name || selectedConv.username || peer);
            setRemoteAvatarUrl(selectedConv.avatar_url);
            setCallState("calling");

            const pc = setupPeerConnection(peer);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: "webrtc_offer",
                    receiver_id: peer,
                    callType: actualType,
                    sdp: pc.localDescription,
                    sender_info: {
                        display_name: localStorage.getItem("display_name") || localStorage.getItem("username") || currentUserId,
                        avatar_url: localStorage.getItem("user_avatar_url") || localStorage.getItem("avatar_url"),
                        username: localStorage.getItem("username") || currentUserId
                    }
                }));
            }
        } catch (e) {
            console.error("Failed to start call", e);
            alert("Could not access camera/microphone.");
            cleanupCall();
        }
    }, [selectedConv, setupPeerConnection, cleanupCall]);

    const acceptCall = useCallback(async () => {
        if (!callerId || !window.pendingOffer) return;

        try {
            let stream;
            let actualType = callType;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: callType === "video",
                    audio: true
                });
            } catch (mediaErr) {
                if (callType === "video" && (mediaErr.name === "NotReadableError" || mediaErr.name === "TrackStartError")) {
                    console.warn("Camera unavailable, falling back to voice.", mediaErr);
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    actualType = "voice";
                    setCallType("voice");
                    alert("Camera is unavailable. Answering as Voice Call.");
                } else {
                    throw mediaErr;
                }
            }

            setLocalStream(stream);
            setCallState("connected");

            const pc = setupPeerConnection(callerId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(window.pendingOffer));
            window.pendingOffer = null;

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: "webrtc_answer",
                    receiver_id: callerId,
                    sdp: pc.localDescription
                }));
            }
        } catch (e) {
            console.error("Failed to accept call", e);
            alert("Could not access camera/microphone.");
            declineCall();
        }
    }, [callerId, callType, setupPeerConnection]);

    const declineCall = useCallback(() => {
        if (callerId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "webrtc_decline",
                receiver_id: callerId
            }));
        }
        cleanupCall();
    }, [callerId, cleanupCall]);

    const endCall = useCallback(() => {
        const peer = selectedConv ? (selectedConv.other_user || selectedConv.user_id || selectedConv.username) : callerId;
        if (peer && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "webrtc_end_call",
                receiver_id: peer
            }));
        }
        cleanupCall();
    }, [selectedConv, callerId, cleanupCall]);

    const toggleMute = useCallback(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!localStream.getAudioTracks()[0]?.enabled);
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream && callType === "video") {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!localStream.getVideoTracks()[0]?.enabled);
        }
    }, [localStream, callType]);


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
                is_read: false,
            },
        ]);

        // Send via WebSocket
        const payload = JSON.stringify({ type: "chat", receiver_id: peer, content: text });
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
        <div className="flex flex-col h-screen overflow-hidden bg-[#faf9f6] text-stone-900 font-sans selection:bg-[#0891b2] selection:text-white pb-16 md:pb-0">
            {/* Top Navigation / Header for the whole Chat Page */}
            {!selectedConv && (
                <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b-4 border-stone-800 bg-white" style={{boxShadow: "0 4px 0 0 rgba(28,25,23,1)"}}>
                    <div className="flex items-center gap-4">
                        <a
                            href="/dashboard"
                            className="w-10 h-10 border-2 border-stone-800 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_0_rgba(28,25,23,1)] flex items-center justify-center transition-all bg-[#fef08a] text-stone-900 rounded-none shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                            title="Back to Dashboard"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </a>
                        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight" style={{fontFamily: "'Courier New', Courier, monospace"}}>
                            Messages
                        </h2>
                    </div>
                    <div className="relative w-full max-w-xs hidden md:block">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="FIND SOMEONE..."
                            className="w-full bg-white border-4 border-stone-800 rounded-none !pl-10 pr-4 py-2 font-bold text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:-translate-y-1 focus:-translate-x-1 transition-transform shadow-[4px_4px_0_0_rgba(28,25,23,1)]"
                        />
                    </div>
                </header>
            )}

            {/* Mobile Search Bar */}
            {!selectedConv && (
                <div className="md:hidden px-4 py-4 border-b-4 border-stone-800 bg-white" style={{boxShadow: "0 4px 0 0 rgba(28,25,23,1)"}}>
                    <div className="relative w-full">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="FIND SOMEONE..."
                            className="w-full bg-white border-4 border-stone-800 rounded-none !pl-10 pr-4 py-3 font-bold text-sm text-stone-900 placeholder-stone-400 focus:outline-none block shadow-[4px_4px_0_0_rgba(28,25,23,1)]"
                        />
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col overflow-hidden relative" style={{
                    backgroundImage: `linear-gradient(#1c1917 1px, transparent 1px), linear-gradient(90deg, #1c1917 1px, transparent 1px)`,
                    backgroundSize: `40px 40px`,
                    backgroundPosition: `-10px -10px`,
                    backgroundColor: `#faf9f6`
                }}>
                {/* semi-transparent overlay to make grid subtle */}
                <div className="absolute inset-0 bg-[#faf9f6]/80 pointer-events-none" />
                
                {selectedConv ? (
                    // ── CHAT VIEW ──────────────────────────────────────────────
                    <div className="flex-1 flex flex-col bg-white border-x-4 border-stone-900 mx-0 md:mx-auto w-full md:w-3/4 lg:w-2/3 md:my-6 md:shadow-[12px_12px_0_0_rgba(28,25,23,1)] relative overflow-hidden h-full z-10">
                        {/* Chat header */}
                        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b-4 border-stone-900 bg-[#fdfbf7] z-20 w-full relative">
                            <button
                                onClick={backToList}
                                className="w-10 h-10 border-2 border-stone-900 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_0_rgba(28,25,23,1)] flex items-center justify-center transition-all bg-white text-stone-900 shrink-0 shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <a
                                href={`/profile/${selectedConv.username}`}
                                className="flex items-center gap-3 hover:-translate-y-0.5 transition-transform min-w-0"
                            >
                                <div className="border-2 border-stone-900 rounded-full bg-white p-0.5 shadow-[2px_2px_0_0_rgba(28,25,23,1)]">
                                    <Avatar
                                        name={selectedConv.display_name || selectedConv.username}
                                        url={selectedConv.avatar_url}
                                        size={36}
                                        online={wsConnected}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-black text-stone-900 truncate uppercase tracking-tight">
                                        {selectedConv.display_name || selectedConv.username}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span
                                            className={`w-2.5 h-2.5 border-2 border-stone-900 rounded-full ${wsConnected ? "bg-green-400" : "bg-stone-400"
                                                }`}
                                        />
                                        <span className="text-[10px] text-stone-800 font-bold uppercase tracking-widest">
                                            {wsConnected ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </a>

                            {/* Call Buttons */}
                            <div className="ml-auto flex items-center gap-3">
                                <button
                                    onClick={() => startCall("voice")}
                                    disabled={!wsConnected || callState !== "idle"}
                                    className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center bg-[#fef08a] text-stone-900 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all shadow-[2px_2px_0_0_rgba(28,25,23,1)] disabled:opacity-50 disabled:pointer-events-none"
                                    title="Voice Call"
                                >
                                    <FiPhone className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => startCall("video")}
                                    disabled={!wsConnected || callState !== "idle"}
                                    className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center bg-[#0891b2] text-white hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all shadow-[2px_2px_0_0_rgba(28,25,23,1)] disabled:opacity-50 disabled:pointer-events-none"
                                    title="Video Call"
                                >
                                    <FiVideo className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Reconnecting banner inside chat */}
                        {reconnecting && (
                            <div className="bg-yellow-400 border-b-4 border-stone-900 px-4 py-2 flex items-center gap-3 shrink-0 uppercase font-black text-sm tracking-wider shadow-[0_4px_0_0_rgba(28,25,23,1)] z-10 rotate-[0.5deg]">
                                <span className="text-stone-900">Reconnecting…</span>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto overflow-x-hidden relative p-4"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#1c1917 transparent",
                                backgroundColor: "#fdfbf7",
                            }}
                        >
                            {loadingMsgs ? (
                                <SkeletonMessages />
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="w-24 h-24 border-4 border-stone-900 bg-white shadow-[8px_8px_0_0_rgba(28,25,23,1)] flex items-center justify-center rotate-[-5deg]">
                                        <svg className="w-12 h-12 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="font-black text-xl uppercase tracking-widest bg-[#fef08a] px-4 py-1 border-4 border-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] rotate-[2deg]">Say Hello!</p>
                                </div>
                            ) : (
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: -60, right: 0 }}
                                    dragDirectionLock
                                    dragElastic={0.1}
                                    className="w-full min-h-full py-4 space-y-4 relative"
                                >
                                    {messages.map((msg, i) => {
                                        const isSent = msg.sender_id === currentUserId;

                                        const prevMsg = messages[i - 1];
                                        const isNewDay = !prevMsg || !isSameDay(parseDateUtc(msg.created_at), parseDateUtc(prevMsg.created_at));
                                        const isHourGap = !prevMsg || (parseDateUtc(msg.created_at).getTime() - parseDateUtc(prevMsg.created_at).getTime() > 60 * 60 * 1000);
                                        
                                        return (
                                            <div key={i} className="group relative w-full">
                                                {isNewDay && (
                                                    <div className="flex justify-center my-8">
                                                        <span className="text-xs font-black text-stone-900 bg-[#fef08a] border-2 border-stone-900 px-4 py-1.5 shadow-[2px_2px_0_0_rgba(28,25,23,1)] rotate-[-2deg] uppercase tracking-widest">
                                                            {getDateSeparator(msg.created_at)}
                                                        </span>
                                                    </div>
                                                )}
                                                {!isNewDay && isHourGap && (
                                                    <div className="flex justify-center my-5">
                                                        <span className="text-[10px] font-black text-stone-500 bg-white border-2 border-stone-900 px-3 py-1 shadow-[2px_2px_0_0_rgba(28,25,23,1)] rotate-[1deg]">
                                                            {msgTime(msg.created_at)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex w-full px-2 relative mt-2 ${isSent ? "justify-end" : "justify-start"}`}
                                                >
                                                    {!isSent && (
                                                        <div className="flex-shrink-0 mr-3 self-end mb-2 border-2 border-stone-900 rounded-full bg-[#f4f4f5] p-0.5 shadow-[2px_2px_0_0_rgba(28,25,23,1)]">
                                                            <Avatar
                                                                name={selectedConv.display_name || selectedConv.username}
                                                                url={selectedConv.avatar_url}
                                                                size={28}
                                                            />
                                                        </div>
                                                    )}
                                                    <motion.div
                                                        drag="x"
                                                        dragConstraints={{ left: -50, right: 0 }}
                                                        dragDirectionLock
                                                        dragElastic={0.1}
                                                        className={`max-w-[100%] sm:max-w-[75%] px-4 py-3 text-[15px] font-medium leading-relaxed relative z-10 border-2 border-stone-900 transition-transform hover:-translate-y-0.5 ${isSent
                                                            ? "bg-[#0891b2] text-white shadow-[4px_4px_0_0_rgba(28,25,23,1)] ml-auto"
                                                            : "bg-white text-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)]"
                                                            }`}
                                                    >
                                                        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                                                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                            {isSent && (
                                                                <div className="flex justify-end shrink-0 pb-0.5 ml-auto">
                                                                    {msg.is_read ? (
                                                                        <div className="relative w-[18px] h-[14px]" title="Read">
                                                                            <svg className="absolute left-0 w-[14px] h-[14px] text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            <svg className="absolute left-[5px] w-[14px] h-[14px] text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </div>
                                                                    ) : (
                                                                        <svg className="w-[14px] h-[14px] text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} title="Sent">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                    {/* Hidden timestamp */}
                                                    <div className="absolute right-[-45px] top-1/2 -translate-y-1/2 text-[11px] font-black text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity w-[45px] text-center select-none pointer-events-none z-0">
                                                        {msgTime(msg.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-6" />
                                </motion.div>
                            )}
                        </div>

                        {/* Input bar */}
                        <div className="shrink-0 px-4 py-4 border-t-4 border-stone-900 bg-[#fdfbf7] relative z-20">
                            {showEmojiPicker && (
                                <div className="absolute bottom-24 left-4 border-4 border-stone-900 shadow-[8px_8px_0_0_rgba(28,25,23,1)] bg-white rounded-none overflow-hidden z-50 p-1">
                                    <EmojiPicker height={350} searchDisabled theme="light" onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                            <div className="flex items-end gap-3">
                                <button
                                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                                    className="w-14 h-14 flex items-center justify-center border-2 border-stone-900 bg-[#fef08a] text-stone-900 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all shrink-0 shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                                >
                                    <FiSmile className="w-6 h-6" />
                                </button>
                                
                                <div className="flex-1 flex bg-white border-2 border-stone-900 shadow-[2px_2px_0_0_rgba(28,25,23,1)] focus-within:shadow-[6px_6px_0_0_rgba(28,25,23,1)] focus-within:-translate-y-1 focus-within:-translate-x-1 transition-all overflow-hidden min-h-[56px] p-1">
                                    <textarea
                                        ref={inputRef}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setShowEmojiPicker(false)}
                                        placeholder="Write something..."
                                        rows={1}
                                        className="flex-1 w-full resize-none bg-transparent py-3 px-3 text-base font-bold text-stone-900 placeholder-stone-400 focus:outline-none leading-snug no-scrollbar"
                                        style={{ maxHeight: "120px", overflow: "hidden" }}
                                        onInput={(e) => {
                                            const el = e.currentTarget;
                                            el.style.height = "auto";
                                            el.style.height = el.scrollHeight + "px";
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className={`w-16 h-14 border-2 border-stone-900 flex items-center justify-center shrink-0 transition-all shadow-[2px_2px_0_0_rgba(28,25,23,1)] ${inputText.trim()
                                        ? "bg-[#0891b2] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_rgba(28,25,23,1)] text-white active:translate-y-0 active:translate-x-0 active:shadow-none"
                                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                                        }`}
                                >
                                    <svg className="w-7 h-7 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Call Overlay */}
                        {callState !== "idle" && (
                            <motion.div
                                drag={window.innerWidth >= 640 && !isResizingCall}
                                dragMomentum={false}
                                className="fixed inset-0 sm:inset-auto sm:bottom-8 sm:right-8 z-[100] bg-stone-900 text-white flex flex-col border-4 border-stone-900 shadow-[12px_12px_0_0_rgba(28,25,23,1)] overflow-hidden"
                                style={{
                                    width: window.innerWidth < 640 ? "100%" : callWidth,
                                    height: window.innerWidth < 640 ? "100%" : callHeight
                                }}
                            >
                                <div
                                    className="hidden sm:flex absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-[110] items-center justify-center group"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setResizeStart({ x: e.clientX, y: e.clientY, w: callWidth, h: callHeight });
                                        setIsResizingCall(true);
                                    }}
                                >
                                    <div className="w-4 h-4 border-t-4 border-l-4 border-[#0891b2] group-hover:border-white transition-colors" />
                                </div>

                                <div className="hidden sm:flex h-10 w-full items-center justify-center cursor-move bg-[#fef08a] border-b-4 border-stone-900 shrink-0">
                                    <div className="flex gap-2 items-center text-stone-900 font-black uppercase text-xs tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-stone-900 animate-pulse" />
                                        Call Active
                                    </div>
                                </div>

                                {/* Call internal content */}
                                {callState === "receiving" ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 relative bg-[#fdfbf7] text-stone-900 w-full h-full pb-16"
                                        style={{backgroundImage: `radial-gradient(#1c1917 1px, transparent 1px)`, backgroundSize: `20px 20px`, backgroundPosition: `-10px -10px`}}>
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="border-4 border-stone-900 mb-6 p-2 bg-white shadow-[8px_8px_0_0_rgba(28,25,23,1)] rotate-[3deg]">
                                                <Avatar name={remoteDisplayName || callerId} url={remoteAvatarUrl} size={100} />
                                            </div>
                                            <div className="text-center space-y-2 mt-4">
                                                <p className="font-black tracking-widest text-sm uppercase bg-black text-white inline-block px-3 py-1 shadow-[4px_4px_0_0_rgba(28,25,23,0.2)] rotate-[-2deg]">Incoming {callType || "Voice"} Call</p>
                                                <h2 className="text-3xl font-black mt-4 uppercase stroke-black">{remoteDisplayName || getDisplayName(callerId)}</h2>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 mt-4">
                                            <button onClick={declineCall} className="w-16 h-16 bg-red-500 border-4 border-stone-900 flex items-center justify-center shadow-[6px_6px_0_0_rgba(28,25,23,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(28,25,23,1)] transition-all">
                                                <FiPhoneOff className="w-8 h-8 text-stone-900" />
                                            </button>
                                            <button onClick={acceptCall} className="w-16 h-16 bg-[#4ade80] border-4 border-stone-900 flex items-center justify-center shadow-[6px_6px_0_0_rgba(28,25,23,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(28,25,23,1)] transition-all animate-bounce">
                                                <FiPhone className="w-8 h-8 text-stone-900" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 relative bg-stone-900 flex flex-col">
                                        <div className="flex-1 relative">
                                            {callType === "video" ? (
                                                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover grayscale" style={{filter: 'contrast(1.2)'}} />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdfbf7] gap-6"
                                                     style={{backgroundImage: `radial-gradient(#1c1917 1px, transparent 1px)`, backgroundSize: `20px 20px`}}>
                                                    <div className="border-4 border-stone-900 p-2 bg-white shadow-[8px_8px_0_0_rgba(28,25,23,1)] relative z-10 rotate-[-2deg]">
                                                        <Avatar name={remoteDisplayName || callerId || selectedConv?.username} url={remoteAvatarUrl} size={120} />
                                                    </div>
                                                    <div className="text-center space-y-2 relative z-10 mt-4">
                                                        <h3 className="text-stone-900 font-black text-2xl uppercase tracking-tighter bg-[#fef08a] border-4 border-stone-900 px-4 py-2 shadow-[4px_4px_0_0_rgba(28,25,23,1)] rotate-[2deg]">
                                                            {remoteDisplayName || (selectedConv ? (selectedConv.display_name || selectedConv.username) : getDisplayName(callerId))}
                                                        </h3>
                                                        <p className="bg-black text-white border-2 border-stone-900 inline-block px-4 py-1 font-bold mt-2 rotate-[1deg]">
                                                            {callState === "calling" ? "Ringing..." : "Connected"}
                                                        </p>
                                                    </div>
                                                    <audio ref={remoteVideoRef} autoPlay playsInline className="w-0 h-0 opacity-0 absolute"/>
                                                </div>
                                            )}
                                        </div>
                                        {/* Local Video PiP */}
                                        <div className="absolute top-6 right-6 w-24 h-36 bg-white border-4 border-stone-900 shadow-[6px_6px_0_0_rgba(28,25,23,1)] z-20 overflow-hidden">
                                            {callType === "video" ? (
                                                <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover -scale-x-100 ${isVideoOff ? "hidden" : "block"}`} />
                                            ) : null}
                                            {(!callType || callType !== "video" || isVideoOff) && (
                                                <div className="w-full h-full flex items-center justify-center bg-[#f4f4f5]">
                                                    <Avatar name={currentUserId} url={localStorage.getItem("user_avatar_url") || localStorage.getItem("avatar_url")} size={60} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Call Controls */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 p-3 bg-[#fdfbf7] border-4 border-stone-900 shadow-[8px_8px_0_0_rgba(28,25,23,1)]">
                                            <button onClick={toggleMute} className={`w-12 h-12 border-2 border-stone-900 flex flex-col items-center justify-center transition-all shadow-[4px_4px_0_0_rgba(28,25,23,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_rgba(28,25,23,1)] ${isMuted ? 'bg-[#fef08a]' : 'bg-white'}`}>
                                                {isMuted ? <FiMicOff className="w-6 h-6 text-stone-900" /> : <FiMic className="w-6 h-6 text-stone-900" />}
                                            </button>
                                            <button onClick={endCall} className="w-14 h-14 bg-red-500 border-2 border-stone-900 flex items-center justify-center shadow-[4px_4px_0_0_rgba(28,25,23,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_rgba(28,25,23,1)] transition-all">
                                                <FiPhoneOff className="w-7 h-7 text-stone-900" />
                                            </button>
                                            {callType === "video" && (
                                                <button onClick={toggleVideo} className={`w-12 h-12 border-2 border-stone-900 flex items-center justify-center transition-all shadow-[4px_4px_0_0_rgba(28,25,23,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_rgba(28,25,23,1)] ${isVideoOff ? 'bg-[#fef08a]' : 'bg-white'}`}>
                                                    {isVideoOff ? <FiVideoOff className="w-6 h-6 text-stone-900" /> : <FiVideo className="w-6 h-6 text-stone-900" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                ) : (
                    // ── USER CARDS VIEW ───────────────────────────────────────
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent min-h-full z-10 w-full relative">
                        <div className="max-w-6xl mx-auto space-y-12 pb-24">
                            {/* Loading State */}
                            {loadingConvos ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
                                </div>
                            ) : (
                                <>
                                    {/* Recent Chats Section */}
                                    {filtered.length > 0 && (
                                        <section>
                                            <div className="inline-block bg-[#0891b2] text-white px-4 py-2 border-2 border-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] mb-8 rotate-[-1deg]">
                                                <h2 className="text-xl font-black uppercase tracking-widest text-[#fef08a]">Recent Chats</h2>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                                                {filtered.map((conv) => {
                                                    const peer = conv.other_user || conv.username;
                                                    const unreadCount = unread[peer] || 0;
                                                    const hasUnread = unreadCount > 0;
                                                    return (
                                                        <button
                                                            key={peer}
                                                            onClick={() => openChat(conv)}
                                                            className="relative bg-white border-4 border-stone-900 p-5 text-left hover:-translate-y-2 hover:-translate-x-1 transition-all group overflow-hidden"
                                                            style={{ boxShadow: "8px 8px 0px 0px rgba(28,25,23,1)", borderRadius: "0px" }}
                                                        >
                                                            {/* Background accent */}
                                                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#0891b2]/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                                                            <div className="flex gap-4 items-center relative z-10">
                                                                <div className="relative shrink-0">
                                                                    <div className="border-4 border-stone-900 rounded-full p-0.5 bg-[#fef08a] shadow-[2px_2px_0_0_rgba(28,25,23,1)]">
                                                                        <Avatar name={conv.display_name || conv.username} url={conv.avatar_url} size={50} />
                                                                    </div>
                                                                    {hasUnread && (
                                                                        <span className="absolute -top-3 -right-3 w-8 h-8 bg-[#fb7185] border-4 border-stone-900 text-stone-900 text-xs font-black rounded-full flex items-center justify-center pointer-events-none" style={{boxShadow: "2px 2px 0px 0px rgba(28,25,23,1)"}}>
                                                                            {unreadCount > 9 ? "9+" : unreadCount}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-col justify-start items-start mb-1">
                                                                        <h3 className="font-black text-lg truncate text-stone-900 group-hover:underline decoration-wavy decoration-2 underline-offset-4 decoration-[#0891b2] uppercase tracking-tight">{conv.display_name || conv.username}</h3>
                                                                        <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 border-2 border-stone-900 mt-1">{relativeTime(conv.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="line-clamp-2 text-sm mt-3 font-medium text-stone-600 border-t-2 border-stone-900 border-dashed pt-2 min-h-[44px]">
                                                                {conv.content}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}

                                    {/* Connections Section */}
                                    {connections.length > 0 && (
                                        <section className="pt-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="inline-block bg-[#fef08a] text-stone-900 px-4 py-2 border-2 border-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] rotate-[1deg]">
                                                    <h2 className="text-xl font-black uppercase tracking-widest">Start New</h2>
                                                </div>
                                                <button
                                                    onClick={() => setConnectionsOpen((o) => !o)}
                                                    className="w-10 h-10 border-4 border-stone-900 flex items-center justify-center hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(28,25,23,1)] bg-white transition-all shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                                                >
                                                    <svg
                                                        className={`w-6 h-6 text-stone-900 transition-transform duration-200 ${connectionsOpen ? "rotate-180" : ""}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {connectionsOpen && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                                    {(search ? newConnections : connections).length === 0 ? (
                                                        <div className="col-span-full border-4 border-stone-900 bg-white p-8 text-center shadow-[6px_6px_0_0_rgba(28,25,23,1)] rotate-[-1deg] max-w-md mx-auto">
                                                            <p className="font-black uppercase tracking-widest text-[#0891b2] text-xl">Nobody new here!</p>
                                                        </div>
                                                    ) : (
                                                        (search ? newConnections : connections).map((conn) => {
                                                            const peerId = conn.user_id || conn.username;
                                                            const alreadyChatted = existingPeers.has(peerId);
                                                            return (
                                                                <button
                                                                    key={peerId}
                                                                    onClick={() => alreadyChatted
                                                                        ? openChat(conversations.find((c) => (c.other_user || c.username) === peerId))
                                                                        : startNewChat(conn)
                                                                    }
                                                                    className="flex flex-col items-center bg-white border-4 border-stone-900 p-4 hover:-translate-y-2 hover:-translate-x-1 transition-transform shadow-[6px_6px_0_0_rgba(28,25,23,1)] group relative overflow-hidden"
                                                                >
                                                                    {/* Decorative background shape */}
                                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#f4f4f5] rounded-bl-full -z-0"></div>
                                                                    
                                                                    <div className="border-4 border-stone-900 p-0.5 bg-[#0891b2] shadow-[2px_2px_0_0_rgba(28,25,23,1)] rounded-full mb-3 relative z-10 transition-transform group-hover:scale-110">
                                                                        <div className="bg-white rounded-full p-0.5">
                                                                            <Avatar name={conn.display_name || conn.username} url={conn.avatar_url} size={64} />
                                                                        </div>
                                                                    </div>
                                                                    <h3 className="font-black text-sm sm:text-base text-stone-900 w-full text-center uppercase tracking-tight line-clamp-2 min-h-[3rem] z-10">{conn.display_name || conn.username}</h3>
                                                                    <p className="text-[10px] font-bold text-stone-500 truncate w-full text-center bg-stone-100 border border-stone-300 px-1 mt-1 z-10">@{conn.username}</p>
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {filtered.length === 0 && connections.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-lg mx-auto">
                                            <div className="w-24 h-24 border-4 border-stone-900 bg-[#fef08a] shadow-[8px_8px_0_0_rgba(28,25,23,1)] flex items-center justify-center mb-10 rotate-[5deg] hover:rotate-12 transition-transform cursor-crosshair">
                                                <svg className="w-12 h-12 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <div className="border-4 border-stone-900 p-8 bg-white shadow-[8px_8px_0_0_rgba(28,25,23,1)] rotate-[-2deg]">
                                                <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Quiet Zone</h3>
                                                <p className="font-bold text-stone-600 text-lg">No conversations or connections found. Try searching for someone or invite friends!</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
